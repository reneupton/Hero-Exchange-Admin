// Auctions admin page: manage auctions and trigger search reindex.
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auctions.component.html',
  styleUrl: './auctions.component.scss',
})
export class AuctionsComponent implements OnInit {
  auctions: any[] = [];
  loading = false;
  message = '';
  error = '';
  searchTerm = '';

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.loadAuctions();
  }

  /**
   * Client-side filter for auctions by id/title/status.
   */
  get filteredAuctions() {
    const term = (this.searchTerm || '').trim().toLowerCase();
    if (!term) return this.auctions;
    return this.auctions.filter((a) => {
      const id = (a.id || '').toString().toLowerCase();
      const shortId = this.formatShortId(a.id).toLowerCase();
      return (
        id.includes(term) ||
        shortId.includes(term) ||
        (a.title || '').toLowerCase().includes(term) ||
        (a.status || '').toLowerCase().includes(term)
      );
    });
  }

  /**
   * Formats a compact uppercase id for display.
   */
  formatShortId(id: string) {
    return (id || '').replace(/-/g, '').slice(0, 8).toUpperCase();
  }

  /**
   * Loads auctions from admin API.
   */
  loadAuctions() {
    this.loading = true;
    this.api.get<any[]>('admin/auctions', { pageSize: 50 }).subscribe({
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

  /**
   * Marks an auction as finished and refreshes list.
   */
  finish(id: string) {
    this.api.post(`admin/auctions/${id}/finish`, {}).subscribe({
      next: () => {
        this.showMessage('Auction marked as finished');
        this.loadAuctions();
      },
      error: (err) => (this.error = err.message || 'Failed to finish auction'),
    });
  }

  /**
   * Cancels an auction and refreshes list.
   */
  cancel(id: string) {
    this.api.post(`admin/auctions/${id}/cancel`, {}).subscribe({
      next: () => {
        this.showMessage('Auction cancelled');
        this.loadAuctions();
      },
      error: (err) => (this.error = err.message || 'Failed to cancel auction'),
    });
  }

  /**
   * Triggers a search reindex job.
   */
  reindexSearch() {
    this.api.post('admin/search/reindex', {}).subscribe({
      next: () => this.showMessage('Search reindex started'),
      error: (err) => (this.error = err.message || 'Failed to trigger reindex'),
    });
  }

  /** Displays a transient confirmation toast. */
  private showMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = ''), 3000);
  }
}
