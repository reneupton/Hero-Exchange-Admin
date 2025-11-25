import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auctions.component.html',
  styleUrl: './auctions.component.scss',
})
export class AuctionsComponent implements OnInit {
  auctions: any[] = [];
  loading = false;
  message = '';
  error = '';

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadAuctions();
  }

  loadAuctions() {
    this.loading = true;
    this.api.get<any[]>('auctions', { pageSize: 50 }).subscribe({
      next: (res) => {
        this.auctions = res || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to load auctions';
        this.loading = false;
      },
    });
  }

  finish(id: string) {
    this.api.post(`auctions/${id}/finish`, {}).subscribe({
      next: () => {
        this.showMessage('Auction marked as finished');
        this.loadAuctions();
      },
      error: (err) => (this.error = err.message || 'Failed to finish auction'),
    });
  }

  cancel(id: string) {
    this.api.post(`auctions/${id}/cancel`, {}).subscribe({
      next: () => {
        this.showMessage('Auction cancelled');
        this.loadAuctions();
      },
      error: (err) => (this.error = err.message || 'Failed to cancel auction'),
    });
  }

  reindexSearch() {
    this.api.post('search/reindex', {}).subscribe({
      next: () => this.showMessage('Search reindex started'),
      error: (err) => (this.error = err.message || 'Failed to trigger reindex'),
    });
  }

  private showMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = ''), 3000);
  }
}
