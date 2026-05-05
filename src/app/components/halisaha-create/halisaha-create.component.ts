import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { City, TournamentCreate } from '../../../models/tournament';

type PopupType = 'success' | 'error';

@Component({
  selector: 'app-halisaha-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './halisaha-create.component.html',
  styleUrl: './halisaha-create.component.css'
})
export class HalisahaCreateComponent implements OnInit {
  private tournamentService = inject(TournamentService);

  cities: City[] = [];

  model: TournamentCreate = {
    name: '',
    description: '',
    cityId: 0,
    price: 0,
    teamSize: 10
  };

  loading = false;
  error: string | null = null;
  success: string | null = null;

  showMessagePopup = false;
  popupMessage = '';
  popupType: PopupType = 'error';

  ngOnInit(): void {
    this.loadCities();
  }

  onSubmit(form: NgForm): void {
    this.error = null;
    this.success = null;
    this.closeMessagePopup();

    if (this.loading) {
      return;
    }

    if (form.invalid || this.model.cityId <= 0) {
      form.control.markAllAsTouched();

      const message = this.getValidationMessage();
      this.setError(message);

      return;
    }

    const payload: TournamentCreate = {
      name: this.model.name.trim(),
      description: this.model.description?.trim() || '',
      cityId: this.model.cityId,
      price: Number(this.model.price),
      teamSize: Number(this.model.teamSize)
    };

    this.loading = true;

    this.tournamentService.createTournament(payload).subscribe({
      next: (res) => {
        console.log(res);

        this.loading = false;
        this.setSuccess('Halısaha başarıyla oluşturuldu 🎉');

        this.model = {
          name: '',
          description: '',
          cityId: 0,
          price: 0,
          teamSize: 10
        };

        form.resetForm(this.model);
      },
      error: (err) => {
        console.error(err);

        const message = this.getErrorMessage(
          err,
          'Oluşturulamadı. Bilgileri kontrol edip tekrar dene.'
        );

        this.loading = false;
        this.setError(message);
      }
    });
  }

  closeMessagePopup(): void {
    this.showMessagePopup = false;
    this.popupMessage = '';
  }

  private loadCities(): void {
    this.tournamentService.getAllCities().subscribe({
      next: (res) => {
        this.cities = res;
      },
      error: (err) => {
        console.error('Şehirler alınamadı:', err);

        this.cities = [];
        this.setError('Şehirler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
      }
    });
  }

  private getValidationMessage(): string {
    if (!this.model.name || !this.model.name.trim()) {
      return 'Maç adı boş bırakılamaz.';
    }

    if (!this.model.cityId || this.model.cityId <= 0) {
      return 'Lütfen bir şehir seçin.';
    }

    if (!this.model.teamSize || Number(this.model.teamSize) < 1) {
      return 'Takım boyutu en az 1 olmalıdır.';
    }

    if (this.model.price === null || this.model.price === undefined || Number(this.model.price) < 0) {
      return 'Maç ücreti 0 veya daha büyük olmalıdır.';
    }

    return 'Lütfen ilan bilgilerini kontrol edin.';
  }

  private setError(message: string): void {
    this.error = message;
    this.success = null;

    this.popupType = 'error';
    this.popupMessage = message;
    this.showMessagePopup = true;
  }

  private setSuccess(message: string): void {
    this.success = message;
    this.error = null;

    this.popupType = 'success';
    this.popupMessage = message;
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
      case 400:
        return 'Gönderilen bilgiler hatalı. Lütfen alanları kontrol edin.';
      case 401:
        return 'Giriş yapmadınız. İlan oluşturmak için lütfen giriş yapın.';
      case 403:
        return 'Bu işlem için yetkiniz yok.';
      case 404:
        return 'Gerekli kayıt bulunamadı.';
      case 409:
        return 'Bu ilan başka bir işlemle çakışıyor. Sayfayı yenileyip tekrar deneyin.';
      case 0:
        return 'Sunucuya ulaşılamıyor. Backend çalışıyor mu kontrol edin.';
      default:
        return fallback;
    }
  }
}