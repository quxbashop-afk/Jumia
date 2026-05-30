export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  imageUrls?: string[];
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
}

export interface CartItem {
  product: Product;
  quantity: number;
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
}

export interface UserAccount {
  email: string;
  name: string;
}

