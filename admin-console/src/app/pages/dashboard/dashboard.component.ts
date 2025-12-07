// Dashboard admin page: aggregates quick metrics across services.
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface DashboardCard {
  title: string;
  value: string | number;
  hint: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  cards: DashboardCard[] = [
    { title: 'Active Auctions', value: '-', hint: 'Live listings' },
    { title: 'Users', value: '-', hint: 'Progress service' },
    { title: 'Bots', value: '-', hint: 'Running/Stopped' },
    { title: 'Errors', value: '-', hint: 'Bots with last error' },
  ];

  lastUpdated: Date | null = null;
  error = '';
  loading = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  /**
   * Pulls auctions, bots, and user counts concurrently and maps into dashboard cards.
   * Uses catchError to keep the card layout stable even if one call fails.
   */
  loadMetrics() {
    this.loading = true;
    this.error = '';

    forkJoin({
      auctions: this.api.get<any[]>('auctions', { pageSize: 100 }).pipe(catchError(() => of([]))),
      bots: this.api.get<{ running: boolean; bots: any[] }>('bots/status').pipe(
        catchError(() => of({ running: false, bots: [] }))
      ),
      users: this.api.get<any[]>('admin/progress/users', { pageSize: 50 }).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ auctions, bots, users }) => {
        const activeAuctions =
          (auctions as any[]).filter((a) => (a.status || '').toLowerCase() === 'active').length || (auctions as any[]).length;
        const errorBots = (bots.bots || []).filter((b: any) => !!b.lastError).length;

        this.cards = [
          { title: 'Active Auctions', value: activeAuctions, hint: `${(auctions as any[]).length} total` },
          { title: 'Users', value: (users as any[]).length || '0', hint: 'Progress accounts' },
          { title: 'Bots', value: bots.running ? 'Running' : 'Stopped', hint: `${(bots.bots || []).length} workers` },
          { title: 'Errors', value: errorBots, hint: 'Bots with last error' },
        ];

        this.lastUpdated = new Date();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load metrics';
        this.loading = false;
      },
    });
  }
}
