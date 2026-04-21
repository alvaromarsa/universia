import { ChangeDetectionStrategy, Component } from '@angular/core';
import { User } from '@angular/fire/auth';
import { RouterModule, NavigationEnd, Router, RouterLinkActive } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { filter, map, Observable } from 'rxjs';

import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [RouterModule, CommonModule, AsyncPipe, RouterLinkActive],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  isHome$: Observable<boolean>;
  user$: Observable<User | null>;

  constructor(private router: Router, private authService: AuthService) {
    this.isHome$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => {
        const url = event.urlAfterRedirects;
        return url === '/' || url === '/home' || url === '';
      })
    );
    this.user$ = this.authService.user$;
  }

  getLoginRoute(user: User | null): string[] {
    return user ? ['/profile'] : ['/login'];
  }
}
