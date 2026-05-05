export type PeriodKey = 'daily' | 'weekly' | 'monthly' | '3months' | '1year';
export type ViewMode = 'trends' | 'shuffle';

export interface Player {
  playerId: number;
  name: string;
  surname: string;
  teamId: number | null;
  teamName: string | null;
  age: number | null;
  position: string | null;
  ppUrl: string | null;
  averageRating: number | null;
  ratingCount: number;
  change: number | null;
}

export interface PlayerRating {
  ratingId: number;
  userId: number;
  ratingValue: number;
  comment: string | null;
  createdAt: string;
  periodType: string;
}

export interface PlayerDetail {
  playerId: number;
  name: string;
  surname: string;
  teamId: number | null;
  teamName: string | null;
  age: number | null;
  position: string | null;
  ppUrl: string | null;
  averageRating: number | null;
  ratingCount: number;
  ratings: PlayerRating[];
}

export interface HeatmapPlayer {
  id: number;
  name: string;
  team: string;
  position: string;
  averageRating: number;
  ratingCount: number;
  change: number;
  ppUrl?: string;
};

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}