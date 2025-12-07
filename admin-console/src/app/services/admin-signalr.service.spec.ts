import { NgZone } from '@angular/core';
import { AdminSignalRService } from './admin-signalr.service';

describe('AdminSignalRService', () => {
  let service: AdminSignalRService;
  const fakeZone = {
    run: (fn: () => void) => fn(),
  } as unknown as NgZone;

  const fakeConnection = {
    start: jasmine.createSpy('start').and.returnValue(Promise.resolve()),
    on: jasmine.createSpy('on'),
  } as any;

  beforeEach(() => {
    service = new AdminSignalRService(fakeZone);
    spyOn<any>(service as any, 'buildConnection').and.returnValue(fakeConnection);
  });

  it('connects once and wires hub handlers', async () => {
    service.connect();

    expect(fakeConnection.start).toHaveBeenCalled();
    expect(fakeConnection.on).toHaveBeenCalledWith('AuctionStatusChanged', jasmine.any(Function));
    expect(fakeConnection.on).toHaveBeenCalledWith('UserAvatarUpdated', jasmine.any(Function));
    expect(fakeConnection.on).toHaveBeenCalledWith('UserProgressAdjusted', jasmine.any(Function));

    // subsequent calls should not rebuild connection
    fakeConnection.start.calls.reset();
    service.connect();
    expect(fakeConnection.start).not.toHaveBeenCalled();
  });
});
