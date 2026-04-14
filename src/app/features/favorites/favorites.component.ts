import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthService } from 'src/app/core/services/auth.service';
import { FavoriteItem, FavoritesService } from 'src/app/core/services/favorites.service';

@Component({
  selector: 'favoritesComponent',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent implements OnInit {
  public user: any | null = null;
  public favorites: FavoriteItem[] = [];
  private currentUserUid: string | null = null;

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.currentUserUid = user?.uid ?? null;
      this.favorites = this.currentUserUid
        ? this.favoritesService.getFavorites(this.currentUserUid)
        : [];
      this.cdr.markForCheck();
    });
  }

  removeFavorite(item: FavoriteItem): void {
    if (!this.currentUserUid) {
      return;
    }
    this.favoritesService.removeFavorite(this.currentUserUid, item.id, item.type);
    this.favorites = this.favoritesService.getFavorites(this.currentUserUid);
    this.cdr.markForCheck();
  }

  getFavoriteLink(item: FavoriteItem): string {
    return item.type === 'spacex' ? `/spacex/${item.id}` : `/technology/${item.id}`;
  }

  onImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (image) {
      image.src = 'assets/images/fondo.jpg';
    }
  }
}
