import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TournamentDetail } from '../../../models/tournament';
import { TournamentService } from '../../services/tournament.service';

@Component({
  selector: 'app-halisaha-detay',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './halisaha-detay.component.html',
  styleUrl: './halisaha-detay.component.css'
})
export class HalisahaDetayComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tournamentService = inject(TournamentService);

  tournament: TournamentDetail | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.scrollToTop();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadTournament(id);
    } else {
      this.errorMessage = 'Geçersiz halı saha ilanı.';
    }
  }

  loadTournament(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.tournamentService.getTournamentById(id).subscribe({
      next: (res) => {
        this.tournament = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Halı saha ilanı bulunamadı.';
        this.isLoading = false;
      }
    });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('tr-TR').format(price);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  formatTeamSize(teamSize: number): string {
    return `${teamSize}v${teamSize}`;
  }
}
