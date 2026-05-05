import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, distinctUntilChanged, Subscription } from 'rxjs';

import { PlayerService } from '../../services/player.service';
import { RatingService } from '../../services/rating.service';
import { Player } from '../../../models/player';
import {
  PlayerComment,
  RatingReactionResult
} from '../../../models/rating';
import { RatingPanelComponent } from '../rating-panel/rating-panel.component';

type PeriodKey = 'daily' | 'weekly' | 'monthly' | '3months' | '1year';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, RatingPanelComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.css',
})
export class PlayerComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private ratingService = inject(RatingService);

  private routeParamSubscription?: Subscription;
  private queryParamSubscription?: Subscription;

  isLoading = false;
  error = '';

  player: Player | null = null;
  playerId: number | null = null;

  comments: PlayerComment[] = [];
  commentsLoading = false;
  commentsError = '';

  periods: { key: PeriodKey; label: string }[] = [
    { key: 'daily', label: 'Günlük' },
    { key: 'weekly', label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık' },
    { key: '3months', label: '3 Ay' },
    { key: '1year', label: '1 Yıl' },
  ];

  selectedPeriod: PeriodKey = 'monthly';

  ngOnInit(): void {
    this.readPeriodFromUrl();
    this.readPlayerIdFromUrl();
  }

  ngOnDestroy(): void {
    this.routeParamSubscription?.unsubscribe();
    this.queryParamSubscription?.unsubscribe();
  }

  selectPeriod(period: PeriodKey): void {
    if (this.selectedPeriod === period) return;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { period },
      queryParamsHandling: 'merge'
    });
  }

  private readPeriodFromUrl(): void {
    this.queryParamSubscription = this.route.queryParamMap.subscribe(params => {
      const periodFromUrl = params.get('period') as PeriodKey | null;

      const isValidPeriod = this.periods.some(p => p.key === periodFromUrl);

      this.selectedPeriod = isValidPeriod && periodFromUrl
        ? periodFromUrl
        : 'monthly';

      if (this.playerId != null) {
        this.loadPlayer();
      }
    });
  }

  private readPlayerIdFromUrl(): void {
    this.routeParamSubscription = this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        filter((id): id is string => !!id),
        map(id => Number(id)),
        filter(id => !isNaN(id)),
        distinctUntilChanged()
      )
      .subscribe({
        next: (playerId: number) => {
          this.playerId = playerId;
          this.loadPlayer();
          this.loadComments();
        },
        error: (err) => {
          console.error('Player route param okunamadı:', err);
          this.error = 'Oyuncu bilgileri yüklenemedi.';
        }
      });
  }

  private loadPlayer(): void {
    if (this.playerId == null) return;

    this.isLoading = true;
    this.error = '';

    this.playerService.getPlayerById(this.playerId, this.selectedPeriod).subscribe({
      next: (player: Player) => {
        this.player = player;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Oyuncu getirilemedi:', err);
        this.error = 'Oyuncu bilgileri yüklenemedi.';
        this.isLoading = false;
      }
    });
  }

  private loadComments(): void {
    if (this.playerId == null) return;

    this.commentsLoading = true;
    this.commentsError = '';

    this.ratingService.getPlayerComments(this.playerId).subscribe({
      next: (comments: PlayerComment[]) => {
        this.comments = comments.map(comment => ({
          ...comment,
          userReaction: comment.userReaction ?? 'none',
          isReacting: false
        }));
        this.commentsLoading = false;
      },
      error: (err) => {
        console.error('Yorumlar getirilemedi:', err);
        this.commentsError = 'Yorumlar yüklenemedi.';
        this.commentsLoading = false;
      }
    });
  }

  likeComment(comment: PlayerComment): void {
    if (comment.isReacting) return;

    comment.isReacting = true;

    this.ratingService.likeComment(comment.ratingId).subscribe({
      next: (result: RatingReactionResult) => {
        this.applyReactionResult(comment.ratingId, result);
      },
      error: (err) => {
        console.error('Like işlemi başarısız:', err);
        comment.isReacting = false;
      }
    });
  }

  dislikeComment(comment: PlayerComment): void {
    if (comment.isReacting) return;

    comment.isReacting = true;

    this.ratingService.dislikeComment(comment.ratingId).subscribe({
      next: (result: RatingReactionResult) => {
        this.applyReactionResult(comment.ratingId, result);
      },
      error: (err) => {
        console.error('Dislike işlemi başarısız:', err);
        comment.isReacting = false;
      }
    });
  }

  private applyReactionResult(ratingId: number, result: RatingReactionResult): void {
    const target = this.comments.find(c => c.ratingId === ratingId);
    if (!target) return;

    target.likeCount = result.likeCount;
    target.dislikeCount = result.dislikeCount;
    target.userReaction = result.userReaction;
    target.isReacting = false;

    this.comments = [...this.comments].sort((a, b) => {
      const totalA = a.likeCount + a.dislikeCount;
      const totalB = b.likeCount + b.dislikeCount;

      if (totalB !== totalA) return totalB - totalA;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  get fullName(): string {
    if (!this.player) return '';
    return `${this.player.name} ${this.player.surname}`.trim();
  }

  get teamName(): string {
    return this.player?.teamName ?? '-';
  }

  get position(): string {
    return this.player?.position ?? '-';
  }

  get age(): number {
    return this.player?.age ?? 0;
  }

  get photoUrl(): string {
    return this.player?.ppUrl || '../../../assets/images/Ekran Alıntısı.PNG';
  }

  get averageRating(): number {
    return this.player?.averageRating ?? 0;
  }

  get ratingCount(): number {
    return this.player?.ratingCount ?? 0;
  }

  get change(): number {
    return this.player?.change ?? 0;
  }

  get hasComments(): boolean {
    return this.comments.length > 0;
  }

  formatAverageRating(value: number): string {
    return value.toFixed(1);
  }

  formatChange(value: number): string {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  }

  formatCommentDate(date: string): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getChangeClass(value: number): string {
    if (value > 0) return 'pill pill--up';
    if (value < 0) return 'pill pill--down';
    return 'pill';
  }
}