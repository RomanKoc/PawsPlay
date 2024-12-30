import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mascota } from '../interfaces/interface';

@Injectable({
  providedIn: 'root'
})
export class MascotaService {

  constructor(private http: HttpClient) { }

  setMascota(mascota: Mascota) {
    return this.http.post('http://localhost:3000/mascotas-insert', mascota);
  }
  
  updateMascota(mascota: any) {
    return this.http.post('http://localhost:3000/mascotas-update', mascota);
  }

  deleteMascota(id_mascota: number) {
    return this.http.delete(`http://localhost:3000/mascotas-delete?id_mascota=${id_mascota}`)
  }
}
