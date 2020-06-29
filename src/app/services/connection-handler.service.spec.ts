import { TestBed } from '@angular/core/testing';

import { ConnectionHandlerService } from './connection-handler.service';

describe('ConnectionHandlerService', () => {
  let service: ConnectionHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConnectionHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
