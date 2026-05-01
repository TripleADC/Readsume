import { Routes } from '@angular/router';

import { Layout } from './core/layout/layout/layout';
import { Home } from './core/home/home';
import { Login } from './core/login/login';
import { ResumeUpload } from './features/profile/resume-upload/resume-upload';
import { Profile } from './features/profile/profile/profile';

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
            {
                path: 'profile',
                component: Profile
            },
            {
                path: 'resume-upload',
                component: ResumeUpload
            }
        ],
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
