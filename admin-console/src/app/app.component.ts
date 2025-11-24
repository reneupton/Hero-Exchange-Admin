import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  nav = [
    { path: '/', label: 'Dashboard', exact: true },
    { path: '/users', label: 'Users' },
    { path: '/auctions', label: 'Auctions' },
    { path: '/bots', label: 'Bots' },
  ];
}
