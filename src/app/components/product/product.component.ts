import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductDetail } from '../../../models/product';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);

  product: ProductDetail | null = null;
  isLoading = false;
  errorMessage = '';
  selectedImage = '';

  ngOnInit(): void {
    this.scrollToTop();

    const id = Number(this.route.snapshot.paramMap.get('productid'));
    if (id) {
      this.loadProduct(id);
    }
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product = res;
        this.selectedImage = res.pictures?.[0] || 'https://via.placeholder.com/600';
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Ürün bulunamadı';
        this.isLoading = false;
      }
    });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  selectImage(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR').format(price);
  }
}
