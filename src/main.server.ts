// import { bootstrapApplication } from '@angular/platform-browser';
// import { App } from './app/app';
// import { config } from './app/app.config.server';

// const bootstrap = () => bootstrapApplication(App, config);

// export default bootstrap;

import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { serverConfig } from './app/app.config.server';

const config = { ...appConfig, providers: [...(appConfig.providers ?? []), ...(serverConfig.providers ?? [])] };
export default function () {
  return bootstrapApplication(App, config);
}