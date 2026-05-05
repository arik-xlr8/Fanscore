import { MyRecentRating } from './profile';

export interface FriendUser {
  userId: number;
  userName?: string | null;
  name?: string | null;
  surname?: string | null;
  email: string;
  profilePic?: string | null;
  friendSince?: string | null;
  status?: string | null;
  isIncomingRequest: boolean;
  isOutgoingRequest: boolean;
}

export interface FriendRatingHistory {
  friend: FriendUser;
  ratings: MyRecentRating[];
}
