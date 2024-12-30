import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Función que actúa como guardia de autenticación para proteger las rutas en la aplicación.
 * Comprueba si el usuario está autenticado y redirige a la página de inicio si no lo está.
 *
 * @param route - La ruta activada.
 * @param state - El estado actual de la ruta.
 * @returns Un Observable booleano que indica si el usuario está autenticado o no.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLogged().pipe(
    take(1),
    map(isLogged => {
      if (isLogged) {
        return true;
      } else {
        router.navigate(['/home']);
        return false;
      }
    })
  );
};

/**
 * Función de guardia que verifica si el usuario está autenticado.
 * Si el usuario está autenticado, redirige al componente de inicio.
 * Si el usuario no está autenticado, permite el acceso al componente actual.
 * 
 * @param route - La ruta activada.
 * @param state - El estado actual de la aplicación.
 * @returns Un observable booleano que indica si el usuario está autenticado.
 */
export const authGuardIsLog: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLogged().pipe(
    take(1),
    map(isLogged => {
      if (!isLogged) {
        return true;
      } else {
        router.navigate(['/home']);
        return false;
      }
    })
  );
};

/**
 * Función de guardia para verificar si el usuario es un administrador.
 * Si el usuario es un administrador, se permite el acceso a la ruta.
 * Si el usuario no es un administrador, se redirige a la página de inicio y se deniega el acceso.
 * 
 * @param route - La ruta activada.
 * @param state - El estado actual de la ruta.
 * @returns Un Observable booleano que indica si se permite el acceso a la ruta.
 */
export const authGuardAdmin: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAdmin().pipe(
    take(1),
    map(isAdmin => {
      if (isAdmin) {
        return true;
      } else {
        router.navigate(['/home']);
        return false;
      }
    })
  );
};