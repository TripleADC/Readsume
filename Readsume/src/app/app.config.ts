import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAuth0({
      domain: "dev-5xjacdlbr0modiu5.us.auth0.com",
      clientId: "zFSWMg5IH4UJk5YeQDVpy3YWUT3qVEfU",
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
    }),
  ]
};
