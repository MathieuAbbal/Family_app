import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddTaskComponent } from './add-task/add-task.component';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { MapComponent } from './map/map.component';
import { PhotoComponent } from './photo/photo.component';
import { AuthGuardService } from './services/auth-guard.service';
import { ShoppingComponent } from './shopping/shopping.component';

const routes: Routes = [
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/signin', component: SigninComponent },
  { path: '', canActivate: [AuthGuardService],  component: SigninComponent },
  { path: 'home', canActivate: [AuthGuardService],  component:HomeComponent},
  { path: 'add-task', canActivate: [AuthGuardService],   component: AddTaskComponent },
  { path: 'photo', canActivate: [AuthGuardService],  component: PhotoComponent },
  { path: 'shopping', canActivate: [AuthGuardService],  component: ShoppingComponent },
  { path: 'map', canActivate: [AuthGuardService],  component: MapComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
