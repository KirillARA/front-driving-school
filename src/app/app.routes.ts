import { Routes }
from '@angular/router';

import { Login }
from './pages/login/login';

import { MainLayout }
from './pages/main-layout/main-layout';

import { authGuard }
from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'main',
    component: MainLayout,
    canActivate: [authGuard]
  }
];