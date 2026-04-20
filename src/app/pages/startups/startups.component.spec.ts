import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { StartupsComponent } from './startups.component';

describe('StartupsComponent', () => {
  let component: StartupsComponent;
  let fixture: ComponentFixture<StartupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StartupsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StartupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
