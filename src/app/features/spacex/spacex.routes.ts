import { Routes } from '@angular/router';

export const spacexRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./spaceX/spacex.component').then((m) => m.SpacexComponent),
    data: { animation: 'SpacexPage' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./spaceX-view.component/spaceX-view.component').then((m) => m.SpaceXViewComponent),
    data: { animation: 'SpacexDetailPage' },
  },
];
