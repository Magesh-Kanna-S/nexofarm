export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'farmer' | 'consumer' | 'admin';
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  landSize?: number;
  landType?: string;
  pestManagement?: string;
  cropCalendar?: {
    crop: string;
    sowingDate: string;
    harvestDate: string;
  }[];
  cropTypes?: string[];
  householdSize?: number;
  subscriptionPlan?: 'free' | 'premium' | 'enterprise';
  language?: string;
  moneySaved?: number;
}

export interface Cluster {
  clusterId: string;
  center: {
    lat: number;
    lng: number;
  };
  radius: number;
}

export interface Subscription {
  subscriptionId: string;
  consumerUid: string;
  clusterId: string;
  items: {
    crop: string;
    quantity: number;
  }[];
  frequency: 'weekly' | 'monthly';
  status: 'active' | 'paused' | 'cancelled';
}

export interface Advisory {
  advisoryId: string;
  farmerUid: string;
  clusterId: string;
  crop: string;
  recommendedQuantity: number;
  sowingWindow: string;
  harvestTimeline: string;
  reasoning: string;
  healthStatus?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  pestRisk?: 'Low' | 'Medium' | 'High';
  lat?: number;
  lng?: number;
}

export interface Order {
  orderId: string;
  consumerUid: string;
  farmerUid: string;
  clusterId: string;
  items: {
    crop: string;
    quantity: number;
    price: number;
  }[];
  status: 'pending' | 'harvested' | 'dispatched' | 'delivered';
  createdAt: string;
  deliveredAt?: string;
  totalAmount: number;
}

export interface BasketItem {
  id: number;
  name: string;
  price: number;
  unit: string;
  farm: string;
  stock: number;
  quantity: number;
  healthBenefits?: string;
  cookingTips?: string;
  popularity?: string;
  funFact?: string;
}

export interface PreOrderRequest {
  id: string;
  consumerUid: string;
  crop: string;
  quantity: number;
  unit: string;
  maxPrice: number;
  deadline: string;
  status: 'open' | 'fulfilled' | 'expired';
}
