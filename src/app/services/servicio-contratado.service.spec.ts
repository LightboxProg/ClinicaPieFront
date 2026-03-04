import { TestBed } from '@angular/core/testing';

import { ServicioContratadoService } from './servicio-contratado.service';

describe('ServicioContratadoService', () => {
  let service: ServicioContratadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicioContratadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
