import { Injectable } from '@angular/core';

export type FavoriteType = 'spacex' | 'technology';

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  title: string;
  description: string;
  imageUrl: string;
  metadata?: Record<string, string>;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private storageKey(uid: string): string {
    return `universia_favorites_${uid}`;
  }

  private parseStoredFavorites(uid: string): FavoriteItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey(uid));
      if (!stored) {
        return [];
      }
      return JSON.parse(stored) as FavoriteItem[];
    } catch {
      return [];
    }
  }

  private writeFavorites(uid: string, favorites: FavoriteItem[]): void {
    localStorage.setItem(this.storageKey(uid), JSON.stringify(favorites));
  }

  getFavorites(uid: string): FavoriteItem[] {
    if (!uid) {
      return [];
    }
    return this.parseStoredFavorites(uid);
  }

  isFavorite(uid: string, id: string, type: FavoriteType): boolean {
    if (!uid || !id) {
      return false;
    }
    return this.getFavorites(uid).some(item => item.id === id && item.type === type);
  }

  addFavorite(uid: string, item: FavoriteItem): void {
    if (!uid || !item || !item.id || !item.type) {
      return;
    }

    const favorites = this.parseStoredFavorites(uid);
    const exists = favorites.some(fav => fav.id === item.id && fav.type === item.type);
    if (exists) {
      return;
    }

    favorites.unshift(item);
    this.writeFavorites(uid, favorites);
  }

  removeFavorite(uid: string, id: string, type: FavoriteType): void {
    if (!uid || !id) {
      return;
    }
    const favorites = this.parseStoredFavorites(uid).filter(item => item.id !== id || item.type !== type);
    this.writeFavorites(uid, favorites);
  }
}
