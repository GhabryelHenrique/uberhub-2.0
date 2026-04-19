import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { GeminiRoutesService } from './gemini-routes.service';

describe('GeminiRoutesService', () => {
  let service: GeminiRoutesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(GeminiRoutesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
