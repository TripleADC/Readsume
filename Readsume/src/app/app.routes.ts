import { Routes } from '@angular/router';

import { Layout } from './core/layout/layout';
import { Home } from './core/home/home';
import { Login } from './core/login/login';

export const routes: Routes = [
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'home',
        component: Home
    },
    {   path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
