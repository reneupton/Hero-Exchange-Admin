// Root shell for admin console: config form + live event toasts.
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AdminConfigService } from './services/admin-config.service';
import { AdminSignalRService } from './services/admin-signalr.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  nav = [
    { path: '/', label: 'Dashboard', exact: true },
    { path: '/users', label: 'Users', exact: false },
    { path: '/auctions', label: 'Auctions', exact: false },
    { path: '/bots', label: 'Bots', exact: false },
  ];

  message = '';
  eventMessage = '';
  configForm = {
    apiBase: '',
    adminToken: '',
  };

  constructor(private config: AdminConfigService, private signalr: AdminSignalRService) {
    this.resetForm();
  }

  ngOnInit(): void {
    // open websocket connection and surface admin events as toast
    this.signalr.connect();
    this.signalr.onAuctionStatusChanged((evt) => {
      this.showEvent(`Auction ${evt.auctionId} -> ${evt.status}`);
    });
    this.signalr.onUserAvatarUpdated((evt) => {
      this.showEvent(`Avatar updated for ${evt.username}`);
    });
    this.signalr.onUserProgressAdjusted((evt) => {
      this.showEvent(`Progress updated for ${evt.username}`);
    });
  }

  /** Saves API config to localStorage via service. */
  saveConfig() {
    this.config.updateConfig(this.configForm);
    this.showMessage('Admin API config saved');
  }

  /** Resets form fields to persisted values. */
  resetForm() {
    this.configForm.apiBase = this.config.apiBase;
    this.configForm.adminToken = this.config.adminToken;
  }

  private showMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = ''), 2500);
  }

  private showEvent(msg: string) {
    this.eventMessage = msg;
    setTimeout(() => (this.eventMessage = ''), 4000);
  }
}
