import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  constructor(private http: HttpClient) { }

  obtenerTodasReservas() {
    return this.http.get(`http://localhost:3000/reservas`);
  }

  reservar(reserva: any) {
    return this.http.post('http://localhost:3000/reservas-insert', reserva);
  }

  obtenerReservas(id_usuario: number) {
    return this.http.get(`http://localhost:3000/reservas-obtener-reservas?id_usuario=${id_usuario}`);
  }
 
  borrarReserva(id_reserva:number) {
    return this.http.delete(`http://localhost:3000/reservas-delete?id_reserva=${id_reserva}`);
  }
}
