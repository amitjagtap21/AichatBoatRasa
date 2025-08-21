// import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
// import { provideServerRendering, withRoutes } from '@angular/ssr';
// import { appConfig } from './app.config';
// import { serverRoutes } from './app.routes.server';
// import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http';

// const serverConfig: ApplicationConfig = {
//   providers: [
//     provideServerRendering(withRoutes(serverRoutes)),
//     // HttpClient for the SERVER render pass
//     provideHttpClient(withInterceptorsFromDi(), withFetch()),
//   ]
// };

// export const config = mergeApplicationConfig(appConfig, serverConfig);

import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';

export const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // HttpClient for the SERVER render pass
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
  ]
};