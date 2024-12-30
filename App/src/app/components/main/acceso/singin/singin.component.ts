import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { UsuarioService } from '../../../../services/usuario.service';
import { Usuario } from '../../../../interfaces/interface';
import { takeUntil } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { ButtonModule } from 'primeng/button';

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-singin',
  standalone: true,
  imports: [CommonModule, ButtonModule, ReactiveFormsModule, RouterOutlet, InputTextModule, PasswordModule],
  templateUrl: './singin.component.html',
})
export class SinginComponent {
  usuarios: Usuario[] = [];
  onDestroy$ = new Subject<boolean>();

  formUser =    new FormGroup({
    nombre:     new FormControl('', [Validators.required, Validators.minLength(3)]),
    apellidos:  new FormControl('', [Validators.required, Validators.minLength(3)]),
    email:      new FormControl('', [Validators.required, Validators.pattern(this.usuarioService.emailPattern)]),
    password:   new FormControl('', [Validators.required, Validators.minLength(4)]),
    direccion:  new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  constructor(private usuarioService: UsuarioService, private router: Router) { }

  /**
   * Agrega un nuevo usuario.
   * 
   * Verifica si el formulario del usuario es válido. Si no es válido, muestra un mensaje de error.
   * Crea un objeto de usuario con los valores del formulario.
   * Llama al servicio de usuario para guardar el usuario en la base de datos.
   * Muestra mensajes de éxito o error según el resultado de la operación.
   * Limpia los campos de correo electrónico y contraseña del formulario.
   * 
   * @returns Una suscripción al observable que se completa cuando se agrega el usuario.
   */
  agregarUsuario() {
    if (this.formUser.invalid) {
      Swal.fire({
        title:  "Error",
        text:   "Debe completar todos los campos!",
        icon:   "error",
        confirmButtonColor: "#F6C344", 
      });
      return;
    }
    const usuario: any = {
      nombre:     this.formUser.value.nombre?.trim(),
      apellidos:  this.formUser.value.apellidos?.trim(),
      email:      this.formUser.value.email?.trim(),
      password:   this.formUser.value.password?.trim(),
      direccion:  this.formUser.value.direccion?.trim()
    };
    return this.usuarioService.setUsuario(usuario).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: (res: any) => {
        if(res['message'] == 'correo en uso'){
          Swal.fire({
            title:  "Error al registrar usuario",
            text:   "El usuario ya existe!",
            icon:   "error",
            confirmButtonColor: "#F6C344", 
          });
        }else{
          Swal.fire({
            title:  "Usuario registrado",
            text:   "Se ha registrado con exito!",
            icon:   "success",
            confirmButtonColor: "#F6C344", 
          });
          this.router.navigate(['/login']);
        }
        this.formUser.controls['email'].setValue('');
        this.formUser.controls['password'].setValue('');
      },
      error: (error) => {
        // console.error("Error al agregar usuario: ", error);
        // console.log(error.error.message);
      }
    }
    );
  }

  ngOnDestroy(): void {
    //Destruimos todas las suscripciones
    this.onDestroy$.next(true);
  }
}
