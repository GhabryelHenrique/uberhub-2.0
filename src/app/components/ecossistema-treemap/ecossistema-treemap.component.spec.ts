import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcossistemaTreemapComponent } from './ecossistema-treemap.component';
import { provideHttpClient } from '@angular/common/http';

describe('EcossistemaTreemapComponent', () => {
  let component: EcossistemaTreemapComponent;
  let fixture: ComponentFixture<EcossistemaTreemapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EcossistemaTreemapComponent],
      providers: [provideHttpClient(),
        provideEcharts(),]


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
function provideEcharts(): any {
  throw new Error('Function not implemented.');
}

