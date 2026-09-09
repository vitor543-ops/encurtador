export type RotationMode = 'round_robin' | 'weighted' | 'random';

export interface LinkDestination {
  id: string;
  url: string;
  title: string;
  weight: number; // percentage (1-100)
  clicks: number;
  lastClickedAt?: string;
  isActive: boolean;
}

export interface ClickLog {
  id: string;
  timestamp: string;
  destinationId: string;
  destinationTitle: string;
  destinationUrl: string;
  ip?: string;
  userAgent?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  provider: 'traditional' | 'google';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface RotaLinkItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  type: 'single' | 'rotator';
  rotationMode: RotationMode;
  destinations: LinkDestination[];
  currentRotationIndex: number;
  totalClicks: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  recentClicks: ClickLog[];
  userId?: string;
  userEmail?: string;
}

export interface CreateLinkInput {
  title: string;
  slug?: string;
  type: 'single' | 'rotator';
  rotationMode: RotationMode;
  destinations: Array<{
    title: string;
    url: string;
    weight?: number;
  }>;
}

export interface UpdateLinkInput {
  title?: string;
  isActive?: boolean;
  rotationMode?: RotationMode;
  destinations?: Array<{
    id?: string;
    title: string;
    url: string;
    weight: number;
    isActive: boolean;
  }>;
}
