import { AuthService } from '../../../../services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UsuarioService } from '../../../../services/usuario.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, PasswordModule, InputTextModule, ButtonModule,
    ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  onDestroy$ = new Subject<boolean>();

  constructor(
    private usuarioService: UsuarioService,
    private authService:    AuthService,
    private router:         Router
  ) { }
// Validators.pattern( this.validatorsService.emailPattern )],
  formLogin = new FormGroup({
    email:    new FormControl('',[Validators.required, Validators.pattern(this.usuarioService.emailPattern)]),
    password: new FormControl('',Validators.required)
  })

  /**
   * Envía el formulario de inicio de sesión.
   * 
   * @remarks
   * Este método valida los campos del formulario y realiza una llamada al servicio de usuario para verificar las credenciales.
   * Si el formulario es válido y las credenciales son correctas, muestra un mensaje de bienvenida y guarda el token de sesión en el almacenamiento local.
   * Si el formulario es inválido, muestra un mensaje de error indicando que todos los campos deben ser completados.
   * Si ocurre un error al verificar las credenciales, muestra un mensaje de error genérico.
   * 
   * @returns Un observable que se suscribe a la respuesta del servicio de usuario.
   */
  submit() {
    const usuario = { email: this.formLogin.value.email || '', password: this.formLogin.value.password || '' }

    if(this.formLogin.invalid) {
      Swal.fire({
        title:  "Error",
        text:   "Debe completar todos los campos!",
        icon:   "error",
        confirmButtonColor: "#F6C344", // Cambiar el color del botón de confirmación
      });
      return;
    }

    return this.usuarioService.isLogged({ email: usuario.email, password: usuario.password }).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(
      {
        next: (res: any) => {
          /* console.log('Usuario logueado correctamente', res); */
          if (res['message']) {
            // console.log(res['message']);
            Swal.fire({
              title: res['message'],
              icon: "error",
              confirmButtonColor: "#F6C344", // Cambiar el color del botón de confirmación
            });
            return;
          }
          Swal.fire({
            title:  "Bienvenido",
            text:   "Se ha logueado de forma correcta!",
            icon:   "success",
            confirmButtonColor: "#F6C344", // Cambiar el color del botón de confirmación
          });
          this.authService.addLoginStorage(res['token']); // Guardamos el token en el localStorage
          // console.log(res['token'])
          this.router.navigate(['/']);
          this.formLogin.reset()
        },
        error: (error) => {
          // console.error("Error al verificar usuario: ", error);
          // console.warn('Error interno del servidor');
        }
      }
    )
  }

  ngOnDestroy(): void {
    //Destruimos todas las suscripciones
    this.onDestroy$.next(true);
  }
}
