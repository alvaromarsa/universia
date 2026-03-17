import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { filter, map, Observable } from 'rxjs';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, AsyncPipe],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  isHome$: Observable<boolean>;

  constructor(private router: Router) {
    this.isHome$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: any) => {
        const url = event.urlAfterRedirects;
        return url === '/' || url === '/home' || url === '';
      })
    );
  }
 }
