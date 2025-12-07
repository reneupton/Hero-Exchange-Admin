// Bots admin page: control simulation bots and view activity.
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-bots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bots.component.html',
  styleUrl: './bots.component.scss',
})
export class BotsComponent implements OnInit {
  running = false;
  status: any[] = [];
  config: any | null = null;
  configDraft: any = null;
  activity: any[] = [];
  loading = false;
  error = '';

  constructor(private api: AdminApiService) {}

  ngOnInit(): void {
    this.refreshAll();
  }

  /** Reloads status, config and recent activity. */
  refreshAll() {
    this.loadStatus();
    this.loadConfig();
    this.loadActivity();
  }

  /** Reads current bot runtime status. */
  loadStatus() {
    this.api.get<{ running: boolean; bots: any[] }>('bots/status').subscribe({
      next: (res) => {
        this.running = res.running;
        this.status = res.bots || [];
      },
      error: (err) => (this.error = err.message || 'Failed to load status'),
    });
  }

  /** Fetches persisted bot configuration. */
  loadConfig() {
    this.api.get<any>('bots/config').subscribe({
      next: (res) => {
        this.config = res;
        this.configDraft = { ...res };
      },
      error: (err) => (this.error = err.message || 'Failed to load config'),
    });
  }

  /** Fetches recent bot activity/events. */
  loadActivity() {
    this.api.get<{ events: any[] }>('bots/activity').subscribe({
      next: (res) => (this.activity = res.events || []),
      error: (err) => (this.error = err.message || 'Failed to load activity'),
    });
  }

  /** Starts bot workers. */
  startBots() {
    this.loading = true;
    this.api.post('bots/start', {}).subscribe({
      next: (res: any) => {
        this.running = true;
        this.status = res.bots || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to start bots';
        this.loading = false;
      },
    });
  }

  /** Stops bot workers. */
  stopBots() {
    this.loading = true;
    this.api.post('bots/stop', {}).subscribe({
      next: () => {
        this.running = false;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to stop bots';
        this.loading = false;
      },
    });
  }

  /** Persists configuration changes. */
  saveConfig() {
    if (!this.configDraft) {
      return;
    }
    this.loading = true;
    this.api.post('bots/config', this.configDraft).subscribe({
      next: (res: any) => {
        this.config = res.config;
        this.configDraft = { ...res.config };
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Failed to save config';
        this.loading = false;
      },
    });
  }
}
