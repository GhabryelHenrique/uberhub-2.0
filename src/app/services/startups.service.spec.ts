import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { StartupsService } from './startups.service';

describe('StartupsService', () => {
  let service: StartupsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(StartupsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
