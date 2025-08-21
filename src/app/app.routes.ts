import { Routes } from '@angular/router';
import { App } from './app';
import { Chat } from './chat/chat';

export const routes: Routes = [
    {
    path: 'chat',
    component: Chat,
  },
{ path: '', component: App }, // or redirectTo: 'some-path'

];
