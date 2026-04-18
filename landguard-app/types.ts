export type AppRole = 'buyer' | 'seller' | 'admin' | 'government' | null;

export interface UserSession {
  role: AppRole;
  token: string;
  userId?: string;
  user?: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: AppRole;
  };
}

export interface ParcelItem {
  id: string;
  name: string;
  location: string;
  gpsAddress: string;
  price: number;
  size: number;
  status: 'available' | 'under_offer' | 'sold' | 'disputed';
  verified: boolean;
  center: [number, number];
  polygon?: [number, number][];
  images?: string[];
  createdBy: string;
  createdAt: string;
}

export interface PropertyListing {
  id: string;
  digitalAddress?: string;
  region: string;
  district: string;
  propertyTitle: string;
  transactionType: 'sale' | 'rent';
  category: string;
  size: number;
  price: number;
  description: string;
  features: string[];
  negotiable: boolean;
  contactMethod: 'phone' | 'email' | 'whatsapp';
  images: string[];
  documents: string[];
  polygon?: [number, number][];
  verified?: boolean;
  status?: 'draft' | 'published' | 'under_offer' | 'sold';
  createdAt?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: AppRole;
  profileImage?: string;
  dateOfBirth?: string;
  idType?: string;
  idNumber?: string;
  verified: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'alert' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
