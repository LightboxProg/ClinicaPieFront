import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalApiService } from './global-api.service';

@Injectable({
  providedIn: 'root'
})
export class DebugService {

  constructor(private http:HttpClient, private api:GlobalApiService) { }


  getHorarios(idCalendario:string):Observable<any>{
    return this.http.get("http://localhost:5000/DentalArce/getAvailableSlots/" +idCalendario);
  }


  apartarHorario(idOp1:string,idOp2:string,cita:any){
    return this.http.post("http://localhost:5000/DentalArce/crearCitaCV/"+idOp1+"/"+idOp2,cita);
  }


  
}
