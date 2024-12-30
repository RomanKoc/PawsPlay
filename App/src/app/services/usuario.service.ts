import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsuarioLogged, Usuario } from '../interfaces/interface';
import { catchError, map, of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";
  usuarioLogueado: any = { id_usuario: -1, nombre: '', apellidos: '', direccion: '', isLogged: false, };

  constructor(private http: HttpClient) { }

  getUsuarios() {
    return this.http.get<Usuario[]>('http://localhost:3000/usuarios');
  }

  setUsuario(usuario: any) {
    return this.http.post('http://localhost:3000/usuarios-insert', usuario);
  }

  updateUsuario(usuario: any) {
    return this.http.post('http://localhost:3000/usuarios-update', usuario);
  }

  /**
   * Comprueba si un usuario está registrado y ha iniciado sesión.
   * @param usuario - Objeto que contiene el email y la contraseña del usuario.
   * @returns Deuvele un token si el usuario está registrado y ha iniciado sesión.
   */
  isLogged(usuario: { email: string; password: string; }) {
    return this.http.post('http://localhost:3000/usuarios-comprobar-login', usuario);
  }
  /**
   * Obtiene los datos del usuario actual.
   * @returns Un observable que emite los datos del usuario actual.
   * Si no se encuentra un token en el almacenamiento local, se emite un objeto con el mensaje "Usuario no encontrado" y la propiedad isLogged establecida en false.
   * Si se produce un error en la solicitud HTTP, se emite un objeto con el id_usuario establecido en -1, nombre, apellidos y dirección vacíos, y la propiedad isLogged establecida en false.
   */
  obtenerDatosUsuario() {
    const token = localStorage.getItem('token');
    if (!token) return of({ message: 'Usuario no encontrado', isLogged: false });
    return this.http.post('http://localhost:3000/usuarios-obtener-usuario', { token: token }).pipe(
      map((response: any) => {
        this.usuarioLogueado = response;
        return response;
      }),
      catchError(error => {
        console.warn('Error interno del servidor');
        return of({ id_usuario: -1, nombre: '', apellidos: '', direccion: '', isLogged: false, });
      })
    )
  }

  deleteUsuario(id_usuario: number) {
    return this.http.delete(`http://localhost:3000/usuarios-delete?id_usuario=${id_usuario}`);
  }

  /**
   * actualizar header (SUSTITUIDO POR OBSERVABLE EN EL HEADER)
   */
  private initSource = new Subject<void>();
  init$ = this.initSource.asObservable();

}
