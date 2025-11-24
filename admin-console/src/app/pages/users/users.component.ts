import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  placeholder = [
    { username: 'alice', flog: 1200, xp: 450, level: 3 },
    { username: 'bob', flog: 900, xp: 220, level: 2 },
  ];
}
