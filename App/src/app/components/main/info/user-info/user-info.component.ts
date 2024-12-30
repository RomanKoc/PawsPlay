import { AuthService } from '../../../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Mascota, UsuarioLogged } from '../../../../interfaces/interface';
import { MascotaService } from '../../../../services/mascota.service';
import { ReservaService } from '../../../../services/reserva.service';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TreeTableModule } from 'primeng/treetable';
import { UsuarioService } from '../../../../services/usuario.service';
import Swal from 'sweetalert2';




@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, DialogModule, CalendarModule, ReactiveFormsModule,TreeTableModule,TableModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent {
  visibleAdd: boolean = false;
  visibleMod: boolean = false;
  idUsuario:  string  = ''; // no se usa?
  onDestroy$          = new Subject<boolean>();
  mascotaMod: any     = {};

  usuarioLogueado: UsuarioLogged = { id_usuario: -1, nombre: '', apellidos: '', direccion: '', isLogged: false, mascotas: []};
  mascotas: Mascota[] = [];
  token:    string    = this.authService.getToken();
  reservas: any[]     = [];
  hoy                 = new Date();
  constructor(
    private mascotaService:   MascotaService,
    private usuarioService:   UsuarioService,
    private authService:      AuthService,
    private reservasService:  ReservaService,
  ) {
    this.cargarDatos();
  }

/*   ngOnInit() {
    
  } */
  formUser =   new FormGroup({
    nombre:    new FormControl(this.usuarioLogueado.nombre,   [Validators.required, Validators.minLength(3)]),
    apellidos: new FormControl(this.usuarioLogueado.apellidos,[Validators.required, Validators.minLength(3)]),
    direccion: new FormControl(this.usuarioLogueado.direccion,[Validators.required, Validators.minLength(10)]),
  });

  formAddMascota = new FormGroup({
    nombre:        new FormControl('',[Validators.required, Validators.minLength(3)]),
    fecha_nac:     new FormControl('',Validators.required),
    alergias:      new FormControl(''),
    observaciones: new FormControl(''),
  });

  formModMascota = new FormGroup({
    nombre:        new FormControl('',[Validators.required, Validators.minLength(3)]),
    fecha_nac:     new FormControl('',Validators.required),
    alergias:      new FormControl(''),
    observaciones: new FormControl(''),
  });

  /**
   * Agrega una mascota.
   * 
   * Verifica si los campos nombre y fecha están vacíos. Si alguno de ellos está vacío, muestra un mensaje de error.
   * Si ambos campos tienen valores, crea un objeto mascota con los datos ingresados y el ID del propietario.
   * Luego, llama al método setMascota del servicio mascotaService para guardar la mascota en la base de datos.
   * Si la operación es exitosa, muestra un mensaje de éxito, reinicia el formulario y carga los datos actualizados.
   * Si ocurre un error, muestra el mensaje de error correspondiente.
   * 
   * @returns Un Observable que se suscribe a la operación de agregar mascota.
   */
  agregarMascota() {
    if(this.formAddMascota.value.nombre == ''       || this.formAddMascota.value.fecha_nac == ''
    || this.formAddMascota.value.nombre == null     || this.formAddMascota.value.fecha_nac == null
    || this.formAddMascota.value.nombre?.length < 3 || this.formAddMascota.value.fecha_nac == undefined
    ){
      Swal.fire({
        title:              'Error al añadir mascota',
        text:               'Los campos nombre o fecha no pueden estar vacíos.',
        icon:               'error',
        confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
      });
      return;
    }
    
    const mascota: any = {
      nombre:        this.formAddMascota.value.nombre.trim(),
      fecha_nac:     this.formAddMascota.value.fecha_nac,
      alergias:      this.formAddMascota.value.alergias?.trim() || '',
      observaciones: this.formAddMascota.value.observaciones?.trim() || '',
      propietario:   this.usuarioLogueado.id_usuario
    };
    // console.log(mascota)
    return this.mascotaService.setMascota(mascota).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: () => {
        // console.log('Mascota agregada correctamente');
        this.formAddMascota.reset();
        this.cargarDatos();
        Swal.fire({
          title:              'Mascota registrada!',
          text:               'Los datos han sido registrados correctamente.',
          icon:               'success',
          confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
        });
        this.visibleAdd = false;
      },
      error: (error) => {
        // console.error("Error al agregar usuario: ", error);
      }
    }
    );
  }

  /**
   * Actualiza la información de una mascota en el sistema.
   * 
   * @param id_mascota - El ID de la mascota que se desea actualizar.
   * @returns Una suscripción al observable que se encarga de actualizar la mascota.
   */
  actualizarMascota(id_mascota: number) {

    const mascota: any = {
      id_mascota:    id_mascota,
      nombre:        this.formModMascota.value.nombre?.trim(),
      fecha_nac:     this.formModMascota.value.fecha_nac,
      alergias:      this.formModMascota.value.alergias?.trim(),
      observaciones: this.formModMascota.value.observaciones?.trim(),
      propietario:   this.usuarioLogueado.id_usuario
    };
    return this.mascotaService.updateMascota(mascota).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: () => {
        // console.log('Mascota actualizada correctamente');
        this.cargarDatos();
        Swal.fire({
          title:              'Mascota actualizada',
          text:               'Los datos han sido actualizados correctamente!',
          icon:               'success',
          confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
        });
        this.visibleMod = false;
      },
      error: (error) => {
        // console.error("Error al agregar usuario: ", error);
        // console.log(error.error.message);
      }
    }
    );
  }

  /**
   * Elimina una mascota según su ID.
   * 
   * @param id_mascota El ID de la mascota a borrar.
   * @returns Una suscripción al observable que indica si la mascota fue borrada correctamente.
   */
  borrarMascota(id_mascota: number) {
    // console.log(id_mascota)
    return this.mascotaService.deleteMascota(id_mascota).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: () => {
        // console.log('Mascota borrada correctamente');
        this.cargarDatos();
        Swal.fire({
          title:              'Mascota borrada',
          text:               'Los datos han sido borrados correctamente!',
          icon:               'success',
          confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
        });
        this.visibleMod = false;
      },
      error: (error) => {
        // console.error("Error al agregar usuario: ", error);
        // console.log(error.error.message);
      }
    }
    );
  }

  /**
   * Actualiza la información del usuario.
   * 
   * @returns Un observable que emite el resultado de la actualización.
   */
  actualizarUsuario() {
    const usuario: any = {
      id_usuario: this.usuarioLogueado.id_usuario,
      nombre:     this.formUser.value.nombre?.trim(),
      apellidos:  this.formUser.value.apellidos?.trim(),
      direccion:  this.formUser.value.direccion?.trim()
    };
    // console.log(usuario)
    return this.usuarioService.updateUsuario(usuario).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: () => {
        // console.log('Usuario actualizado correctamente');
        this.cargarDatos();
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
          title: 'Reserva cancelada',
          text:  'Reserva cancelada correctamente!',
          icon:  'success',
          confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
        });
        this.visibleMod = false;
      },
      error: (error) => {
        // console.error("Error al agregar usuario: ", error);
        // console.log(error.error.message);
      }
    }
    );
  }

  /**
   * Muestra el diálogo para agregar información de usuario.
   */
  showDialogAdd() {
    this.visibleAdd = true;
  }

  /**
   * Muestra el diálogo de modificación de mascota.
   * 
   * @param mascota - La mascota que se va a modificar.
   */
  showDialogMod(mascota: any) {
    this.mascotaMod = mascota;
    this.visibleMod = true;

    let fecha_nac = '';
    if (mascota.fecha_nac) {
      const fecha = new Date(mascota.fecha_nac);
      fecha.setDate(fecha.getDate() + 1); // saca un dia menos
      fecha_nac = fecha.toISOString().split('T')[0];
    }

    this.formModMascota.setValue({
      nombre:        mascota.nombre?.trim() || '',
      fecha_nac:     fecha_nac,
      alergias:      mascota.alergias?.trim() || '',
      observaciones: mascota.observaciones?.trim() || '',
    });
  }

  /**
   * Modifica los datos del usuario.
   * Verifica si los campos nombre, apellidos y dirección están vacíos.
   * Si alguno de los campos está vacío, muestra un mensaje de error.
   * Si todos los campos están completos, muestra un mensaje de confirmación para modificar los datos.
   * Si el usuario confirma los cambios, llama a la función actualizarUsuario() y muestra un mensaje de éxito.
   * Si el usuario cancela los cambios, no realiza ninguna acción adicional.
   */
  modificarUsuario(){
    if(this.formUser.value.nombre?.trim() == '' || this.formUser.value.apellidos?.trim() == '' || this.formUser.value.direccion?.trim() == ''
    || this.formUser.value.nombre == null       || this.formUser.value.apellidos == null       || this.formUser.value.direccion == null
    || this.formUser.value.nombre?.   trim().length < 3   
    || this.formUser.value.apellidos?.trim().length < 3   
    || this.formUser.value.direccion?.trim().length < 10){
      Swal.fire({
        title:              'Error al modificar',
        text:               'Los campos debeben de ser validos y no pueden estar vacíos!',
        icon:               'error',
        confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
      });
      return;
    }
    Swal.fire({
      title:              'Modificar datos',
      text:               'Estas seguro de tus cambios?',
      icon:               'question',
      showCancelButton:   true,
      confirmButtonColor: '#F6C344',
      confirmButtonText:  'Si, modificar',
      cancelButtonText:   'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.actualizarUsuario();
        Swal.fire({
          title: 'Confirmado',
          text:  'Sus datos han sido actualizados!',
          icon:  'success',
          confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {

      }
    })
  }

  /**
   * Modifica una mascota.
   * 
   * @param id_mascota - El ID de la mascota a modificar.
   */
  modificarMascota(){

    // console.log(this.formModMascota.value)
    // esto debe de moverse a la comprobacion anterior
    if(!this.formModMascota.value.nombre?.trim()    || this.formModMascota.value.fecha_nac == ''
    || this.formModMascota.value.nombre == null     || this.formModMascota.value.fecha_nac == null
    || this.formModMascota.value.nombre?.length < 3 || this.formModMascota.value.fecha_nac == undefined
    ){
      Swal.fire({
        title: 'Error al añadir mascota',
        text:  'Los campos nombre o fecha no pueden estar vacíos.',
        icon:  'error',
        confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
      });
      return;
    }
    Swal.fire({
      title:              'Modificar mascota',
      text:               'Estas seguro de tus cambios?',
      icon:               'question',
      showCancelButton:   true,
      confirmButtonColor: '#F6C344',
      confirmButtonText:  'Si, modificar',
      cancelButtonText:   'Cancelar',
    }).then((result) => {
      if (result.value) { this.actualizarMascota(this.mascotaMod.id_mascota);}
    })
  }

  /**
   * Agrega una mascota.
   * 
   * Muestra un cuadro de diálogo de confirmación y, si el usuario confirma, llama al método agregarMascota.
   */
  addMascota(){
    Swal.fire({
      title:              'Modificar mascota',
      text:               'Estas seguro de tus cambios?',
      icon:               'question',
      showCancelButton:   true,
      confirmButtonColor: '#F6C344',
      confirmButtonText:  'Si, modificar',
      cancelButtonText:   'Cancelar',
    }).then((result) => {
      if (result.value) { this.agregarMascota(); }
    })
  }

  /**
   * Elimina los datos de una mascota.
   * 
   * @param id_mascota - El ID de la mascota a borrar.
   */
  deleteMascota(id_mascota: number){
    Swal.fire({
      title:              'Borrar mascota',
      text:               'Estas seguro de querer borrar los datos de tu mascota?',
      icon:               'warning',
      showCancelButton:   true,
      confirmButtonColor: '#F6C344',
      confirmButtonText:  'Si, borrar',
      cancelButtonText:   'Cancelar',
    }).then((result) => {
      if (result.value) { this.borrarMascota(this.mascotaMod.id_mascota); }
    })
  }

  /**
   * Elimina una reserva.
   * 
   * @param id_reserva - El ID de la reserva a cancelar.
   */
  deleteReserva(id_reserva: number){
    Swal.fire({
      title:              'Cancelar reserva',
      text:               'Estas seguro de querer cancelar esta reserva?',
      icon:               'warning',
      showCancelButton:   true,
      confirmButtonColor: '#F6C344',
      confirmButtonText:  'Si, cancelar',
      cancelButtonText:   'Cancelar',
    }).then((result) => {
      if (result.value) { this.borrarReserva(id_reserva); }
    })
  }

  /**
   * Carga los datos del usuario actual.
   * 
   * @remarks
   * Este método obtiene los datos del usuario actual y realiza las siguientes acciones:
   * - Obtiene el ID del usuario desde el almacenamiento local.
   * - Obtiene los datos del usuario llamando al servicio `obtenerDatosUsuario`.
   * - Inicializa los valores del formulario `formUser` con los datos del usuario.
   * - Obtiene las reservas del usuario llamando al servicio `obtenerReservas`.
   * - Ordena las reservas por fecha de finalización de forma descendente.
   * 
   * @public
   */
  cargarDatos(){
    this.idUsuario = localStorage.getItem('token') ?? '';
    this.usuarioService.obtenerDatosUsuario().pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(
        {
          next: (res: any) => {
            this.usuarioLogueado = res;
            this.mascotas = res.mascotas;
            /* para inicializar los valores de form user */
            this.formUser = new FormGroup({
              nombre:    new FormControl(this.usuarioLogueado.nombre),
              apellidos: new FormControl(this.usuarioLogueado.apellidos),
              direccion: new FormControl(this.usuarioLogueado.direccion),
            });
            this.reservasService.obtenerReservas(this.usuarioLogueado.id_usuario).pipe(
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
              },
              error: (error: any) => {
                // console.warn('Error interno del servidorr');
              }
            });
          },
          error: (error: any) => {
            // console.warn('Error interno del servidorr');
          }
        });
  }

  /**
   * Obtiene los nombres de las mascotas. (para imprimir en la tabla de reservas las mascotas)
   * 
   * @param mascotas - Un arreglo de objetos que representan mascotas.
   * @returns Una cadena de texto con los nombres de las mascotas separados por comas.
   */
  obtenerNombresMascotas(mascotas: any[]) {
    return mascotas.map(mascota => mascota.nombre).join(', ');
  }

  /**
   * Comprueba si una reserva es pasada.
   * 
   * @param {string} fecha - La fecha de la reserva en formato de cadena.
   * @returns {boolean} - Devuelve true si la fecha de reserva es anterior a la fecha actual, de lo contrario devuelve false.
   */
  esReservaPasada(fecha: string): boolean {
    const hoy = new Date();
    const  fechaReserva = new Date(fecha);
  
    return fechaReserva < hoy;
  }


  /**
   * Comprueba si una reserva es actual.
   * 
   * @param fecha_inicio - La fecha de inicio de la reserva en formato de cadena.
   * @param fecha_fin - La fecha de fin de la reserva en formato de cadena.
   * @returns Devuelve true si la reserva es actual, de lo contrario devuelve false.
   */
  esReservaActual(fecha_inicio: string, fecha_fin: string): boolean {
    const hoy           = new Date();
    const inicioReserva = new Date(fecha_inicio);
    const finReserva    = new Date(fecha_fin);
  
    // Establecer las horas, minutos, segundos y milisegundos a 0 para comparar solo las fechas
    inicioReserva.setHours(14, 0, 0, 0);
    finReserva   .setHours(14, 0, 0, 0); // La hora de finalización es a las 14:00
  
    return inicioReserva <= hoy && hoy <= finReserva;
  }

  /**
   * Comprueba si la fecha de inicio es hoy y si la hora actual es anterior a las 14:00.
   * 
   * @param fecha_inicio - La fecha de inicio en formato de cadena.
   * @returns Devuelve true si la fecha de inicio es hoy y la hora actual es anterior a las 14:00, de lo contrario devuelve false.
   */
  esInicioHoyYAntesDeHoraEntrada(fecha_inicio: string): boolean {
    const hoy = new Date();
    const inicioReserva = new Date(fecha_inicio);
  
    // Establecer las horas, minutos, segundos y milisegundos a 0 para comparar solo las fechas
    inicioReserva.setHours(14, 0, 0, 0);
  
    // Crear una copia de 'hoy' y establecer la hora a 14:00 para comparar
    const hoy14 = new Date(hoy.getTime());
    hoy14.setHours(14, 0, 0, 0);
  
    // Comprobar si la fecha de inicio es hoy y si la hora actual es menor que 14:00
    return inicioReserva.getTime() === hoy14.getTime() && hoy.getHours() < 14;
  }

  /**
   * Determina si el usuario puede ser borrado.
   * 
   * @returns `true` si el usuario puede ser borrado, de lo contrario `false`.
   */
  puedeBorrar(): boolean {
    const hoy = new Date();
    
    if (this.reservas.length <= 0) {
      // Si no hay reservas, se puede borrar
      return true;
    }
    
    for (let reserva of this.reservas) {
      const finReserva = new Date(reserva.fecha_fin);
    
      if (finReserva >= hoy) {
        // Si la fecha y hora de finalización de la reserva son mayores o iguales que ahora, no se puede borrar
        return false;
      }
    }
    
    // Si todas las reservas tienen una fecha y hora de finalización menores que ahora, se puede borrar
    return true;
  }

  /**
   * Se encarga de destruir todas las suscripciones.
   */
  ngOnDestroy(): void {
    //Destruimos todas las suscripciones
    this.onDestroy$.next(true);
  }
}