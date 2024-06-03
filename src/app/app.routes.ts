import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
    {path: '', component: AppComponent},
    {path: 'login', component: LoginComponent}
];

// @NgModule({
//     imports: [RouterModule.forRoot(routes)],
//     exports: [RouterModule]
//   })
// export class AppRoutingModule { }