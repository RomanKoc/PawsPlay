import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, takeUntil } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Usuario } from '../../../../../interfaces/interface';
import { UsuarioService } from '../../../../../services/usuario.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule, FormsModule, InputTextModule],
  templateUrl: './usuarios.component.html',
})
export class UsuariosComponent {
  usuarios: Usuario[] = [];
  onDestroy$          = new Subject<boolean>();
  filtro              = '';

  constructor(private usuarioService: UsuarioService,) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.usuarioService.getUsuarios().pipe(
      takeUntil(this.onDestroy$),
    ).subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
        // console.log('usuarios->', this.usuarios);
      },
      error: (error: any) => {
        // console.warn('Error interno del servidor');
      }
    })
  }

  borrarUsuario(id_usuario: number) {
    return this.usuarioService.deleteUsuario(id_usuario).pipe(
      takeUntil(this.onDestroy$)
    ).subscribe({
      next: () => {
        this.cargarDatos();
        Swal.fire({
          title: 'Usuario eliminado',
          text: 'Usuario borrado correctamente!',
          icon: 'success',
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

  deleteUsuario(id_usuario: number) {
    Swal.fire({
      title: 'Eliminar usuario',
      text: 'Estas seguro de querer borrar el usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F6C344',
      confirmButtonText: 'Si, borrar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) { this.borrarUsuario(id_usuario); }
    })
  }

  /* para imprimr en la tabla de reservas las mascotas que hay en el array */
  obtenerNombresMascotas(mascotas: any[]) {
    return mascotas.map(mascota => mascota.nombre).join(', ');
  }

  usuarioCoincideConFiltro(usuario: any): boolean {
    return usuario.nombre.toLowerCase()   .includes(this.filtro.toLowerCase())
      ||   usuario.apellidos.toLowerCase().includes(this.filtro.toLowerCase())
      ||   usuario.email.toLowerCase()    .includes(this.filtro.toLowerCase())
      ||   usuario.mascotas.some((mascota: any) => mascota.nombre.toLowerCase().includes(this.filtro.toLowerCase()));
  }

  ngOnDestroy(): void {
    //Destruimos todas las suscripciones
    this.onDestroy$.next(true);
  }

}
