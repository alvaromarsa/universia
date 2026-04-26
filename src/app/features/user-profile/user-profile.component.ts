import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UserProfile } from 'src/app/core/services/auth.service';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'user-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {

  isLoggedOut = false;
  isEditingDisplayName = false;
  isSavingDisplayName = false;
  displayNameDraft = '';
  displayNameError = '';
  userProfile$: Observable<UserProfile | null>;

  constructor(
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.userProfile$ = this.authService.userProfile$;
  }

  async logout() {
    await this.authService.logout();
    this.isLoggedOut = true;
    this.cdr.markForCheck();
  }

  startDisplayNameEdit(currentDisplayName: string): void {
    this.displayNameDraft = currentDisplayName;
    this.displayNameError = '';
    this.isEditingDisplayName = true;
  }

  cancelDisplayNameEdit(): void {
    this.displayNameDraft = '';
    this.displayNameError = '';
    this.isEditingDisplayName = false;
  }

  async saveDisplayName(): Promise<void> {
    if (this.isSavingDisplayName) {
      return;
    }

    const trimmedDisplayName = this.displayNameDraft.trim();
    if (!trimmedDisplayName) {
      this.displayNameError = 'Introduce un nombre de usuario valido.';
      return;
    }

    this.isSavingDisplayName = true;
    this.displayNameError = '';

    try {
      await this.authService.updateUserDisplayName(trimmedDisplayName);
      this.isEditingDisplayName = false;
    } catch (error) {
      this.displayNameError = 'No se pudo actualizar el nombre de usuario.';
      console.error('Error actualizando el nombre de usuario:', error);
    } finally {
      this.isSavingDisplayName = false;
      this.cdr.markForCheck();
    }
  }

}
