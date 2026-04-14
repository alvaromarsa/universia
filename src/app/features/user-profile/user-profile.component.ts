import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/core/services/auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {

  isLoggedOut = false;

  constructor(public authService: AuthService, private router: Router) { }

  getUserRank(): string {
    return localStorage.getItem('userRank') || 'Cadete';
  }

  async logout() {
    await this.authService.logout();
    this.isLoggedOut = true;
  }

}
