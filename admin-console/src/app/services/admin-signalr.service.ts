import { Injectable, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environments/environment';

export interface AuctionStatusChangedEvent {
  auctionId: string;
  status: string;
  changedBy?: string;
  changedAt: string;
}

export interface UserAvatarUpdatedEvent {
  username: string;
  avatarUrl: string;
  updatedBy?: string;
  updatedAt: string;
}

export interface UserProgressAdjustedEvent {
  username: string;
  balanceDelta?: number;
  xpDelta?: number;
  level?: number;
  updatedBy?: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminSignalRService {
  private connection: signalR.HubConnection | null = null;
  private notifyUrl =
    (environment as any).notificationsHub || 'http://localhost:7004/notifications';

  auctionStatusHandlers: Array<(e: AuctionStatusChangedEvent) => void> = [];
  avatarHandlers: Array<(e: UserAvatarUpdatedEvent) => void> = [];
  progressHandlers: Array<(e: UserProgressAdjustedEvent) => void> = [];

  constructor(private zone: NgZone) {}

  connect() {
    if (this.connection) {
      return;
    }
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.notifyUrl)
      .withAutomaticReconnect()
      .build();

    this.connection
      .start()
      .catch((err) => console.error('SignalR connection error', err));

    this.connection.on('AuctionStatusChanged', (evt: AuctionStatusChangedEvent) => {
      this.zone.run(() => this.auctionStatusHandlers.forEach((h) => h(evt)));
    });
    this.connection.on('UserAvatarUpdated', (evt: UserAvatarUpdatedEvent) => {
      this.zone.run(() => this.avatarHandlers.forEach((h) => h(evt)));
    });
    this.connection.on('UserProgressAdjusted', (evt: UserProgressAdjustedEvent) => {
      this.zone.run(() => this.progressHandlers.forEach((h) => h(evt)));
    });
  }

  onAuctionStatusChanged(handler: (e: AuctionStatusChangedEvent) => void) {
    this.auctionStatusHandlers.push(handler);
  }

  onUserAvatarUpdated(handler: (e: UserAvatarUpdatedEvent) => void) {
    this.avatarHandlers.push(handler);
  }

  onUserProgressAdjusted(handler: (e: UserProgressAdjustedEvent) => void) {
    this.progressHandlers.push(handler);
  }
}
