import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  cards = [
    { title: 'Active Auctions', value: '—', hint: 'Live listings' },
    { title: 'Bids / min', value: '—', hint: 'Bot + user flow' },
    { title: 'Bot Status', value: '—', hint: 'Running/Stopped' },
    { title: 'Errors', value: '0', hint: 'Last 15m' },
  ];
}
