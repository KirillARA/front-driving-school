// import { bootstrapApplication } from '@angular/platform-browser';
// import { App } from './app/app';
// import { provideAnimations } from '@angular/platform-browser/animations';
// import { provideHttpClient } from '@angular/common/http';

// bootstrapApplication(App, {
//   providers: [provideAnimations(), provideHttpClient()]
// });

import { bootstrapApplication }
from '@angular/platform-browser';

import {
  provideRouter
}
from '@angular/router';

import {
  provideHttpClient
}
from '@angular/common/http';

import {
  provideAnimations
}
from '@angular/platform-browser/animations';

import { App }
from './app/app';

import { routes }
from './app/app.routes';

bootstrapApplication(App, {

  providers: [

    provideRouter(routes),

    provideHttpClient(),

    provideAnimations()
  ]
});