import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from '../../models/player';

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5153/api/Player';

  getAllPlayers(periodType?: string): Observable<Player[]> {
    let url = this.baseUrl;

    if (periodType) {
      url += `?periodType=${periodType}`;
    }

    return this.http.get<Player[]>(url);
  }

  getPlayerById(playerId: number, periodType?: string): Observable<Player> {
    let url = `${this.baseUrl}/${playerId}`;

    if (periodType) {
      url += `?periodType=${periodType}`;
    }

    return this.http.get<Player>(url);
  }

  getShuffledPlayers(periodType?: string): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.baseUrl}/shuffle`, {
      params: periodType ? { periodType } : {}
    });
  }

  searchPlayers(searchTerm?: string, periodType?: string): Observable<Player[]> {
    const params: Record<string, string> = {};

    if (searchTerm) params['searchTerm'] = searchTerm;
    if (periodType) params['periodType'] = periodType;

    return this.http.get<Player[]>(`${this.baseUrl}/search`, { params });
  }

  getAllPlayersPaged(
    periodType: string,
    page: number,
    pageSize: number
  ): Observable<PagedResult<Player>> {
    const params = new HttpParams()
      .set('periodType', periodType)
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<Player>>(`${this.baseUrl}/paged`, {
      params
    });
  }

  getShuffledPlayersPaged(
    periodType: string,
    page: number,
    pageSize: number,
    shuffleSeed: number
  ): Observable<PagedResult<Player>> {
    const params = new HttpParams()
      .set('periodType', periodType)
      .set('page', page)
      .set('pageSize', pageSize)
      .set('shuffleSeed', shuffleSeed);

    return this.http.get<PagedResult<Player>>(`${this.baseUrl}/shuffle-paged`, {
      params
    });
  }

  searchPlayersPaged(
    searchTerm: string,
    periodType: string,
    page: number,
    pageSize: number
  ): Observable<PagedResult<Player>> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('periodType', periodType)
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<PagedResult<Player>>(`${this.baseUrl}/search-paged`, {
      params
    });
  }
}