import { Routes } from '@angular/router';

export const technologyRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./technology/technology.component').then((m) => m.TechnologyComponent),
    data: { animation: 'TechnologyPage' },
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./technology-detail.component/technology-detail.component').then(
        (m) => m.TechnologyDetailComponent
      ),
    data: { animation: 'TechnologyDetailPage' },
  },
];
