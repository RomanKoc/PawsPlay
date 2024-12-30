import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GalleriaModule, GalleriaResponsiveOptions } from 'primeng/galleria';
import { RouterLink } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [ButtonModule, CalendarModule, FormsModule, GalleriaModule, RouterLink],
  templateUrl: './main.component.html',
})
export class MainComponent {

  /**
   * Fecha.
   */
  date: any;

  /**
   * Opciones de respuesta para el carrousel (primeng).
   */
  responsiveOptions: GalleriaResponsiveOptions[] | undefined;

  /**
   * Array de imagenes para insertar en el carrousel.
   */
  images: { itemImageSrc: string; thumbnailImageSrc: string; }[] | undefined;

  constructor(private userService: UsuarioService) { }

  /**
   * Se emite un evento cada vez que se inicia el componente con userService.emitInit(). SUSTITUÍDO POR NAVIGATIONSTART
   * Se emiten las imagenes en el carrousel.
   * @returns {void}
   */
  ngOnInit() {
    // this.userService.emitInit(); // SUSTITUÍDO POR NAVIGATIONSTART
    this.images = [
      { itemImageSrc: '../../../assets/mascota1.jpeg', thumbnailImageSrc: '../../../assets/fff.jpeg' },
      { itemImageSrc: '../../../assets/mascota3.jpeg', thumbnailImageSrc: '../../../assets/fff.jpeg' },
      { itemImageSrc: '../../../assets/mascota2.jpeg', thumbnailImageSrc: '../../../assets/fff.jpeg' },
      { itemImageSrc: '../../../assets/mascota0.jpeg', thumbnailImageSrc: '../../../assets/fff.jpeg' },
      { itemImageSrc: '../../../assets/mascota4.jpeg', thumbnailImageSrc: '../../../assets/fff.jpeg' },
      { itemImageSrc: '../../../assets/mascota5.jpeg', thumbnailImageSrc: '../../../assets/fff.jpeg' },
      { itemImageSrc: '../../../assets/mascota6.jpeg', thumbnailImageSrc: '../../../assets/fff.jpeg' },
      { itemImageSrc: '../../../assets/mascota7.jpeg', thumbnailImageSrc: '../../../assets/fff.jpeg' },
      { itemImageSrc: '../../../assets/mascota8.jpeg', thumbnailImageSrc: '../../../assets/fff.jpeg' },
    ];
  }
}
