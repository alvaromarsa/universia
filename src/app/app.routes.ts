import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: { animation: 'HomePage' }
  },
  {
    path: 'planets',
    loadChildren: () => import('./features/planet/planet.routes').then((m) => m.planetRoutes),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
    data: { animation: 'LoginPage' }
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
    data: { animation: 'RegisterPage' }
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/user-profile/user-profile.component').then((m) => m.UserProfileComponent),
    canActivate: [authGuard],
    data: { animation: 'ProfilePage' }
  },
  {
    path: 'technology',
    loadChildren: () =>
      import('./features/tecnology/technology.routes').then((m) => m.technologyRoutes),
  },
  {
    path: 'spacex',
    loadChildren: () => import('./features/spacex/spacex.routes').then((m) => m.spacexRoutes),
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/favorites/favorites.component').then((m) => m.FavoritesComponent),
    canActivate: [authGuard],
    data: { animation: 'FavoritesPage' }
  },
  {
    path: '**',
    component: HomeComponent,
    data: { animation: 'HomePage' }
  },
];
