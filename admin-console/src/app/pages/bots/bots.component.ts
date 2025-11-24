import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-bots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bots.component.html',
  styleUrl: './bots.component.scss',
})
export class BotsComponent {
  status = [
    { name: 'alice', running: true, bids: 0, auctions: 0, lastError: null },
    { name: 'bob', running: true, bids: 0, auctions: 0, lastError: null },
  ];
}
