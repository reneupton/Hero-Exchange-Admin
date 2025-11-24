import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { AuctionsComponent } from './pages/auctions/auctions.component';
import { BotsComponent } from './pages/bots/bots.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'auctions', component: AuctionsComponent },
  { path: 'bots', component: BotsComponent },
];
