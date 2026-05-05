import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Profile, MyRecentRating } from '../../../models/profile';

type PopupType = 'success' | 'error';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);

  isLoading = false;
  isSaving = false;
  isUploading = false;

  error = '';
  success = '';

  showMessagePopup = false;
  popupMessage = '';
  popupType: PopupType = 'error';

  profile: Profile | null = null;
  recentRatings: MyRecentRating[] = [];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    surname: ['', [Validators.required, Validators.maxLength(50)]],
    userName: ['', [Validators.required, Validators.maxLength(30)]]
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.error = '';
    this.success = '';
    this.closeMessagePopup();

    this.profileService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.recentRatings = profile.recentRatings ?? [];

        this.form.patchValue({
          name: profile.name ?? '',
          surname: profile.surname ?? '',
          userName: profile.userName ?? ''
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Profil alınamadı:', err);

        const message = this.getErrorMessage(
          err,
          'Profil bilgileri yüklenemedi.'
        );

        this.setError(message);
        this.isLoading = false;
      }
    });
  }

  save(): void {
    this.error = '';
    this.success = '';
    this.closeMessagePopup();

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      const message = this.getFormValidationMessage();
      this.setError(message);

      return;
    }

    this.isSaving = true;

    const name = this.form.value.name?.trim() ?? '';
    const surname = this.form.value.surname?.trim() ?? '';
    const userName = this.form.value.userName?.trim() ?? '';

    this.profileService.updateMyProfile({
      name,
      surname,
      userName,
      profilePic: this.profile?.profilePic ?? null
    }).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.recentRatings = profile.recentRatings ?? [];

        this.form.patchValue({
          name: profile.name ?? '',
          surname: profile.surname ?? '',
          userName: profile.userName ?? ''
        });

        this.setSuccess('Profil başarıyla güncellendi.');
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Profil güncellenemedi:', err);

        const message = this.getErrorMessage(
          err,
          'Profil güncellenemedi.'
        );

        this.setError(message);
        this.isSaving = false;
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.error = '';
    this.success = '';
    this.closeMessagePopup();

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeInMb = 5;
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.setError('Sadece JPG, PNG veya WEBP formatında fotoğraf yükleyebilirsiniz.');
      input.value = '';
      return;
    }

    if (file.size > maxSizeInBytes) {
      this.setError(`Fotoğraf boyutu en fazla ${maxSizeInMb} MB olabilir.`);
      input.value = '';
      return;
    }

    this.isUploading = true;

    this.profileService.uploadPhoto(file).subscribe({
      next: (result) => {
        if (this.profile) {
          this.profile.profilePic = result.url;
        }

        this.setSuccess('Profil fotoğrafı yüklendi.');
        this.isUploading = false;
        input.value = '';
      },
      error: (err) => {
        console.error('Fotoğraf yüklenemedi:', err);

        const message = this.getErrorMessage(
          err,
          'Fotoğraf yüklenemedi.'
        );

        this.setError(message);
        this.isUploading = false;
        input.value = '';
      }
    });
  }

  isFieldInvalid(fieldName: 'name' | 'surname' | 'userName'): boolean {
    const field = this.form.get(fieldName);

    return !!field && field.invalid && (field.dirty || field.touched);
  }

  get profilePic(): string {
    return this.profile?.profilePic || '../../../assets/images/Ekran Alıntısı.PNG';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('tr-TR');
  }

  closeMessagePopup(): void {
    this.showMessagePopup = false;
    this.popupMessage = '';
  }

  private setError(message: string): void {
    this.error = message;
    this.success = '';
    this.openMessagePopup(message, 'error');
  }

  private setSuccess(message: string): void {
    this.success = message;
    this.error = '';
    this.openMessagePopup(message, 'success');
  }

  private openMessagePopup(message: string, type: PopupType): void {
    this.popupMessage = message;
    this.popupType = type;
    this.showMessagePopup = true;
  }

  private getFormValidationMessage(): string {
    const name = this.form.get('name');
    const surname = this.form.get('surname');
    const userName = this.form.get('userName');

    if (name?.hasError('required')) {
      return 'Ad alanı boş bırakılamaz.';
    }

    if (surname?.hasError('required')) {
      return 'Soyad alanı boş bırakılamaz.';
    }

    if (userName?.hasError('required')) {
      return 'Kullanıcı adı boş bırakılamaz.';
    }

    if (name?.hasError('maxlength')) {
      return 'Ad en fazla 50 karakter olabilir.';
    }

    if (surname?.hasError('maxlength')) {
      return 'Soyad en fazla 50 karakter olabilir.';
    }

    if (userName?.hasError('maxlength')) {
      return 'Kullanıcı adı en fazla 30 karakter olabilir.';
    }

    return 'Lütfen profil bilgilerini kontrol edin.';
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
        return 'Giriş yapmadınız. Lütfen tekrar giriş yapın.';
      case 403:
        return 'Bu işlem için yetkiniz yok.';
      case 404:
        return 'Profil bulunamadı.';
      case 409:
        return 'Bu kullanıcı adı zaten kullanılıyor.';
      case 413:
        return 'Yüklediğiniz dosya çok büyük.';
      case 415:
        return 'Bu dosya formatı desteklenmiyor.';
      case 0:
        return 'Sunucuya ulaşılamıyor. Backend çalışıyor mu kontrol edin.';
      default:
        return fallback;
    }
  }
}