import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './footer.component.html',

})
export class FooterComponent {


  preguntas:  boolean = false;
  privacidad: boolean = false;
  terminos:   boolean = false;

  showPreguntas()   { this.preguntas  = true; }

  showPrivacidad()  { this.privacidad = true; }

  showTerminos()    { this.terminos   = true; }

}

