import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicoAlvoChartComponent } from './publico-alvo-chart.component';

describe('PublicoAlvoChartComponent', () => {
  let component: PublicoAlvoChartComponent;
  let fixture: ComponentFixture<PublicoAlvoChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicoAlvoChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicoAlvoChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
