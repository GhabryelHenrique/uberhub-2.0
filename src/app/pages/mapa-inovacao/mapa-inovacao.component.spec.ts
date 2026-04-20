import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MapaInovacaoComponent } from './mapa-inovacao.component';

describe('MapaInovacaoComponent', () => {
  let component: MapaInovacaoComponent;
  let fixture: ComponentFixture<MapaInovacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaInovacaoComponent],
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaInovacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
