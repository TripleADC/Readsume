import { Routes } from '@angular/router';

import { Layout } from './core/layout/layout/layout';
import { Home } from './core/home/home';
import { Login } from './core/login/login';
import { ResumeUpload } from './features/profile/resume-upload/resume-upload';
import { Profile } from './features/profile/profile/profile';
import { DisplayName } from './features/display-name/display-name/display-name';

import { AuthGuard } from '@auth0/auth0-angular';
import { DisplayNameGuard } from './shared/guards/display-name.guard';

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
                component: Home,
                canActivate: [DisplayNameGuard]
            },
            {
                path: 'profile',
                component: Profile,
                canActivate: [DisplayNameGuard]
            },
            {
                path: 'resume-upload',
                component: ResumeUpload,
                canActivate: [DisplayNameGuard]
            },
            {
                path: 'display-name',
                component: DisplayName
            }
        ],
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];
