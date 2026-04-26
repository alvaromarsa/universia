import { Routes } from '@angular/router';

export const planetRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./planet/planet.component').then((m) => m.PlanetComponent),
    data: { animation: 'PlanetsPage' },
  },
  {
    path: ':nombrePlaneta',
    loadComponent: () =>
      import('./planet-detail/planet-detail.component').then((m) => m.PlanetDetailComponent),
    data: { animation: 'PlanetDetailPage' },
  },
];
