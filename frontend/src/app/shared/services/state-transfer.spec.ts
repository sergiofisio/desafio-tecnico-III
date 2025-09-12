import { TestBed } from '@angular/core/testing';

import { StateTransfer } from './state-transfer';

describe('StateTransfer', () => {
  let service: StateTransfer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateTransfer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
