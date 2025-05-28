import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: "",
        loadComponent: () => import("./features/home/home.component").then((m) => m.HomeComponent),
        title: "PlanFlow - Inicio",
    },
    {
        path: "login",
        loadComponent: () => import("./features/auth/login/login.component").then((m) => m.LoginComponent),
        title: "Login - PlanFlow",
        data: { renderMode: 'no-prerender' }
    },
    {
        path: 'login/callback',
        loadComponent: () => import('./features/auth/login-callback/login-callback.component').then(m => m.LoginCallbackComponent),
        title: 'Autenticación Trello',
        data: { renderMode: 'no-prerender' }
    },
    {
        path: "dashboard",
        canActivate: [authGuard],
        loadComponent: () => import("./features/dashboard/dashboard.component").then((m) => m.DashboardComponent),
        title: "Dashboard - PlanFlow",
        data: { renderMode: 'no-prerender' }
    },
    {
        path: "board/:id",
        canActivate: [authGuard], 
        loadComponent: () => import("./features/board/board.component").then((m) => m.BoardComponent),
        title: "Tablero - PlanFlow",
        data: { renderMode: 'no-prerender' }
    },
    {
        path: "analytics/:id",
        canActivate: [authGuard],
        loadComponent: () => import("./features/analytics/analytics.component").then((m) => m.AnalyticsComponent),
        title: "Analytics - PlanFlow",
        data: { renderMode: 'no-prerender' }
    },
    {
        path: "**",
        redirectTo: "",
    },
    
];
