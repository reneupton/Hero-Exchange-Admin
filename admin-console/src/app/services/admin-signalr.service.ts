// SignalR subscription manager for admin live events.
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

  /**
   * Opens a SignalR connection to the notifications hub and wires event handlers.
   * No-op if already connected to avoid duplicate connections.
   */
  connect() {
    if (this.connection) {
      return;
    }
    this.connection = this.buildConnection();

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

  /**
   * Subscribes to auction status changes.
   */
  onAuctionStatusChanged(handler: (e: AuctionStatusChangedEvent) => void) {
    this.auctionStatusHandlers.push(handler);
  }

  /**
   * Subscribes to avatar updates.
   */
  onUserAvatarUpdated(handler: (e: UserAvatarUpdatedEvent) => void) {
    this.avatarHandlers.push(handler);
  }

  /**
   * Subscribes to user progress adjustments (balance/xp).
   */
  onUserProgressAdjusted(handler: (e: UserProgressAdjustedEvent) => void) {
    this.progressHandlers.push(handler);
  }

  /**
   * Builds a hub connection; kept separate for testability.
   */
  protected buildConnection(): signalR.HubConnection {
    return new signalR.HubConnectionBuilder().withUrl(this.notifyUrl).withAutomaticReconnect().build();
  }
}
