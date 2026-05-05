import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RatingService } from '../../services/rating.service';
import {
  CreateRatingRequest,
  RatingPeriodType,
  VoteAvailability
} from '../../../models/rating';

type PopupType = 'success' | 'error';

@Component({
  selector: 'app-rating-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating-panel.component.html',
  styleUrl: './rating-panel.component.css'
})
export class RatingPanelComponent implements OnInit, OnChanges {
  private ratingService = inject(RatingService);

  @Input({ required: true }) playerId!: number;

  @Input() selectedPeriod: RatingPeriodType = 'monthly';

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();
  @Output() periodChanged = new EventEmitter<RatingPeriodType>();

  periods: { key: RatingPeriodType; label: string }[] = [
    { key: 'daily', label: 'Günlük' },
    { key: 'weekly', label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık' },
    { key: '3months', label: '3 Ay' },
    { key: '1year', label: '1 Yıl' }
  ];

  ratingValue: number | null = null;
  comment = '';

  canVoteInfo: VoteAvailability | null = null;

  isCheckingAvailability = false;
  isSubmitting = false;

  error = '';
  successMessage = '';

  showMessagePopup = false;
  popupMessage = '';
  popupType: PopupType = 'error';

  ngOnInit(): void {
    if (this.playerId > 0) {
      this.checkAvailability();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['playerId'] || changes['selectedPeriod']) {
      this.resetMessages();

      if (this.playerId > 0) {
        this.checkAvailability();
      }
    }
  }

  onPeriodChange(period: RatingPeriodType): void {
    if (this.selectedPeriod === period) return;

    this.selectedPeriod = period;
    this.periodChanged.emit(period);

    this.resetMessages();
    this.checkAvailability();
  }

  checkAvailability(): void {
    if (!this.playerId || this.playerId <= 0) {
      this.setError('Geçerli bir oyuncu bulunamadı.');
      return;
    }

    this.isCheckingAvailability = true;
    this.error = '';
    this.successMessage = '';
    this.canVoteInfo = null;

    this.ratingService.checkCanVote(this.playerId, this.selectedPeriod).subscribe({
      next: (result: VoteAvailability) => {
        this.canVoteInfo = result;
        this.isCheckingAvailability = false;
      },
      error: (err) => {
        console.error('Oy kullanılabilirlik kontrolü başarısız:', err);

        const message = this.getErrorMessage(
          err,
          'Oy hakkı kontrol edilemedi.'
        );

        this.setError(message);
        this.isCheckingAvailability = false;
      }
    });
  }

  submitVote(): void {
    this.resetMessages();

    if (this.isSubmitting || this.isCheckingAvailability) {
      return;
    }

    if (!this.playerId || this.playerId <= 0) {
      this.setError('Geçerli bir oyuncu bulunamadı.');
      return;
    }

    if (this.ratingValue === null || this.ratingValue === undefined) {
      this.setError('Lütfen bir değer gir.');
      return;
    }

    const numericRating = Number(this.ratingValue);

    if (Number.isNaN(numericRating)) {
      this.setError('Lütfen geçerli bir sayı gir.');
      return;
    }

    if (numericRating < 0 || numericRating > 300) {
      this.setError('Değer 0 ile 300 arasında olmalı.');
      return;
    }

    if (this.canVoteInfo && !this.canVoteInfo.canVote) {
      this.setError(
        this.canVoteInfo.message ||
          'Bu zaman aralığı için şu an oy veremezsiniz.'
      );
      return;
    }

    const payload: CreateRatingRequest = {
      playerId: this.playerId,
      periodType: this.selectedPeriod,
      ratingValue: numericRating,
      comment: this.comment.trim() ? this.comment.trim() : null
    };

    this.isSubmitting = true;

    this.ratingService.createRating(payload).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.ratingValue = null;
        this.comment = '';

        this.setSuccess('Oyun başarıyla kaydedildi.');

        this.checkAvailability();
        this.submitted.emit();
      },
      error: (err) => {
        console.error('Oy gönderilemedi:', err);

        const message = this.getErrorMessage(err, 'Oy gönderilemedi.');
        this.setError(message);

        this.isSubmitting = false;
      }
    });
  }

  closePanel(): void {
    this.closed.emit();
  }

  closeMessagePopup(): void {
    this.showMessagePopup = false;
  }

  clampRating(): void {
    if (this.ratingValue === null || this.ratingValue === undefined) return;

    const numericRating = Number(this.ratingValue);

    if (Number.isNaN(numericRating)) {
      this.ratingValue = null;
      return;
    }

    let clampedValue = numericRating;

    if (clampedValue < 0) clampedValue = 0;
    if (clampedValue > 300) clampedValue = 300;

    this.ratingValue = Math.round(clampedValue * 10) / 10;
  }

  get canSubmit(): boolean {
    if (this.isSubmitting || this.isCheckingAvailability) return false;
    if (!this.playerId || this.playerId <= 0) return false;

    if (this.ratingValue === null || this.ratingValue === undefined) {
      return false;
    }

    const numericRating = Number(this.ratingValue);

    if (Number.isNaN(numericRating)) return false;
    if (numericRating < 0 || numericRating > 300) return false;

    if (this.canVoteInfo && !this.canVoteInfo.canVote) return false;

    return true;
  }

  get availabilityMessage(): string {
    if (this.isCheckingAvailability) {
      return 'Oy hakkın kontrol ediliyor...';
    }

    if (this.error) {
      return this.error;
    }

    if (this.successMessage) {
      return this.successMessage;
    }

    if (this.canVoteInfo?.message) {
      return this.canVoteInfo.message;
    }

    return 'Bir zaman aralığı seçip oy verebilirsin.';
  }

  get nextAvailableText(): string {
    if (!this.canVoteInfo?.nextAvailableAt) return '';

    const date = new Date(this.canVoteInfo.nextAvailableAt);

    return `Tekrar oy verebileceğin zaman: ${date.toLocaleString('tr-TR')}`;
  }

  private setError(message: string): void {
    this.error = message;
    this.successMessage = '';
    this.openMessagePopup(message, 'error');
  }

  private setSuccess(message: string): void {
    this.successMessage = message;
    this.error = '';
    this.openMessagePopup(message, 'success');
  }

  private openMessagePopup(message: string, type: PopupType): void {
    this.popupMessage = message;
    this.popupType = type;
    this.showMessagePopup = true;
  }

  private getErrorMessage(err: any, fallback: string): string {
    if (err?.error?.message) {
      return err.error.message;
    }

    if (typeof err?.error === 'string') {
      return err.error;
    }

    switch (err?.status) {
      case 401:
        return 'Giriş yapmadınız. Oy verebilmek için lütfen giriş yapın.';
      case 403:
        return 'Bu işlem için yetkiniz yok.';
      case 400:
        return 'Gönderilen bilgiler hatalı.';
      case 404:
        return 'Oyuncu bulunamadı.';
      case 409:
        return 'Bu zaman aralığı için şu an tekrar oy veremezsiniz.';
      case 0:
        return 'Sunucuya ulaşılamıyor. Backend çalışıyor mu kontrol edin.';
      default:
        return fallback;
    }
  }

  private resetMessages(): void {
    this.error = '';
    this.successMessage = '';
    this.showMessagePopup = false;
    this.popupMessage = '';
  }
}