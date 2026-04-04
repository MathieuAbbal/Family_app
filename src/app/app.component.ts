import { Component, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { BottomNavComponent } from './layout/bottom-nav/bottom-nav.component';
import { TopBarComponent } from './layout/top-bar/top-bar.component';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { LocationService } from './services/location.service';
import { UpdateService } from './services/update.service';
import { ChatService } from './services/chat.service';
import { NotificationService } from './services/notification.service';

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
    private updateService: UpdateService,
    private chatService: ChatService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.updateService.init();

    onAuthStateChanged(auth, async (user) => {
      this.isAuth = !!user;
      if (user) {
        await this.locationService.startTracking();
        this.chatService.startUnreadListener();
        await this.notificationService.init();
      } else {
        await this.locationService.stopTracking();
        this.chatService.stopUnreadListener();
        await this.notificationService.removeToken();
      }
    });
  }
}
