import { Routes } from "@angular/router";
import { LoginPage } from "./pages/login/login.page/login.page";
import { RegisterPage } from "./pages/register-page/register-page";

export const LOGIN_ROUTES: Routes = [
  { 
    path: '', 
    component: LoginPage,
    data: { titleKey: 'titles.login' }
  },
];

export const REGISTER_ROUTES: Routes = [
  { 
    path: '', 
    component: RegisterPage,
    data: { titleKey: 'titles.register' }
  },
];