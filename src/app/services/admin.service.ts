import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminDashboardStats,
  AdminHalisahaUpdate,
  AdminPanelData,
  AdminPlayerPayload,
  AdminProductUpdate,
  AdminUser
} from '../../models/admin';
import { ApiMessageResponse } from '../../models/product';
import { Player } from '../../models/player';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5153/api/Admin';
  private readonly playerUrl = 'http://localhost:5153/api/Player';

  getPanelData(): Observable<AdminPanelData> {
    return this.http.get<AdminPanelData>(`${this.baseUrl}/panel`);
  }

  getStats(): Observable<AdminDashboardStats> {
    return this.http.get<AdminDashboardStats>(`${this.baseUrl}/stats`);
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/users`);
  }

  banUser(userId: number, banReason: string): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.baseUrl}/users/${userId}/ban`, { banReason });
  }

  unbanUser(userId: number): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.baseUrl}/users/${userId}/unban`, {});
  }

  changeUserRole(userId: number, role: string): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.baseUrl}/users/${userId}/role`, { role });
  }

  updateProduct(productId: number, payload: AdminProductUpdate): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.baseUrl}/products/${productId}`, payload);
  }

  deleteProduct(productId: number): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.baseUrl}/products/${productId}`);
  }

  updateHalisaha(haliSahaId: number, payload: AdminHalisahaUpdate): Observable<ApiMessageResponse> {
    return this.http.put<ApiMessageResponse>(`${this.baseUrl}/halisahas/${haliSahaId}`, payload);
  }

  deleteHalisaha(haliSahaId: number): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.baseUrl}/halisahas/${haliSahaId}`);
  }

  createPlayer(payload: AdminPlayerPayload): Observable<Player> {
    return this.http.post<Player>(this.playerUrl, payload);
  }

  updatePlayer(playerId: number, payload: AdminPlayerPayload): Observable<Player> {
    return this.http.put<Player>(`${this.playerUrl}/${playerId}`, payload);
  }

  deletePlayer(playerId: number): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.playerUrl}/${playerId}`);
  }
}
