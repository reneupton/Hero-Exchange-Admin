import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-auctions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auctions.component.html',
  styleUrl: './auctions.component.scss',
})
export class AuctionsComponent {
  placeholder = [
    { title: 'Nebula Pro Keyboard', status: 'Live', end: '24h', reserve: 900 },
    { title: 'Pulse 34" Ultrawide', status: 'Live', end: '18h', reserve: 1200 },
  ];
}
