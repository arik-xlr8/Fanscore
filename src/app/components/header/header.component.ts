import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MeResponse } from '../../../models/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  currentUser$: Observable<MeResponse | null>;
  isLoggedIn$ : Observable<boolean>;
  isMenuOpen = false;


  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void {
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  onLogout(): void {
  this.closeMenu();
  this.authService.logout().subscribe({
    next: () => {
      this.router.navigateByUrl('/login');
    },
    error: () => {
      this.authService.clearAuth();
      this.router.navigateByUrl('/login');
    }
  });
}

}
