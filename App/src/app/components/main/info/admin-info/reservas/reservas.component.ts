import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ReservaService } from '../../../../../services/reserva.service';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { Usuario } from '../../../../../interfaces/interface';
import { UsuarioService } from '../../../../../services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule,RadioButtonModule],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss'
})
export class ReservasComponent {

  usuarios: Usuario[]   = [];
  reservas: any[]       = [];
  soloReservasActuales  = false;
  onDestroy$            = new Subject<boolean>();

  constructor(
    private usuarioService:   UsuarioService,
    private reservasService:  ReservaService,
  ) { }

  /**
   * Método que se ejecuta al inicializar el componente.
   * Carga los datos necesarios.
   */
  ngOnInit() {
    this.cargarDatos();
  }

  /**
   * Carga los datos de usuarios y reservas.
   * 
   * Obtiene la lista de usuarios y la lista de reservas desde el servidor.
   * Luego, ordena las reservas por fecha de finalización de forma descendente.
   * A continuación, agrega el campo "nombre" a cada reserva, correspondiente al nombre del usuario asociado.
   * 
   * @returns {void}
   */
  cargarDatos() {
    this.usuarioService.getUsuarios().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
        this.reservasService.obtenerTodasReservas().pipe(
          takeUntil(this.onDestroy$)
        ).subscribe({
          next: (res: any) => {
            this.reservas = res;
            /* fehcas ordenadas de forma descendente */
            this.reservas.sort((a, b) => {
              const fechaFinA = new Date(a.fecha_fin);
              const fechaFinB = new Date(b.fecha_fin);
            
              // Ordena de forma descendente
              return fechaFinB.getTime() - fechaFinA.getTime();
            });
            // Recorrer las reservas y agregar el campo nombreUsuario
            for (let reserva of this.reservas) {
              // Buscar el usuario correspondiente
              let usuario = this.usuarios.find(usuario => usuario.id_usuario === reserva.id_usuario);

              // Si encontramos el usuario, agregar el nombre del usuario a la reserva
              if (usuario) {
                reserva.nombre = usuario.nombre;
              }
            }
            // console.log('reservas->', this.reservas);
          },
          error: (error: any) => {
            // console.warn('Error interno del servidorr');
          }
        });
      },
      error: (error: any) => {
        // console.warn('Error interno del servidor');
      }
    })


  }

  /**
   * Elimina una reserva.
   * 
   * @param id_reserva - El ID de la reserva a eliminar.
   * @returns Una suscripción al observable que emite el resultado de la eliminación de la reserva.
   */
  borrarReserva(id_reserva: number) {
    return this.reservasService.borrarReserva(id_reserva).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: () => {
        this.cargarDatos();
        Swal.fire({
          title:  'Reserva cancelada',
          text:   'Reserva cancelada correctamente!',
          icon:   'success',
          confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
        });
      },
      error: (error) => {
        // console.error("Error al agregar usuario: ", error);
        // console.log(error.error.message);
      }
    }
    );
  }

  /**
   * Elimina una reserva.
   * 
   * @param id_reserva - El ID de la reserva a cancelar.
   */
  deleteReserva(id_reserva: number) {
    Swal.fire({
      title:  'Cancelar reserva',
      text:   'Estas seguro de querer cancelar esta reserva?',
      icon:   'warning',
      showCancelButton: true,
      confirmButtonColor: '#F6C344',
      confirmButtonText:  'Si, cancelar',
      cancelButtonText:   'Cancelar',
    }).then((result) => {
      if (result.value) { this.borrarReserva(id_reserva); }
    })
  }

  /**
   * Obtiene los nombres de las mascotas (imprime en la tabla).
   * 
   * @param mascotas - Un arreglo de objetos que representan mascotas.
   * @returns Una cadena de texto con los nombres de las mascotas separados por comas.
   */
  obtenerNombresMascotas(mascotas: any[]) {
    return mascotas.map(mascota => mascota.nombre).join(', ');
  }

  /**
   * Comprueba si una reserva es pasada.
   * @param fecha - La fecha de la reserva en formato de cadena.
   * @returns Devuelve true si la fecha de reserva es anterior a la fecha actual, de lo contrario devuelve false.
   */
  esReservaPasada(fecha: string): boolean {
    const hoy          = new Date();
    const fechaReserva = new Date(fecha);
  
    // Devuelve true si la fecha de reserva es anterior a la fecha actual
    return fechaReserva < hoy;
  }

  /**
   * Comprueba si una reserva es actual.
   * 
   * @param fecha_inicio - La fecha de inicio de la reserva.
   * @param fecha_fin - La fecha de fin de la reserva.
   * @returns Devuelve true si la reserva es actual, de lo contrario devuelve false.
   */
  esReservaActual(fecha_inicio: string, fecha_fin: string): boolean {
    const hoy           = new Date();
    const inicioReserva = new Date(fecha_inicio);
    const finReserva    = new Date(fecha_fin);
  
    // Establecer las horas, minutos, segundos y milisegundos a 0 para comparar solo las fechas
    inicioReserva.setHours(14, 0, 0, 0);
    finReserva   .setHours(14, 0, 0, 0); // La hora de finalización es a las 14:00
  
    // Devuelve true si la fecha de inicio ha pasado o es hoy y la fecha de fin aún no ha ocurrido
    return inicioReserva <= hoy && hoy <= finReserva;
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
  }
}
