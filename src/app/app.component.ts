import { Component, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { BottomNavComponent } from './layout/bottom-nav/bottom-nav.component';
import { TopBarComponent } from './layout/top-bar/top-bar.component';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LocationService } from './services/location.service';
import { UpdateService } from './services/update.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, SidebarComponent, BottomNavComponent, TopBarComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'FamilyApp';
  isAuth = false;

  constructor(
    private locationService: LocationService,
    private updateService: UpdateService
  ) {}

  ngOnInit() {
    this.updateService.init();

    onAuthStateChanged(auth, user => {
      this.isAuth = !!user;
      if (user) {
        this.locationService.startTracking();
      } else {
        this.locationService.stopTracking();
      }
    });
  }
}
