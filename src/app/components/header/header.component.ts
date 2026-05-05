import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MeResponse } from '../../../models/auth';
import { Observable } from 'rxjs';
import { FriendshipService } from '../../services/friendship.service';
import { FriendRatingHistory, FriendUser } from '../../../models/friendship';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  currentUser$: Observable<MeResponse | null>;
  isLoggedIn$ : Observable<boolean>;
  isMenuOpen = false;
  isFriendPanelOpen = false;
  friendSearchTerm = '';
  friendSearchResults: FriendUser[] = [];
  friends: FriendUser[] = [];
  incomingRequests: FriendUser[] = [];
  selectedFriendHistory: FriendRatingHistory | null = null;
  friendPanelMessage = '';
  friendPanelError = '';
  isFriendLoading = false;


  constructor(
    private authService: AuthService,
    private router: Router,
    private friendshipService: FriendshipService
  ) {
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

  isAdminToken(): boolean {
    return this.authService.isCurrentTokenAdmin();
  }

  shouldShowFriendButton(): boolean {
    return this.authService.getTokenRole() === 'user';
  }

  toggleFriendPanel(): void {
    this.isFriendPanelOpen = !this.isFriendPanelOpen;
    this.closeMenu();

    if (this.isFriendPanelOpen) {
      this.loadFriends();
    }
  }

  closeFriendPanel(): void {
    this.isFriendPanelOpen = false;
  }

  searchFriends(): void {
    const term = this.friendSearchTerm.trim();
    this.friendPanelMessage = '';
    this.friendPanelError = '';

    if (term.length < 2) {
      this.friendSearchResults = [];
      return;
    }

    this.friendshipService.searchUsers(term).subscribe({
      next: users => this.friendSearchResults = users,
      error: error => this.friendPanelError = error?.error?.message ?? 'Kullanici aranirken hata olustu.'
    });
  }

  addFriend(user: FriendUser): void {
    this.friendshipService.addFriend(user.userId).subscribe({
      next: response => {
        this.friendPanelMessage = response.message;
        this.friendPanelError = '';
        this.friendSearchTerm = '';
        this.friendSearchResults = [];
        this.loadFriends();
        this.loadIncomingRequests();
      },
      error: error => this.friendPanelError = error?.error?.message ?? 'Arkadas eklenemedi.'
    });
  }

  removeFriend(user: FriendUser): void {
    this.friendshipService.removeFriend(user.userId).subscribe({
      next: response => {
        this.friendPanelMessage = response.message;
        this.friendPanelError = '';
        this.selectedFriendHistory = null;
        this.loadFriends();
      },
      error: error => this.friendPanelError = error?.error?.message ?? 'Arkadas cikarilamadi.'
    });
  }

  acceptFriendRequest(user: FriendUser): void {
    this.friendshipService.acceptRequest(user.userId).subscribe({
      next: response => {
        this.friendPanelMessage = response.message;
        this.friendPanelError = '';
        this.loadFriends();
        this.loadIncomingRequests();
      },
      error: error => this.friendPanelError = error?.error?.message ?? 'Istek kabul edilemedi.'
    });
  }

  rejectFriendRequest(user: FriendUser): void {
    this.friendshipService.rejectRequest(user.userId).subscribe({
      next: response => {
        this.friendPanelMessage = response.message;
        this.friendPanelError = '';
        this.loadIncomingRequests();
      },
      error: error => this.friendPanelError = error?.error?.message ?? 'Istek reddedilemedi.'
    });
  }

  showFriendRatings(user: FriendUser): void {
    this.friendshipService.getFriendRatings(user.userId).subscribe({
      next: history => {
        this.selectedFriendHistory = history;
        this.friendPanelError = '';
      },
      error: error => this.friendPanelError = error?.error?.message ?? 'Rating gecmisi alinamadi.'
    });
  }

  friendDisplayName(user: FriendUser): string {
    const fullName = `${user.name ?? ''} ${user.surname ?? ''}`.trim();
    return fullName || user.userName || user.email;
  }

  formatFriendDate(date: string): string {
    return new Date(date).toLocaleString('tr-TR');
  }

  onLogout(): void {
  this.closeMenu();
  this.closeFriendPanel();
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

  private loadFriends(): void {
    this.isFriendLoading = true;

    this.friendshipService.getFriends().subscribe({
      next: friends => {
        this.friends = friends;
        this.isFriendLoading = false;
        this.loadIncomingRequests();
      },
      error: error => {
        this.friendPanelError = error?.error?.message ?? 'Arkadas listesi alinamadi.';
        this.isFriendLoading = false;
      }
    });
  }

  private loadIncomingRequests(): void {
    this.friendshipService.getIncomingRequests().subscribe({
      next: requests => this.incomingRequests = requests,
      error: error => this.friendPanelError = error?.error?.message ?? 'Arkadaslik istekleri alinamadi.'
    });
  }

}
