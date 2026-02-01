import { Routes } from '@angular/router';
import { AddTaskComponent } from './tasks/add-task/add-task.component';
import { SigninComponent } from './user/auth/signin/signin.component';
import { HomeComponent } from './home/home.component';
import { MapComponent } from './map/map.component';
import { PhotoComponent } from './photo/photo.component';
import { AuthGuardService } from './services/auth-guard.service';
import { ShoppingComponent } from './shopping/shopping.component';
import { EditTaskComponent } from './tasks/edit-task/edit-task.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { CalendarComponent } from './calendar/calendar.component';
import { DocumentsComponent } from './documents/documents.component';

export const routes: Routes = [
  { path: 'auth/signin', component: SigninComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', canActivate: [AuthGuardService], component: HomeComponent },
  { path: 'user-profile', canActivate: [AuthGuardService], component: UserProfileComponent },
  { path: 'add-task', canActivate: [AuthGuardService], component: AddTaskComponent },
  { path: 'photo', canActivate: [AuthGuardService], component: PhotoComponent },
  { path: 'shopping', canActivate: [AuthGuardService], component: ShoppingComponent },
  { path: 'map', canActivate: [AuthGuardService], component: MapComponent },
  { path: 'calendar', canActivate: [AuthGuardService], component: CalendarComponent },
  { path: 'documents', canActivate: [AuthGuardService], component: DocumentsComponent },
  { path: 'task/edit/:id', canActivate: [AuthGuardService], component: EditTaskComponent },
];
  