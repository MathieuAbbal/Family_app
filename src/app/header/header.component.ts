import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { UserAvatarComponent } from '../user/user-avatar/user-avatar.component';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

@Component({
    selector: 'app-header',
    imports: [RouterModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, UserAvatarComponent],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {


  isAuth!: boolean;


  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    onAuthStateChanged(auth,
      (user) => {
        if(user) {
          this.isAuth = true;
        } else {
          this.isAuth = false;
        }
      }
    );
  }
  onSignOut() {
    this.authService.signOutUser();

  }
}
