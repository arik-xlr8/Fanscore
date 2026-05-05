import { Player } from './player';
import { ProductList, ProductUpdate } from './product';
import { TournamentList, TournamentUpdate } from './tournament';

export interface AdminDashboardStats {
  userCount: number;
  bannedUserCount: number;
  productCount: number;
  halisahaCount: number;
  playerCount: number;
  ratingCount: number;
}

export interface AdminUser {
  userId: number;
  userName?: string | null;
  name?: string | null;
  surname?: string | null;
  email: string;
  role: string;
  createdAt?: string | null;
  isVerified: boolean;
  profilePic?: string | null;
  isBanned: boolean;
  banReason?: string | null;
  phoneNumber?: string | null;
}

export interface AdminPlayerPayload {
  name: string;
  surname: string;
  teamId?: number | null;
  age?: number | null;
  position?: string | null;
  ppUrl?: string | null;
}

export interface AdminPanelData {
  stats: AdminDashboardStats;
  users: AdminUser[];
  products: ProductList[];
  halisahas: TournamentList[];
  players: Player[];
}

export type AdminProductUpdate = ProductUpdate;
export type AdminHalisahaUpdate = TournamentUpdate;
