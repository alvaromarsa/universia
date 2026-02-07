import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component/home.component';
import { PlanetComponent } from './features/planet/planet.component/planet.component';
import { PlanetDetailComponent } from './features/planet/planet-detail.component/planet-detail.component';

export const routes: Routes = [

  { path: '',
    component: HomeComponent,
  },
  { path: 'planets',
    component: PlanetComponent,
  },
  { path: 'planets/:nombrePlaneta',
    component: PlanetDetailComponent,
  },
  { path: '**',
    component: HomeComponent,
  },



];
