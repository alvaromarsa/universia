import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { PlanetComponent } from './features/planet/planet/planet.component';
import { PlanetDetailComponent } from './features/planet/planet-detail/planet-detail.component';
import { LoginComponent } from './features/login/login-component';
import { RegisterComponent } from './features/register/register.component';
import { TechnologyComponent } from './features/tecnology/technology/technology.component';
import { TechnologyDetailComponent } from './features/tecnology/technology-detail.component/technology-detail.component';

export const routes: Routes = [

  { path: '',
    component: HomeComponent,
    data: { animation: 'HomePage' }
  },
  { path: 'planets',
    component: PlanetComponent,
    data: { animation: 'PlanetsPage' }
  },
  { path: 'planets/:nombrePlaneta',
    component: PlanetDetailComponent,
    data: { animation: 'PlanetDetailPage' }
  },
  { path: 'login',
    component: LoginComponent,
    data: { animation: 'LoginPage' }
  },
    { path: 'register',
    component: RegisterComponent,
    data: { animation: 'RegisterPage' }
  },
  { path: 'technology',
    component: TechnologyComponent,
    data: { animation: 'TechnologyPage' }
  },
  { path: 'technology/:id',
    component: TechnologyDetailComponent,
    data: { animation: 'TechnologyDetailPage' }
  },
  { path: '**',
    component: HomeComponent,
    data: { animation: 'HomePage' }
  },

];
