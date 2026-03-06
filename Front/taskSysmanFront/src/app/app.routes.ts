import { Routes } from '@angular/router';
import { TasksComponent } from './components/page/task/task.component';
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'tareas',
        pathMatch: 'full'
    },
    {
        path: 'tareas',
        component: TasksComponent
    }
];
