import { TestBed } from '@angular/core/testing';

import { ListaNegraPreguntonService } from './lista-negra-pregunton.service';

describe('ListaNegraPreguntonService', () => {
  let service: ListaNegraPreguntonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ListaNegraPreguntonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
