import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MapViewComponent } from './map-view/map-view.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
    {
        path:'/login',
        component:LoginComponent
    },
    {
        path:'',
        canActivate:[AuthGuard],
        component:MapViewComponent
    }
];
