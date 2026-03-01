import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
type Player = {
  id: number;
  name: string;
  team: string;
  position: string;
  value: number;
  change: number;
};

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent implements OnInit {
  players: Player[] = [];
  recentMatches = [
  {
    home: 'Real Madrid',
    away: 'Barcelona',
    homeScore: 3,
    awayScore: 1,
    date: '12 Mar 2026',
    league: 'La Liga'
  },
  {
    home: 'Man City',
    away: 'Arsenal',
    homeScore: 2,
    awayScore: 2,
    date: '11 Mar 2026',
    league: 'Premier League'
  },
  {
    home: 'Galatasaray',
    away: 'Fenerbahçe',
    homeScore: 1,
    awayScore: 0,
    date: '10 Mar 2026',
    league: 'Süper Lig'
  },
  {
    home: 'Bayern',
    away: 'Dortmund',
    homeScore: 4,
    awayScore: 2,
    date: '09 Mar 2026',
    league: 'Bundesliga'
  }
];
  selectedPlayer: Player | null = null;

  isLoading = false;
  isEnd = false;

  private page = 0;
  private pageSize = 18;
  private maxPages = 6;

  ngOnInit() {
    this.loadNextPage();
  }

  trackById = (_: number, p: Player) => p.id;

  selectPlayer(player: Player) {
    this.selectedPlayer = player;
  }

  onHeatmapScroll(e: Event) {
    if (this.isLoading || this.isEnd) return;

    const el = e.target as HTMLElement;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 200;

    if (nearBottom) {
      this.loadNextPage();
    }
  }

  private loadNextPage() {
    if (this.isLoading || this.isEnd) return;

    this.isLoading = true;

    this.mockApiFetchPlayers(this.page, this.pageSize).then(newItems => {
      if (newItems.length === 0) {
        this.isEnd = true;
        this.isLoading = false;
        return;
      }

      this.players = [...this.players, ...newItems];
      this.page++;
      this.isLoading = false;
    });
  }

  private mockApiFetchPlayers(page: number, pageSize: number): Promise<Player[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        if (page >= this.maxPages) {
          resolve([]);
          return;
        }

        const baseId = page * pageSize;

        const poolNames = [
          'Lionel Messi', 'Cristiano Ronaldo', 'Kylian Mbappé', 'Erling Haaland',
          'Jude Bellingham', 'Kevin De Bruyne', 'Vinícius Júnior', 'Mohamed Salah',
          'Harry Kane', 'Robert Lewandowski', 'Rodri', 'Neymar Jr.',
          'Arda Güler', 'Hakan Çalhanoğlu', 'Mauro Icardi', 'Edin Džeko',
          'Lautaro Martínez', 'Bukayo Saka', 'Phil Foden', 'Bernardo Silva',
          'Heung-min Son', 'Victor Osimhen', 'Pedri', 'Gavi',
          'Virgil van Dijk', 'Alisson Becker', 'Thibaut Courtois', 'Achraf Hakimi',
          'Bruno Fernandes', 'Marcus Rashford', 'Khvicha Kvaratskhelia', 'Jamāl Musiala'
        ];

        const teams = [
          'Real Madrid', 'Barcelona', 'Man City', 'Liverpool', 'Arsenal',
          'Inter', 'PSG', 'Bayern', 'Galatasaray', 'Fenerbahçe', 'Napoli', 'Man United'
        ];

        const positions = ['ST', 'RW', 'LW', 'AM', 'CM', 'DM', 'CB', 'RB', 'GK'];

        const items: Player[] = Array.from({ length: pageSize }).map((_, i) => {
          const id = baseId + i + 1;
          const name = poolNames[(baseId + i) % poolNames.length];
          const team = teams[(baseId + i * 2) % teams.length];
          const position = positions[(baseId + i * 3) % positions.length];

          const value = 55 + ((baseId + i) % 46); // 55..100
          const change = this.round1((Math.sin((id + 3) * 0.9) * 6) + (Math.cos((id + 1) * 0.35) * 2)); // ~ -8..+8

          return { id, name, team, position, value, change };
        });

        resolve(items);
      }, 550);
    });
  }

  getColor(change: number) {
    const c = this.clamp(change, -10, 10);
    const t = (c + 10) / 20;
    const hue = 0 + t * 120;
    return `hsl(${hue} 78% 38%)`;
  }

  getSizeByChange(change: number) {
    const abs = Math.abs(change);

    if (abs >= 6) return { col: 3, row: 22 };
    if (abs >= 4) return { col: 3, row: 18 };
    if (abs >= 2) return { col: 2, row: 14 };
    return { col: 2, row: 10 };
  }

  formatChange(change: number) {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  }

  private clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
  }

  private round1(n: number) {
    return Math.round(n * 10) / 10;
  }
}
