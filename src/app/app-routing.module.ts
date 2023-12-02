import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddTaskComponent } from './tasks/add-task/add-task.component';
import { SigninComponent } from './user/auth/signin/signin.component';
import { SignupComponent } from './user/auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { MapComponent } from './map/map.component';
import { PhotoComponent } from './photo/photo.component';
import { AuthGuardService } from './services/auth-guard.service';
import { ShoppingComponent } from './shopping/shopping.component';

import { EditTaskComponent } from './tasks/edit-task/edit-task.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';

const routes: Routes = [
  { path: 'auth/signup', component: SignupComponent },
  { path: 'auth/signin', component: SigninComponent },
  { path: '', canActivate: [AuthGuardService],  component: SigninComponent },
  { path: 'home', canActivate: [AuthGuardService],  component:HomeComponent},
  { path: 'user-profile', canActivate: [AuthGuardService],  component: UserProfileComponent },
  { path: 'add-task', canActivate: [AuthGuardService],   component: AddTaskComponent },
  { path: 'photo', canActivate: [AuthGuardService],  component: PhotoComponent },
  { path: 'shopping', canActivate: [AuthGuardService],  component: ShoppingComponent },
  { path: 'map', canActivate: [AuthGuardService],  component: MapComponent },
  { path: 'edit/:index', canActivate: [AuthGuardService], component: EditTaskComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
