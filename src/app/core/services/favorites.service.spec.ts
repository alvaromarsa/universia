/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';

import { FavoriteItem, FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  let service: FavoritesService;

  const uid = 'user-123';
  const storageKey = `universia_favorites_${uid}`;
  const favoriteItem: FavoriteItem = {
    id: 'launch-1',
    type: 'spacex',
    title: 'Falcon 9',
    description: 'Demo launch',
    imageUrl: 'assets/images/falcon.jpg',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FavoritesService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return an empty array when the user has no stored favorites', () => {
    expect(service.getFavorites(uid)).toEqual([]);
  });

  it('should return an empty array when uid is missing', () => {
    expect(service.getFavorites('')).toEqual([]);
  });

  it('should add a favorite to the front of the stored list', () => {
    const secondFavorite: FavoriteItem = {
      ...favoriteItem,
      id: 'launch-2',
      title: 'Starship',
    };

    service.addFavorite(uid, favoriteItem);
    service.addFavorite(uid, secondFavorite);

    expect(service.getFavorites(uid)).toEqual([secondFavorite, favoriteItem]);
  });

  it('should not add duplicate favorites with the same id and type', () => {
    service.addFavorite(uid, favoriteItem);
    service.addFavorite(uid, favoriteItem);

    expect(service.getFavorites(uid)).toEqual([favoriteItem]);
  });

  it('should ignore addFavorite when required data is missing', () => {
    service.addFavorite('', favoriteItem);
    service.addFavorite(uid, { ...favoriteItem, id: '' });
    service.addFavorite(uid, { ...favoriteItem, type: undefined as never });

    expect(service.getFavorites(uid)).toEqual([]);
  });

  it('should report whether an item is marked as favorite', () => {
    service.addFavorite(uid, favoriteItem);

    expect(service.isFavorite(uid, favoriteItem.id, favoriteItem.type)).toBeTrue();
    expect(service.isFavorite(uid, 'missing-id', favoriteItem.type)).toBeFalse();
    expect(service.isFavorite('', favoriteItem.id, favoriteItem.type)).toBeFalse();
  });

  it('should remove a favorite by id and type', () => {
    const technologyFavorite: FavoriteItem = {
      id: favoriteItem.id,
      type: 'technology',
      title: 'NASA Tech',
      description: 'Demo technology',
      imageUrl: 'assets/images/tech.jpg',
    };

    service.addFavorite(uid, favoriteItem);
    service.addFavorite(uid, technologyFavorite);

    service.removeFavorite(uid, favoriteItem.id, favoriteItem.type);

    expect(service.getFavorites(uid)).toEqual([technologyFavorite]);
  });

  it('should ignore removeFavorite when uid or id is missing', () => {
    service.addFavorite(uid, favoriteItem);

    service.removeFavorite('', favoriteItem.id, favoriteItem.type);
    service.removeFavorite(uid, '', favoriteItem.type);

    expect(service.getFavorites(uid)).toEqual([favoriteItem]);
  });

  it('should return an empty array when localStorage data is corrupted', () => {
    localStorage.setItem(storageKey, '{not-valid-json');

    expect(service.getFavorites(uid)).toEqual([]);
    expect(service.isFavorite(uid, favoriteItem.id, favoriteItem.type)).toBeFalse();
  });
});
