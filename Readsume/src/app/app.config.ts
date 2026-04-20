import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth0, authHttpInterceptorFn } from '@auth0/auth0-angular';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { environment } from '../environments/environment';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAuth0({
      domain: environment.domain,
      clientId: environment.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: 'readsume_api'
      },
      httpInterceptor: {
        allowedList: [
          {
            uri: "http://localhost:3000/*",
            tokenOptions: {
              authorizationParams: {
                audience: "readsume_api"
              }
            }
          }
        ]
      }
    }),
    provideHttpClient(withInterceptors([authHttpInterceptorFn]))
  ]
};
