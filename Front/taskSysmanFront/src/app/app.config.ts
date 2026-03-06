import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideSweetAlert2 } from '@sweetalert2/ngx-sweetalert2';
import { provideHttpClient } from '@angular/common/http';
import { TaskRepository } from './core/repositories/task.repository';
import { TaskService } from './services/task.services';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(),
  { provide: TaskRepository, useClass: TaskService }, provideSweetAlert2(), provideRouter(routes)]
};
