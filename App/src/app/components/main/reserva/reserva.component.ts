import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Mascota, UsuarioLogged } from '../../../interfaces/interface';
import { ReservaService } from '../../../services/reserva.service';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UsuarioService } from '../../../services/usuario.service';
import Inputmask from "inputmask";
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, CheckboxModule, CalendarModule, FormsModule, ReactiveFormsModule, InputTextModule,RouterLink],
  templateUrl: './reserva.component.html',
})
export class ReservaComponent {
  onDestroy$ = new Subject<boolean>();
  usuarioLogueado: UsuarioLogged = { id_usuario: -1, nombre: '', apellidos: '', direccion: '', isLogged: false, mascotas: [] };
  mascotas:        Mascota[]     = [];

  maximoReservas          = 7; // Número máximo de MASCOTAS por día
  date_inicio: Date       = new Date();
  date_fin: Date          = new Date();
  maxDate: Date           = new Date();
  fechasCompletas: Date[] = [];
  tieneMascotas           = false;

  precioPorDia            = 18; // Precio por día
  precioTotal             = 0;
  totalNoches             = 0;

  constructor(
    private reservaService: ReservaService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {

    // Establecer date_fin para mañana
    this.date_fin.setDate(this.date_fin.getDate() + 1);
    // Establecer maxDate para dentro de dos meses
    this.maxDate = new Date();
    this.maxDate.setMonth(this.maxDate.getMonth() + 2);

    this.usuarioService.obtenerDatosUsuario().pipe(
      takeUntil(this.onDestroy$)
    )
      .subscribe(
        {
          next: (res: any) => {
            this.fechasCompletas = [];
            // console.log('res' + res)
            this.usuarioLogueado = res;
            // console.log('user' + this.usuarioLogueado)
            this.mascotas = res.mascotas;
            
            // Solucion error si se borra el token!!!!
            if(!this.mascotas){
              this.router.navigate(['/']);
              return;
            }

            if (this.mascotas.length > 0) {
              this.tieneMascotas = true;
              this.comprobarReservas();

              // Crear un control de formulario para cada mascota
              this.mascotas.forEach(mascota => {
                this.formReserva.addControl(`mascota_${mascota.id_mascota}`, new FormControl(false));
              });
              /* para inicializar los valores de form user */
              // this.formReserva.get('fecha_inicio')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
              this.formReserva.get('fecha_inicio')?.valueChanges.subscribe(fechaInicio => {
                // Establecer la fecha de fin para un día después de la fecha de inicio
                this.date_fin = new Date(fechaInicio);
                this.date_fin.setDate(this.date_fin.getDate() + 1);
                // que la fecha fin cambie a la +1 despues de la de inicio
                this.formReserva.get('fecha_fin')?.setValue(this.date_fin);

                // Ajustar la fecha máxima de reserva
                if (this.fechasCompletas.length > 0) {
                  const fechasDeshabilitadasOrdenadas = this.fechasCompletas.sort((a, b) => a.getTime() - b.getTime());
                  const proximaFechaDeshabilitada = fechasDeshabilitadasOrdenadas.find(fecha => fecha.getTime() > fechaInicio.getTime());
                  if (proximaFechaDeshabilitada) {
                    this.maxDate = new Date(proximaFechaDeshabilitada);
                    this.maxDate.setDate(this.maxDate.getDate() - 1);
                  } else {
                    // Si no hay ninguna fecha deshabilitada después de la fecha de inicio, establecer la fecha máxima para dentro de dos meses
                    this.maxDate = new Date();
                    this.maxDate.setMonth(this.maxDate.getMonth() + 2);
                  }
                } else {
                  // Si fechasCompletas es undefined o null, establecer la fecha máxima para dentro de dos meses
                  this.maxDate = new Date();
                  this.maxDate.setMonth(this.maxDate.getMonth() + 2);
                }
                // Recalcular el precio total
                this.calcularPrecioTotal();
              });
              this.formReserva.get('fecha_fin')?.valueChanges.subscribe(() => this.calcularPrecioTotal());
            }
          },
          error: (error: any) => {
            console.warn('Error interno del servidorr');
          }
        });

  }

  formReserva: FormGroup = new FormGroup({
    mascotas:     new FormControl('', Validators.required),
    fecha_inicio: new FormControl('', Validators.required),
    fecha_fin:    new FormControl('', Validators.required),
    peticiones:   new FormControl(),
    precio:       new FormControl(),
  });

  

  /**
   * Realiza una reserva de mascotas.
   * 
   * Filtra las mascotas seleccionadas y las ajusta a la zona horaria UTC.
   * Crea un objeto de reserva con la información necesaria y lo envía al servicio de reserva.
   * 
   * @returns Un Observable que se suscribe a la respuesta del servicio de reserva.
   */
  realizarReserva() {
    const mascotas = this.mascotas.filter((mascota) => this.formReserva.value[`mascota_${mascota.id_mascota}`])
                                  .map(mascota      => ({ id_mascota: mascota.id_mascota }));

    // Ajustar las fechas de inicio y fin a la zona horaria UTC
    const fechaInicio = new Date(this.formReserva.value.fecha_inicio);
    fechaInicio.setMinutes(fechaInicio.getMinutes() - fechaInicio.getTimezoneOffset());

    const fechaFin    = new Date(this.formReserva.value.fecha_fin);
    fechaFin.setMinutes(fechaFin.getMinutes() - fechaFin.getTimezoneOffset());

    const reserva = {
      fecha_inicio: fechaInicio,
      fecha_fin:    fechaFin,
      precio:       this.precioTotal,
      peticiones:   this.formReserva.value.peticiones?.trim(),
      id_usuario:   this.usuarioLogueado.id_usuario,
      mascotas:     mascotas,
    }
    // console.log(reserva);
    return this.reservaService.reservar(reserva).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(
      {
        next: (res: any) => {
          // console.log(res + "reserva realizada");
          this.router.navigate(['/user-info']);
          Swal.fire({
            title:              'Reserva confirmada',
            text:               'Su reserva se ha realizado con éxito!',
            icon:               'success',
            confirmButtonColor: '#F6C344' // Cambiar el color del botón de confirmación
          })
        },
        error: (error: any) => {
          console.warn('Error interno del servidor');
        }
      }
    )
  }


  /**
   * Calcula el precio total de la reserva.
   * 
   * @remarks
   * Este método utiliza las fechas de inicio y fin de la reserva, así como la cantidad de mascotas seleccionadas,
   * para calcular el precio total basado en el número de noches y el precio por día.
   * 
   * @returns El precio total de la reserva.
   */
  calcularPrecioTotal() {
    const fechaInicio = this.formReserva.get('fecha_inicio')?.value;
    const fechaFin    = this.formReserva.get('fecha_fin')?.value;

    if (fechaInicio && fechaFin) {
      const dias = fechaInicio.getTime && fechaFin.getTime ? Math.floor((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      this.totalNoches = dias;

      // Calcular el número de mascotas seleccionadas
      const numMascotasSeleccionadas = this.mascotas.filter(mascota => this.formReserva.value[`mascota_${mascota.id_mascota}`]).length;

      // Calcular el precio total basándose en las mascotas seleccionadas
      this.precioTotal = dias * this.precioPorDia * numMascotasSeleccionadas;
    }

  }

  /**
   * Método que se ejecuta al inicializar el componente.
   * Obtiene los datos del usuario y realiza las operaciones necesarias.
   */
  ngOnInit() {

  }

  /**
   * Comprueba las reservas y realiza ciertas operaciones basadas en las reservas obtenidas.
   * 
   * Esta función obtiene todas las reservas a través del servicio de reserva y realiza las siguientes operaciones:
   *  - Cuenta el número de reservas por fecha.
   *  - Verifica si la reserva fue hecha por el usuario actual.
   *  - Añade todas las fechas entre la fecha de inicio y la fecha de fin a un array de fechas completas.
   *  - Añade las fechas que exceden el número máximo de reservas por día al array de fechas completas.
   * 
   * @returns void
   */
  comprobarReservas(): void {
    this.reservaService.obtenerTodasReservas().subscribe(reservas => {
      const conteoReservasPorFecha: { [key: string]: number } = {};

      for (const reserva of Array.from(Object.values(reservas))) {

        let fechaInicio = new Date(reserva.fecha_inicio);
        fechaInicio.setDate(fechaInicio.getDate() + 1); // Sumar un día a la fecha de inicio
        let fechaFin = new Date(reserva.fecha_fin);
        fechaFin.setDate(fechaFin.getDate() + 1); // Sumar un día a la fecha final

        // Comprobar si la reserva fue hecha por el usuario actual
        if (reserva.id_usuario === this.usuarioLogueado.id_usuario) {

          // Añadir todas las fechas entre la fecha de inicio y la fecha de fin a fechasCompletas
          for (let fechaReserva = new Date(fechaInicio); fechaReserva <= fechaFin; fechaReserva.setDate(fechaReserva.getDate() + 1)) {
            const fechaStr = fechaReserva.toISOString().split('T')[0];
            this.fechasCompletas.push(new Date(fechaStr));
          }
          // esto se ha incluido para corregir el problema de la fecha de inicio (no se incluia):
          /*         fechaInicio.setDate(fechaInicio.getDate() - 1);
                  this.fechasCompletas.push(new Date(fechaInicio));
                  console.log(this.fechasCompletas) */
        }

        for (let fecha = fechaInicio; fecha < fechaFin; fecha.setDate(fecha.getDate() + 1)) {
          const fechaStr = fecha.toISOString().split('T')[0];

          if (!conteoReservasPorFecha[fechaStr]) {
            conteoReservasPorFecha[fechaStr] = 0;
          }
          conteoReservasPorFecha[fechaStr]  += reserva.mascotas.length;
        }
      }

      for (const fechaStr in conteoReservasPorFecha) {
        if (conteoReservasPorFecha[fechaStr] >= this.maximoReservas) { // modificar maximo de reservas por dia
          this.fechasCompletas.push(new Date(fechaStr));
        }
      }
    });
  }

  
  /**
   * Muestra el calendario y establece la fecha de inicio y la fecha máxima permitida.
   */
  onShowCalendar() {
    this.date_inicio = new Date();
    this.maxDate     = new Date();
    this.maxDate.setMonth(this.maxDate.getMonth() + 2);
  }

  /**
   * Función que se ejecuta cuando se realiza una reserva.
   * Muestra un mensaje de agradecimiento y confirma que la reserva ha sido realizada.
   */
  reservaRealizada() {
    Swal.fire('Gracias', 'Su reserva ha sido realizada!', 'success')
  }

  /**
   * Confirma la reserva y muestra un cuadro de diálogo de confirmación.
   */
  confirmarReserva() {
    Swal.fire({
      title: 'Confirmar reserva',
      text: `Estas seguro de realizar la reserva por un total de ${this.precioTotal}€ ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#F6C344',
      confirmButtonText: 'Si, reservar',
      cancelButtonText: 'No, seguir modificando',
    }).then((result) => {
      if (result.value) {
        this.realizarReserva();
      } else if (result.dismiss === Swal.DismissReason.cancel) {

      }
    });

  }

  /**
   * Comprueba si el formulario de reserva es válido.
   * 
   * @returns {boolean} `true` si el formulario es válido, de lo contrario `false`.
   */
  esFormularioValido() {
    // Comprobar si se ha seleccionado al menos una mascota
    const mascotasSeleccionadas = this.mascotas.filter(mascota => this.formReserva.value[`mascota_${mascota.id_mascota}`]).length > 0;

    // Comprobar si se han seleccionado las fechas de inicio y fin
    const fechasSeleccionadas   = this.formReserva.get('fecha_inicio')?.valid && this.formReserva.get('fecha_fin')?.valid;

    return mascotasSeleccionadas && fechasSeleccionadas;
  }

  /**
   * Método que se ejecuta cuando el componente es destruido.
   * Se encarga de destruir todas las suscripciones.
   */
  ngOnDestroy(): void {
    // Destruimos todas las suscripciones
    this.onDestroy$.next(true);
  }

  confirmarReservaConTarjeta() {
    Swal.fire({
      title: "Tarjeta Bancaria",
      text: "Añade los datos de tu tarjeta para continuar con la reserva.",
      // imageUrl: "tarjeta1.png",
      imageWidth: 400,
      imageHeight: 200,
      imageAlt: "Custom image",
      showCancelButton: true,
      confirmButtonColor: '#F6C344',
      confirmButtonText: "Realizar pago!",
      cancelButtonText: "No, cancelar!",
      html: `
        <div class="swal2-input-label">Añade los datos de tu tarjeta para reservar:</div>
        <input id="swal-input1" class="swal2-input" placeholder="Número de tarjeta*" maxlength="19">
        <input id="swal-input2" class="swal2-input" placeholder="Expiracion* (MM/AA)" maxlength="5">
        <input id="swal-input3" class="swal2-input" placeholder="CVC" maxlength="3">
      `,
      didOpen: () => {
        const input1 = document.getElementById('swal-input1');
        const input2 = document.getElementById('swal-input2');
        const input3 = document.getElementById('swal-input3');

        if (input1) {
          Inputmask('9999 9999 9999 9999').mask(input1);
        }
        if (input2) {
          Inputmask('99/99').mask(input2);
        }
        if (input3) {
          Inputmask('999').mask(input3);
        }
      },
      preConfirm: () => {
        const cardNumberElement = document.getElementById('swal-input1') as HTMLInputElement;
        const expiryDateElement = document.getElementById('swal-input2') as HTMLInputElement;
        const securityCodeElement = document.getElementById('swal-input3') as HTMLInputElement;

        const cardNumber = cardNumberElement ? cardNumberElement.value : '';
        const expiryDate = expiryDateElement ? expiryDateElement.value : '';
        const securityCode = securityCodeElement ? securityCodeElement.value : '';

        if (cardNumber.length < 19 || expiryDate.length < 5 || securityCode.length < 3) {
          Swal.showValidationMessage('Todos los campos deben estar completamente llenos');
          return;
        }
        // console.log(cardNumber.length, expiryDate.length, securityCode.length)
        return {
          cardNumber,
          expiryDate,
          securityCode
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Tarjeta aceptada ✅',
          text: `Estas seguro de realizar el pago de ${this.precioTotal}€ y completar la reserva ?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#F6C344',
          confirmButtonText: 'Si, reservar',
          cancelButtonText: 'No, seguir modificando',
        }).then((result) => {
          if (result.value) {
            // console.log('confimado');
            this.realizarReserva();
          } else if (result.dismiss === Swal.DismissReason.cancel) {

          }
        });

      }
    })
  }
}