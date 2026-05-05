import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { City, ProductCondition, Team } from '../../../models/product';

type PopupType = 'success' | 'error';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.css'
})
export class ProductCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private router = inject(Router);

  cities: City[] = [];
  teams: Team[] = [];

  isSubmitting = false;
  errorMessage = '';

  showMessagePopup = false;
  popupMessage = '';
  popupType: PopupType = 'error';

  fileInputs: { id: number; file: File | null }[] = [];
  private fileInputId = 0;

  conditions: ProductCondition[] = [
    'Sifir',
    'AzKullanilmis',
    'Iyi',
    'Orta',
    'Yipranmis'
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    shortDescription: ['', [Validators.maxLength(255)]],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(1)]],
    teamId: [null as number | null],
    cityId: [null as number | null, [Validators.required]],
    condition: ['Iyi' as ProductCondition, [Validators.required]]
  });

  ngOnInit(): void {
    this.loadCities();
    this.loadTeams();
  }

  addFileInput(): void {
    this.fileInputs.push({
      id: ++this.fileInputId,
      file: null
    });
  }

  removeFileInput(index: number): void {
    this.fileInputs.splice(index, 1);
  }

  trackByFileInputId(index: number, item: { id: number; file: File | null }): number {
    return item.id;
  }

  onSingleFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) return;

    this.closeMessagePopup();
    this.errorMessage = '';

    const file = input.files[0];

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeInMb = 5;
    const maxSizeInBytes = maxSizeInMb * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      this.fileInputs[index].file = null;
      input.value = '';

      this.setError('Sadece JPG, PNG veya WEBP formatında fotoğraf yükleyebilirsiniz.');
      return;
    }

    if (file.size > maxSizeInBytes) {
      this.fileInputs[index].file = null;
      input.value = '';

      this.setError(`Fotoğraf boyutu en fazla ${maxSizeInMb} MB olabilir.`);
      return;
    }

    this.fileInputs[index].file = file;
  }

  submit(): void {
    this.errorMessage = '';
    this.closeMessagePopup();

    if (this.isSubmitting) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      const validationMessage = this.getFormValidationMessage();
      this.setError(validationMessage);

      return;
    }

    this.isSubmitting = true;

    const value = this.form.getRawValue();
    const formData = new FormData();

    formData.append('Name', value.name?.trim() || '');
    formData.append('ShortDescription', value.shortDescription?.trim() || '');
    formData.append('Description', value.description?.trim() || '');
    formData.append('Price', String(value.price));
    formData.append('CityId', String(value.cityId));
    formData.append('Condition', value.condition!);

    if (value.teamId) {
      formData.append('TeamId', String(value.teamId));
    }

    this.fileInputs.forEach(item => {
      if (item.file) {
        formData.append('Pictures', item.file);
      }
    });

    this.productService.createProduct(formData).subscribe({
      next: (res) => {
        this.setSuccess('Ürün ilanı başarıyla oluşturuldu.');
        this.router.navigate(['/merch', res.productId]);
      },
      error: (err) => {
        console.error('Ürün oluşturulamadı:', err);

        const message = this.getErrorMessage(
          err,
          'Ürün oluşturulamadı. Bilgileri kontrol edip tekrar dene.'
        );

        this.errorMessage = message;
        this.setError(message);

        this.isSubmitting = false;
      }
    });
  }

  isFieldInvalid(
    fieldName: 'name' | 'shortDescription' | 'price' | 'cityId' | 'condition'
  ): boolean {
    const field = this.form.get(fieldName);

    return !!field && field.invalid && (field.dirty || field.touched);
  }

  closeMessagePopup(): void {
    this.showMessagePopup = false;
    this.popupMessage = '';
  }

  private setError(message: string): void {
    this.popupType = 'error';
    this.popupMessage = message;
    this.showMessagePopup = true;
    this.errorMessage = message;
  }

  private setSuccess(message: string): void {
    this.popupType = 'success';
    this.popupMessage = message;
    this.showMessagePopup = true;
    this.errorMessage = '';
  }

  private getFormValidationMessage(): string {
    const name = this.form.controls.name;
    const shortDescription = this.form.controls.shortDescription;
    const price = this.form.controls.price;
    const cityId = this.form.controls.cityId;
    const condition = this.form.controls.condition;

    if (name.hasError('required')) {
      return 'Ürün adı boş bırakılamaz.';
    }

    if (name.hasError('maxlength')) {
      return 'Ürün adı en fazla 120 karakter olabilir.';
    }

    if (price.hasError('required')) {
      return 'Fiyat boş bırakılamaz.';
    }

    if (price.hasError('min')) {
      return 'Fiyat en az 1 ₺ olmalıdır.';
    }

    if (cityId.hasError('required')) {
      return 'Lütfen bir şehir seçin.';
    }

    if (condition.hasError('required')) {
      return 'Lütfen ürün durumunu seçin.';
    }

    if (shortDescription.hasError('maxlength')) {
      return 'Kısa açıklama en fazla 255 karakter olabilir.';
    }

    return 'Lütfen ilan bilgilerini kontrol edin.';
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

  private loadCities(): void {
    this.productService.getAllCities().subscribe({
      next: (res) => this.cities = res,
      error: (err) => {
        console.error('Şehirler alınamadı:', err);
        this.cities = [];

        this.setError('Şehirler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.');
      }
    });
  }

  private loadTeams(): void {
    this.productService.getAllTeams().subscribe({
      next: (res) => this.teams = res,
      error: (err) => {
        console.error('Takımlar alınamadı:', err);
        this.teams = [];

        this.setError('Takımlar yüklenemedi. Takım seçmeden de ilan oluşturabilirsin.');
      }
    });
  }

  formatCondition(condition?: string | null): string {
    if (!condition) return '';

    const map: Record<string, string> = {
      Sifir: 'Sıfır',
      AzKullanilmis: 'Az Kullanılmış',
      Iyi: 'İyi',
      Orta: 'Orta',
      Yipranmis: 'Yıpranmış'
    };

    return map[condition] || condition;
  }
}