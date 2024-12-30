import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { concat, Subject, takeUntil } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { UsuarioLogged } from '../../interfaces/interface';
import { UsuarioService } from '../../services/usuario.service';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, ButtonModule, MenuModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  onDestroy$                     = new Subject<boolean>();
  logeado: boolean               = false;
  usuarioLogueado: UsuarioLogged = { id_usuario: -1, nombre: '', apellidos: '', direccion: '', isLogged: false, mascotas: [] };
  admin:   boolean               = false;

  items: MenuItem[] | undefined;
  iconoNologueado = ['pi-sign-in', 'pi-user-plus'];
  iconoLogueado   = ['pi-home', 'pi-sign-out'];

  constructor(
    private usuarioService: UsuarioService,
    private authService:    AuthService,
    private router:         Router,
  ) {
      /**
       * Se suscribe al evento NavigationStart del router.
       * Esto permite que al cambiar de ruta se carguen los datos necesarios para el componente de encabezado.
       * Permite que se pueda recargar la pagina sabiendo que usario es sin perder la sesion.
       * @param {NavigationStart} event - Evento de cambio de ruta.
       * @returns {void}
       * @see cargarDatos()
       * @see ngOnDestroy()
       *
       */
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          this.cargarDatos();
        }
  });
   }


  // ESTO YA NO ES NECESARIO, SE HA CAMBIADO POR EL USO DE NAVIGATIONSTART
  ngOnInit() {
    // this.usuarioService.init$.subscribe(() => this.cargarDatos());
  }

  /**
   * Carga los datos necesarios para el componente de encabezado.
   * Verifica si el usuario está autenticado y si es un administrador.
   * Actualiza las propiedades 'logeado' y 'admin' en función del estado de autenticación.
   * Configura los elementos del menú en función del estado de autenticación.
   * Obtiene los datos del usuario autenticado si está logueado.
   * 
   * @returns {void}
   */
  cargarDatos() {
    concat(this.authService.isLogged().pipe(takeUntil(this.onDestroy$)),
           this.authService.isAdmin() .pipe(takeUntil(this.onDestroy$)))
      .subscribe(() => {
        this.logeado  = this.authService.getLogueado();
        this.admin    = this.authService.getAdmin();
        // console.log('logueado¿?:', this.admin);
        if (this.logeado) {
          this.items = [
            {
              label: '',
              icon: 'pi pi-fw pi-user',
              items: [
                {
                  label: 'Cerrar sesion',
                  icon: 'pi pi-fw ' + this.iconoLogueado[1],
                  command: () => {
                    this.authService.logout();
                    location.reload();
                  },
                }
              ]
            }
          ];
          this.usuarioService.obtenerDatosUsuario().pipe(
            takeUntil(this.onDestroy$)
          )
            .subscribe(
              {
                next: (res: any) => {
                  this.usuarioLogueado = res;
                },
                error: (error: any) => {
                  // console.warn('Error interno del servidorr');
                }
              }
            );
        } else {
          this.items = [
            {
              label: '',
              icon: 'pi pi-fw pi-user',
              items: [
                {
                  label: 'Iniciar sesion',
                  icon: 'pi pi-fw ' + this.iconoNologueado[0],
                  routerLink: '/login'
                },
                {
                  label: 'Registrarse',
                  icon: 'pi pi-fw ' + this.iconoNologueado[1],
                  routerLink: '/singin'
                }
              ]
            }
          ];
        }
      });
  }
  ngOnDestroy(): void {
    // Destruimos todas las suscripciones
    this.onDestroy$.next(true);
  }

}
