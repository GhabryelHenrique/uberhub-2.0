import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { NGX_ECHARTS_CONFIG } from 'ngx-echarts';
import { EcossistemaTreemapComponent } from './ecossistema-treemap.component';

describe('EcossistemaTreemapComponent', () => {
  let component: EcossistemaTreemapComponent;
  let fixture: ComponentFixture<EcossistemaTreemapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcossistemaTreemapComponent],
      providers: [
        provideHttpClient(),
        { provide: NGX_ECHARTS_CONFIG, useValue: { echarts: () => Promise.resolve({}) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EcossistemaTreemapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
