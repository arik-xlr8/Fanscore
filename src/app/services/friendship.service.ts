import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FriendRatingHistory, FriendUser } from '../../models/friendship';
import { ApiMessageResponse } from '../../models/product';

@Injectable({
  providedIn: 'root'
})
export class FriendshipService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5153/api/Friendship';

  searchUsers(query: string): Observable<FriendUser[]> {
    return this.http.get<FriendUser[]>(`${this.baseUrl}/search`, {
      params: { q: query }
    });
  }

  getFriends(): Observable<FriendUser[]> {
    return this.http.get<FriendUser[]>(this.baseUrl);
  }

  getIncomingRequests(): Observable<FriendUser[]> {
    return this.http.get<FriendUser[]>(`${this.baseUrl}/requests`);
  }

  addFriend(userId: number): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/${userId}`, {});
  }

  removeFriend(userId: number): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.baseUrl}/${userId}`);
  }

  acceptRequest(userId: number): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.baseUrl}/requests/${userId}/accept`, {});
  }

  rejectRequest(userId: number): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.baseUrl}/requests/${userId}/reject`);
  }

  getFriendRatings(userId: number): Observable<FriendRatingHistory> {
    return this.http.get<FriendRatingHistory>(`${this.baseUrl}/${userId}/ratings`);
  }
}
