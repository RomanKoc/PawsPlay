import { AdminInfoComponent } from './components/main/info/admin-info/admin-info.component';
import { authGuard, authGuardAdmin, authGuardIsLog } from './guards/auth.guard';
import { LoginComponent } from './components/main/acceso/login/login.component';
import { MainComponent } from './components/main/main.component';
import { ReservaComponent } from './components/main/reserva/reserva.component';
import { ReservasComponent } from './components/main/info/admin-info/reservas/reservas.component';
import { Routes } from '@angular/router';
import { SinginComponent } from './components/main/acceso/singin/singin.component';
import { UserInfoComponent } from './components/main/info/user-info/user-info.component';
import { UsuariosComponent } from './components/main/info/admin-info/usuarios/usuarios.component';

export const routes: Routes = [
    { path: '',     component: MainComponent },
    { path: 'main', component: MainComponent },
    // si esta log no entra aqui
    { path: 'login',
    loadComponent: () => import('./components/main/acceso/login/login.component').then(m => m.LoginComponent),
    canActivate: [authGuardIsLog] },
    { path: 'singin',
    loadComponent: () => import('./components/main/acceso/singin/singin.component').then(m => m.SinginComponent)
    , canActivate: [authGuardIsLog] },
    // solo entra si es admin
    {
        path: 'admin-info',
        loadComponent: () => import('./components/main/info/admin-info/admin-info.component').then(m => m.AdminInfoComponent),
        canActivate: [authGuardAdmin],
        children: [
            { path: 'reservas', component: ReservasComponent },
            { path: 'usuarios', component: UsuariosComponent }
        ]
    },
    // si esta logueado que no entre aqui
    { path: 'user-info',
    loadComponent: () => import('./components/main/info/user-info/user-info.component').then(m => m.UserInfoComponent),
    canActivate: [authGuard] },
    { path: 'reserva',   
    loadComponent: () => import('./components/main/reserva/reserva.component').then(m => m.ReservaComponent),
    canActivate: [authGuard] },
    { path: '**', redirectTo: 'main' }

];