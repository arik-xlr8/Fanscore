import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { PlayerService } from '../../services/player.service';
import { HeatmapPlayer, PeriodKey, Player, ViewMode } from '../../../models/player';
import { MatchService } from '../../services/match.service';
import { RecentMatch } from '../../../models/recent-match';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit, OnDestroy {
  private playerService = inject(PlayerService);
  private matchService = inject(MatchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  players: HeatmapPlayer[] = [];
  recentMatches: RecentMatch[] = [];
  selectedPlayer: HeatmapPlayer | null = null;

  isLoading = false;
  isEnd = false;

  selectedMode: ViewMode = 'trends';
  searchTerm = '';

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private routeSubscription?: Subscription;

  periods: { key: PeriodKey; label: string }[] = [
    { key: 'daily', label: 'Günlük' },
    { key: 'weekly', label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık' },
    { key: '3months', label: '3 Ay' },
    { key: '1year', label: '1 Yıl' }
  ];

  selectedPeriod: PeriodKey = 'monthly';

  ngOnInit(): void {
    this.setupSearch();
    this.readPeriodFromUrl();
    this.getRecentMatches();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  trackById = (_: number, p: HeatmapPlayer) => p.id;

  selectPlayer(player: HeatmapPlayer): void {
    this.selectedPlayer = player;
  }

  selectPeriod(period: PeriodKey): void {
    if (this.selectedPeriod === period) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { period },
      queryParamsHandling: 'merge'
    });
  }

  selectMode(mode: ViewMode): void {
    if (mode === 'shuffle') {
      this.searchTerm = '';
      this.selectedMode = 'shuffle';
      this.getPlayers();
      return;
    }

    if (this.selectedMode === mode && !this.searchTerm.trim()) return;

    this.selectedMode = mode;
    this.getPlayers();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.selectedMode = 'trends';
    this.getPlayers();
  }

  onHeatmapScroll(_e: Event): void {
    // Şimdilik backend'den hepsini tek seferde çekiyoruz.
  }

  private readPeriodFromUrl(): void {
    this.routeSubscription = this.route.queryParamMap.subscribe(params => {
      const periodFromUrl = params.get('period') as PeriodKey | null;

      const isValidPeriod = this.periods.some(p => p.key === periodFromUrl);

      this.selectedPeriod = isValidPeriod && periodFromUrl
        ? periodFromUrl
        : 'monthly';

      this.getPlayers();
    });
  }

  private setupSearch(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe((term: string) => {
        if (term.trim()) {
          this.selectedMode = 'trends';
        }

        this.getPlayers();
      });
  }

  private getRecentMatches(): void {
    this.matchService.getRecentSuperLigMatches().subscribe({
      next: (matches: RecentMatch[]) => {
        this.recentMatches = matches;
      },
      error: (err) => {
        console.error('Süper Lig maçları alınamadı:', err);
        this.recentMatches = [];
      }
    });
  }

  private getPlayers(): void {
    this.isLoading = true;
    this.isEnd = false;

    const trimmedSearch = this.searchTerm.trim();

    const request$ = trimmedSearch
      ? this.playerService.searchPlayers(trimmedSearch, this.selectedPeriod)
      : this.selectedMode === 'shuffle'
      ? this.playerService.getShuffledPlayers(this.selectedPeriod)
      : this.playerService.getAllPlayers(this.selectedPeriod);

    request$.subscribe({
      next: (players: Player[]) => {
        this.players = players.map((player) => this.mapToHeatmapPlayer(player));
        this.isLoading = false;
        this.isEnd = true;
      },
      error: (err) => {
        console.error('Oyuncular alınamadı:', err);
        this.players = [];
        this.isLoading = false;
        this.isEnd = true;
      }
    });
  }

  private mapToHeatmapPlayer(player: Player): HeatmapPlayer {
    return {
      id: player.playerId,
      name: `${player.name} ${player.surname}`,
      team: player.teamName ?? '-',
      position: player.position ?? '-',
      averageRating: player.averageRating ?? 0,
      ratingCount: player.ratingCount ?? 0,
      change: player.change ?? 0,
      ppUrl: player.ppUrl ?? '/assets/default-player.png'
    };
  }

  getBackgroundImage(ppUrl?: string): string {
    if (!ppUrl) {
      return 'url(/assets/default-player.png)';
    }

    return `url(${ppUrl})`;
  }

  getSizeByChange(change: number) {
    const abs = Math.abs(change);

    if (abs >= 50) return { col: 3, row: 22 };
    if (abs >= 30) return { col: 3, row: 18 };
    if (abs >= 15) return { col: 2, row: 14 };
    return { col: 2, row: 10 };
  }

  formatAverageRating(averageRating: number): string {
    return averageRating.toFixed(1);
  }

  formatChange(change: number): string {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  getChangeClass(change: number): string {
    if (change > 0) return 'badge badge--up';
    if (change < 0) return 'badge badge--down';
    return 'badge';
  }

  getBorderColor(change: number): string {
    const clamped = Math.max(-100, Math.min(100, change));
    const hue = 60 + (clamped * 60) / 100;
    const light = 45 + Math.min(Math.abs(change), 100) * 0.2;

    return `hsl(${hue}, 85%, ${light}%)`;
  }
}