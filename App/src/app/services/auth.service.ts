import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  logueado: boolean = false;
  admin:    boolean = false;

  /**
    * Obtiene el estado de administrador, usado en Guarda
    * @returns {boolean} El estado de administrador.
    */
  getAdmin(): boolean {
    return this.admin;
  }

  /**
   * Obtiene el estado de inicio de sesión, usado en Guarda
   * @returns {boolean} El estado de inicio de sesión.
   */
  getLogueado(): boolean {
    return this.logueado;
  }

  getToken(): string {
    return localStorage.getItem('token') ?? '';
  }

  addLoginStorage(token: string): void {
    localStorage.setItem('token', token);
  }


  /**
   * Comprueba si el usuario está autenticado.
   * 
   * @returns Un Observable que emite un valor booleano indicando si el usuario está autenticado.
   */
  isLogged(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return of(false); // Si no hay token devuelve observable con false
    return this.http.post<any>('http://localhost:3000/usuarios-obtener-usuario', { token: token }).pipe(
      map(response => {
        this.logueado = response.isLogged;
        return response.isLogged;
      }),
      catchError(error => {
        console.error('Error al verificar la autenticación:', error);
        return of(false);
      })
    );
  }

  /**
    * Comprueba si el usuario actual es un administrador.
    * @returns Un Observable que emite un valor booleano que indica si el usuario es un administrador o no.
    */
  isAdmin(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) return of(false);
    return this.http.post<any>('http://localhost:3000/usuarios-comprobar-admin', { token: token }).pipe(
      map(response => {
        this.admin = response;
        return response;
      }),
      catchError(error => {
        console.warn('Error interno del servidor');
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
