import { Routes } from '@angular/router';

import { Layout } from './core/layout/layout/layout';
import { Home } from './core/home/home';
import { Login } from './core/login/login';

import { AuthGuard } from '@auth0/auth0-angular';

export const routes: Routes = [
    {
        path: 'login',
        component: Login,
    },
    {   path: '',
        component: Layout,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'home',
                pathMatch: 'full'
            },
            {
                path: 'home',
                component: Home
            },
        ],
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
