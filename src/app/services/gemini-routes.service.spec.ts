import { TestBed } from '@angular/core/testing';

import { GeminiRoutesService } from './gemini-routes.service';

describe('GeminiRoutesService', () => {
  let service: GeminiRoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeminiRoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
