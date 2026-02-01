import { Component, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { BottomNavComponent } from './layout/bottom-nav/bottom-nav.component';
import { TopBarComponent } from './layout/top-bar/top-bar.component';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, SidebarComponent, BottomNavComponent, TopBarComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FamilyApp';
  isAuth = false;

  ngOnInit() {
    onAuthStateChanged(auth, user => {
      this.isAuth = !!user;
    });
  }
}
