// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { App } from './app/app';

// bootstrapApplication(App, appConfig)
//   .catch((err) => console.error(err));


// import { provideHttpClient } from '@angular/common/http';
// import { bootstrapApplication } from '@angular/platform-browser';
// import { App } from './app/app';

// bootstrapApplication(App, {
//   providers: [
//     provideHttpClient() // ✅ This replaces HttpClientModule in standalone apps
//   ]
// });

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig)
  .catch(err => console.error(err));
