import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AdminConfigService } from './services/admin-config.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  nav = [
    { path: '/', label: 'Dashboard', exact: true },
    { path: '/users', label: 'Users', exact: false },
    { path: '/auctions', label: 'Auctions', exact: false },
    { path: '/bots', label: 'Bots', exact: false },
  ];

  message = '';
  configForm = {
    apiBase: '',
    adminToken: '',
  };

  constructor(private config: AdminConfigService) {
    this.resetForm();
  }

  saveConfig() {
    this.config.updateConfig(this.configForm);
    this.showMessage('Admin API config saved');
  }

  resetForm() {
    this.configForm.apiBase = this.config.apiBase;
    this.configForm.adminToken = this.config.adminToken;
  }

  private showMessage(msg: string) {
    this.message = msg;
    setTimeout(() => (this.message = ''), 2500);
  }
}
