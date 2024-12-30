import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-admin-info',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin-info.component.html',
  styleUrl: './admin-info.component.scss'
})
export class AdminInfoComponent {

  constructor(private router: Router) { }

  /**
   * Evita que la pagina se muestre vacia y carga el componente reservas.
   */
  ngOnInit(): void {
    // recargar*
    this.router.navigate(['/admin-info/reservas']);

  }
}
