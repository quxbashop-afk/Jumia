# Firebase Security Specification & TDD

## 1. Data Invariants

- **Users**: A user document `/users/{userId}` stores user identity (`name` and `email`). Only the authenticated user matching `{userId}` can read or write their own user document.
- **Products**: Any visitor (authenticated or anonymous) can read products. However, only authenticated admin users (default: `quxbashop@gmail.com`) are allowed to create, update (approve/reject), or delete products.
- **Orders**: An order must be tied to an authenticated customer. Only the authenticated customer with the matching email can read/write their own orders. Only admin users can read all orders.

---

## 2. The "Dirty Dozen" Payloads (Aesthetic & Logic Breakers)

Here are 12 malicious payloads or operational attempts designed to break database security:

### Payload 1: Unauthorized Profile Creation (Identity Hijacking)
- **Path**: `/users/attacker_user_id`
- **Auth**: `userId: victim_user_id`
- **Attempt**: Create user profile with a UID that does not belong to the sender.
- **Expected**: `PERMISSION_DENIED`

### Payload 2: Profile Update Spoofing
- **Path**: `/users/victim_user_id`
- **Auth**: `userId: attacker_user_id`
- **Attempt**: Attacker edit victim's profile email or name.
- **Expected**: `PERMISSION_DENIED`

### Payload 3: Product Creation by Customer (Privilege Escalation)
- **Path**: `/products/some_product_id`
- **Auth**: `userId: regular_user` (Email: `customer@gmail.com`)
- **Attempt**: Non-admin user attempts to create/add a new product.
- **Expected**: `PERMISSION_DENIED`

### Payload 4: Invalid Product ID Injection (ID Poisoning)
- **Path**: `/products/invalid/sub/document` or `/products/a-very-long-id-longer-than-128-chars-...-abc`
- **Auth**: `userId: admin_user` (Email: `quxbashop@gmail.com`)
- **Attempt**: Inject a path, subcollection, or a massive string as a product document ID.
- **Expected**: `PERMISSION_DENIED`

### Payload 5: Product Deletion by Stranger
- **Path**: `/products/existing_product_id`
- **Auth**: `userId: regular_user` (Email: `hacker@gmail.com`)
- **Attempt**: Unauthorized product deletion.
- **Expected**: `PERMISSION_DENIED`

### Payload 6: Double-Approval Bypass / Self-Approval of Unapproved Product
- **Path**: `/products/new_product`
- **Auth**: `userId: seller_user` (Email: `seller_user@gmail.com`)
- **Attempt**: Directly approve our own uploaded product (`isApproved: true`) during submission.
- **Expected**: `PERMISSION_DENIED`

### Payload 7: Empty/Invalid Schema Injection (Type Poisoning)
- **Path**: `/products/bad_product`
- **Auth**: `userId: admin_user` (Email: `quxbashop@gmail.com`)
- **Attempt**: Add a product with price as a string instead of number, or negative price list.
- **Expected**: `PERMISSION_DENIED`

### Payload 8: Order Creation Under Victim's Email (Order Hijacking)
- **Path**: `/orders/some_order_id`
- **Auth**: `userId: customer` (Email: `villain@gmail.com`)
- **Attempt**: Create an order where `customerEmail` is set to `victim@gmail.com`.
- **Expected**: `PERMISSION_DENIED`

### Payload 9: Empty Order Items Bypass (Zero-Price Integrity Break)
- **Path**: `/orders/empty_order`
- **Auth**: `userId: customer` (Email: `customer@gmail.com`)
- **Attempt**: Submit an order with empty or malformed fields, violating type constraints.
- **Expected**: `PERMISSION_DENIED`

### Payload 10: Unauthorized Order Reading
- **Path**: `/orders/victim_order_id` (placed by `victim@gmail.com`)
- **Auth**: `userId: attacker` (Email: `attacker@gmail.com`)
- **Attempt**: Query or get single order of another customer.
- **Expected**: `PERMISSION_DENIED`

### Payload 11: Counterfeit Temporal Stamp Injection (Client Timestamp Spoof)
- **Path**: `/products/new_product`
- **Auth**: `userId: admin_user` (Email: `quxbashop@gmail.com`)
- **Attempt**: Create a product with `createdAt` set to a future or custom past date, instead of `request.time`.
- **Expected**: `PERMISSION_DENIED`

### Payload 12: Order Status Bypass (Illegal State Transition)
- **Path**: `/orders/some_order`
- **Auth**: `userId: customer` (Email: `customer@gmail.com`)
- **Attempt**: Change status directly from 'Pending' to 'Delivered' without shipping.
- **Expected**: `PERMISSION_DENIED`

---

## 3. The Test Suite (`firestore.rules.test.ts`)

A clean TypeScript test configuration representing our security specs:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Ecommerce App Security Rules Test Suite', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0721826624',
      firestore: {
        host: 'localhost',
        port: 8080,
      },
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('Payload 1: should reject unauthorized profile creation under foreign uid', async () => {
    const context = testEnv.authenticatedContext('attacker_user_id');
    const db = context.firestore();
    await assertFails(
      db.collection('users').doc('victim_user_id').set({
        name: 'Spoofed User',
        email: 'attacker@gmail.com',
      })
    );
  });

  it('Payload 3: should reject product creation by non-admin customer', async () => {
    const context = testEnv.authenticatedContext('customer_id', { email: 'customer@gmail.com' });
    const db = context.firestore();
    await assertFails(
      db.collection('products').doc('p123').set({
        name: 'Malicious Item',
        price: 999,
        sellerId: 'customer_id',
      })
    );
  });

  it('Payload 8: should reject spoofed customer email during order creation', async () => {
    const context = testEnv.authenticatedContext('cust123', { email: 'villain@gmail.com' });
    const db = context.firestore();
    await assertFails(
      db.collection('orders').doc('order_id').set({
        id: 'order_id',
        customerEmail: 'victim@gmail.com',
        totalPrice: 15000,
        status: 'Pending',
      })
    );
  });
});
```
