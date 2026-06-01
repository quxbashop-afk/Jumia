export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  options: Record<string, string>; // e.g. { "Size": "M", "Color": "Blue" }
  price: number;
  originalPrice?: number;
  stock: number;
  sku?: string;
  imageUrl?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  imageUrls?: string[];
  fromDevice?: string[];
  rating: number;
  reviewsCount: number;
  description: string;
  stock: number;
  sellerId: string;
  sellerName: string;
  isFlashSale?: boolean;
  specifications?: Record<string, string>;
  isApproved?: boolean; // Vendor submission state
  brand?: string;
  createdAt?: number;
  reviews?: Array<{
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  options?: ProductOption[];
  variants?: ProductVariant[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalPrice: number;
  status: 'Pending' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  deliveryAddress: string;
  paymentMethod: string;
  expectedDelivery: string;
  customerEmail?: string;
  statusTimestamps?: Record<string, string>;
  // Expanded Checkout fields
  customerName?: string;
  customerPhone?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  orderNotes?: string;
  shippingMethod?: string;
  shippingFee?: number;
  discountCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  subtotal?: number;
  grandTotal?: number;
}

export interface UserAccount {
  email: string;
  name: string;
}

export interface Advertisement {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  imageUrl: string;
  videoUrl?: string;
  category: string;
  bgColor: string; // e.g. "from-purple-700 via-violet-500 to-fuchsia-400" or a simple preset key
  createdAt: number;
}


