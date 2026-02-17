import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { PlanetComponent } from './features/planet/planet/planet.component';
import { PlanetDetailComponent } from './features/planet/planet-detail/planet-detail.component';
import { LoginComponent } from './features/login/login-component';
import { RegisterComponent } from './features/register/register.component';

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
  { path: 'login',
    component: LoginComponent,
  },
    { path: 'register',
    component: RegisterComponent,
  },
  { path: '**',
    component: HomeComponent,
  },



];
