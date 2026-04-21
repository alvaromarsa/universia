import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, UserProfile } from 'src/app/core/services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {

  isLoggedOut = false;
  userProfile$: Observable<UserProfile | null>;

  constructor(public authService: AuthService, private router: Router) {
    this.userProfile$ = this.authService.userProfile$;
  }

  async logout() {
    await this.authService.logout();
    this.isLoggedOut = true;
  }

}
