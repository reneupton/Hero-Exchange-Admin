// Dashboard admin page: aggregates quick metrics across services.
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface DashboardCard {
  title: string;
  value: string | number;
  hint: string;
  icon: string;
  color: string;
}

interface RecentAuction {
  id: string;
  title: string;
  status: string;
  currentHighBid: number;
  seller: string;
  auctionEnd: Date;
}

interface RecentUser {
  username: string;
  balance: number;
  auctionsWon: number;
  level: number;
}

interface BotInfo {
  name: string;
  status: string;
  lastAction?: string;
  lastError?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  cards: DashboardCard[] = [
    { title: 'Active Auctions', value: '-', hint: 'Live listings', icon: '🔨', color: 'purple' },
    { title: 'Total Users', value: '-', hint: 'Progress service', icon: '👥', color: 'blue' },
    { title: 'Bot Status', value: '-', hint: 'Running/Stopped', icon: '🤖', color: 'green' },
    { title: 'Errors', value: '-', hint: 'Bots with errors', icon: '⚠️', color: 'red' },
  ];

  recentAuctions: RecentAuction[] = [];
  recentUsers: RecentUser[] = [];
  botsList: BotInfo[] = [];
  botsRunning = false;

  lastUpdated: Date | null = null;
  error = '';
  loading = false;

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics() {
    this.loading = true;
    this.error = '';

    forkJoin({
      auctions: this.api.get<any[]>('admin/auctions', { pageSize: 100 }).pipe(catchError(() => of([]))),
      bots: this.api.get<{ running: boolean; bots: any[] }>('admin/bots/status').pipe(
        catchError(() => of({ running: false, bots: [] }))
      ),
      users: this.api.get<any[]>('admin/progress/users', { pageSize: 50 }).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ auctions, bots, users }) => {
        const auctionList = auctions as any[];
        const userList = users as any[];
        const botList = bots.bots || [];

        const activeAuctions = auctionList.filter((a) => (a.status || '').toLowerCase() === 'live').length;
        const errorBots = botList.filter((b: any) => !!b.lastError).length;

        this.cards = [
          { title: 'Active Auctions', value: activeAuctions, hint: `${auctionList.length} total`, icon: '🔨', color: 'purple' },
          { title: 'Total Users', value: userList.length || '0', hint: 'Progress accounts', icon: '👥', color: 'blue' },
          { title: 'Bot Status', value: bots.running ? 'Running' : 'Stopped', hint: `${botList.length} workers`, icon: '🤖', color: bots.running ? 'green' : 'orange' },
          { title: 'Errors', value: errorBots, hint: 'Bots with errors', icon: '⚠️', color: errorBots > 0 ? 'red' : 'green' },
        ];

        // Recent auctions (last 5, sorted by end date)
        this.recentAuctions = auctionList
          .sort((a, b) => new Date(b.auctionEnd || b.endDate || 0).getTime() - new Date(a.auctionEnd || a.endDate || 0).getTime())
          .slice(0, 5)
          .map((a) => ({
            id: a.id,
            title: a.title || a.make + ' ' + a.model || 'Untitled',
            status: a.status || 'Unknown',
            currentHighBid: a.currentHighBid || a.reservePrice || 0,
            seller: a.seller || 'Unknown',
            auctionEnd: new Date(a.auctionEnd || a.endDate),
          }));

        // Recent users (top 5 by balance or level)
        this.recentUsers = userList
          .sort((a, b) => (b.balance || 0) - (a.balance || 0))
          .slice(0, 5)
          .map((u) => ({
            username: u.username || u.userName || 'Anonymous',
            balance: u.balance || 0,
            auctionsWon: u.auctionsWon || 0,
            level: u.level || 1,
          }));

        // Bot details
        this.botsRunning = bots.running;
        this.botsList = botList.slice(0, 5).map((b: any) => ({
          name: b.name || b.id || 'Bot',
          status: b.lastError ? 'Error' : 'OK',
          lastAction: b.lastAction,
          lastError: b.lastError,
        }));

        this.lastUpdated = new Date();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load metrics';
        this.loading = false;
      },
    });
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'live' || s === 'active') return 'status-live';
    if (s === 'finished' || s === 'sold') return 'status-finished';
    if (s === 'reservenotmet') return 'status-reserve';
    return 'status-default';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
  }
}
