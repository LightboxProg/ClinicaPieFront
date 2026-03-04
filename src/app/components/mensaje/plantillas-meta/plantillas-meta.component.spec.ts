import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantillasMetaComponent } from './plantillas-meta.component';

describe('PlantillasMetaComponent', () => {
  let component: PlantillasMetaComponent;
  let fixture: ComponentFixture<PlantillasMetaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlantillasMetaComponent]
    });
    fixture = TestBed.createComponent(PlantillasMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
