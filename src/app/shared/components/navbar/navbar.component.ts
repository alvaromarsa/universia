import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  isHome: boolean = true;

  constructor(private router: Router) {
    // Escuchamos cada vez que la navegación termina
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Si la ruta es exactamente '/' o vacía, es la Home
      this.isHome = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/home';
    });
  }
 }
