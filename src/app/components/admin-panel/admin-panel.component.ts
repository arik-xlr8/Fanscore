import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminPlayerPayload, AdminUser } from '../../../models/admin';
import { City, ProductCondition, ProductList, ProductUpdate } from '../../../models/product';
import { Player } from '../../../models/player';
import { Team } from '../../../models/team';
import { TournamentList, TournamentUpdate } from '../../../models/tournament';
import { AdminService } from '../../services/admin.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  activeTab: 'dashboard' | 'users' | 'products' | 'halisahas' | 'players' = 'dashboard';
  loading = false;
  errorMessage = '';
  successMessage = '';

  stats = {
    userCount: 0,
    bannedUserCount: 0,
    productCount: 0,
    halisahaCount: 0,
    playerCount: 0,
    ratingCount: 0
  };

  users: AdminUser[] = [];
  products: ProductList[] = [];
  halisahas: TournamentList[] = [];
  players: Player[] = [];
  cities: City[] = [];
  teams: Team[] = [];

  banReasons: Record<number, string> = {};
  productEdits: Record<number, ProductUpdate> = {};
  halisahaEdits: Record<number, TournamentUpdate> = {};
  playerEdits: Record<number, AdminPlayerPayload> = {};

  newPlayer: AdminPlayerPayload = {
    name: '',
    surname: '',
    teamId: null,
    age: null,
    position: '',
    ppUrl: ''
  };

  productConditions: ProductCondition[] = ['Sifir', 'AzKullanilmis', 'Iyi', 'Orta', 'Yipranmis'];

  constructor(
    private adminService: AdminService,
    private productService: ProductService
  ) {
  }

  ngOnInit(): void {
    this.loadPanel();
    this.loadLookups();
  }

  setTab(tab: 'dashboard' | 'users' | 'products' | 'halisahas' | 'players'): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  loadPanel(): void {
    this.loading = true;
    this.clearMessages();

    this.adminService.getPanelData().subscribe({
      next: data => {
        this.stats = data.stats;
        this.users = data.users;
        this.products = data.products;
        this.halisahas = data.halisahas;
        this.players = data.players;
        this.seedEditModels();
        this.loading = false;
      },
      error: error => {
        this.errorMessage = error?.error?.message ?? 'Admin verileri yuklenemedi.';
        this.loading = false;
      }
    });
  }

  loadLookups(): void {
    this.productService.getAllCities().subscribe({
      next: cities => this.cities = cities
    });

    this.productService.getAllTeams().subscribe({
      next: teams => this.teams = teams
    });
  }

  banUser(user: AdminUser): void {
    this.adminService.banUser(user.userId, this.banReasons[user.userId] ?? '').subscribe({
      next: response => this.afterAction(response.message),
      error: error => this.showError(error?.error?.message ?? 'Kullanici banlanamadi.')
    });
  }

  unbanUser(user: AdminUser): void {
    this.adminService.unbanUser(user.userId).subscribe({
      next: response => this.afterAction(response.message),
      error: error => this.showError(error?.error?.message ?? 'Ban kaldirilamadi.')
    });
  }

  changeRole(user: AdminUser, role: string): void {
    this.adminService.changeUserRole(user.userId, role).subscribe({
      next: response => this.afterAction(response.message),
      error: error => this.showError(error?.error?.message ?? 'Rol guncellenemedi.')
    });
  }

  updateProduct(product: ProductList): void {
    this.adminService.updateProduct(product.productId, this.productEdits[product.productId]).subscribe({
      next: response => this.afterAction(response.message),
      error: error => this.showError(error?.error?.message ?? 'Urun guncellenemedi.')
    });
  }

  deleteProduct(product: ProductList): void {
    if (!confirm(`${product.name} silinsin mi?`)) {
      return;
    }

    this.adminService.deleteProduct(product.productId).subscribe({
      next: response => this.afterAction(response.message),
      error: error => this.showError(error?.error?.message ?? 'Urun silinemedi.')
    });
  }

  updateHalisaha(hali: TournamentList): void {
    this.adminService.updateHalisaha(hali.haliSahaId, this.halisahaEdits[hali.haliSahaId]).subscribe({
      next: response => this.afterAction(response.message),
      error: error => this.showError(error?.error?.message ?? 'Hali saha guncellenemedi.')
    });
  }

  deleteHalisaha(hali: TournamentList): void {
    if (!confirm(`${hali.name} silinsin mi?`)) {
      return;
    }

    this.adminService.deleteHalisaha(hali.haliSahaId).subscribe({
      next: response => this.afterAction(response.message),
      error: error => this.showError(error?.error?.message ?? 'Hali saha silinemedi.')
    });
  }

  createPlayer(): void {
    this.adminService.createPlayer(this.normalizePlayerPayload(this.newPlayer)).subscribe({
      next: () => {
        this.newPlayer = { name: '', surname: '', teamId: null, age: null, position: '', ppUrl: '' };
        this.afterAction('Oyuncu eklendi.');
      },
      error: error => this.showError(error?.error?.message ?? 'Oyuncu eklenemedi.')
    });
  }

  updatePlayer(player: Player): void {
    this.adminService.updatePlayer(player.playerId, this.normalizePlayerPayload(this.playerEdits[player.playerId])).subscribe({
      next: () => this.afterAction('Oyuncu guncellendi.'),
      error: error => this.showError(error?.error?.message ?? 'Oyuncu guncellenemedi.')
    });
  }

  deletePlayer(player: Player): void {
    if (!confirm(`${player.name} ${player.surname} silinsin mi?`)) {
      return;
    }

    this.adminService.deletePlayer(player.playerId).subscribe({
      next: response => this.afterAction(response.message),
      error: error => this.showError(error?.error?.message ?? 'Oyuncu silinemedi.')
    });
  }

  private seedEditModels(): void {
    this.productEdits = {};
    this.halisahaEdits = {};
    this.playerEdits = {};

    this.products.forEach(product => {
      this.productEdits[product.productId] = {
        name: product.name,
        shortDescription: product.shortDescription ?? '',
        description: '',
        price: product.price,
        teamId: product.teamId ?? null,
        cityId: product.cityId,
        condition: (product.condition as ProductCondition) ?? 'Iyi'
      };
    });

    this.halisahas.forEach(hali => {
      this.halisahaEdits[hali.haliSahaId] = {
        name: hali.name,
        description: hali.description ?? '',
        cityId: hali.cityId,
        price: hali.price,
        teamSize: hali.teamSize
      };
    });

    this.players.forEach(player => {
      this.playerEdits[player.playerId] = {
        name: player.name,
        surname: player.surname,
        teamId: player.teamId,
        age: player.age,
        position: player.position,
        ppUrl: player.ppUrl
      };
    });
  }

  private normalizePlayerPayload(payload: AdminPlayerPayload): AdminPlayerPayload {
    return {
      ...payload,
      teamId: payload.teamId ? Number(payload.teamId) : null,
      age: payload.age ? Number(payload.age) : null,
      position: payload.position || null,
      ppUrl: payload.ppUrl || null
    };
  }

  private afterAction(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    this.loadPanel();
  }

  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
