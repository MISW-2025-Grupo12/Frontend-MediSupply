import { Routes } from "@angular/router";
import { LoginPage } from "./pages/login/login.page/login.page";

export const LOGIN_ROUTES: Routes = [
  { 
    path: '', 
    component: LoginPage,
    data: { titleKey: 'titles.login' }
  },
];