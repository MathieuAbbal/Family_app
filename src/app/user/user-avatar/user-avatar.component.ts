import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouterModule } from '@angular/router';
import { EditProfileService } from '../edit-profile.service';
import { User } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-avatar',
    imports: [RouterModule],
    templateUrl: './user-avatar.component.html',
    styleUrls: ['./user-avatar.component.css']
})
export class UserAvatarComponent implements OnInit, OnDestroy {

  user: User | null = null;
  fileUrl!: string;
  private userSubscription!: Subscription;

  constructor(private editProfileService: EditProfileService) { }

  ngOnInit(): void {
    this.userSubscription = this.editProfileService.getUserData().subscribe(
      (userData) => {
        this.user = userData;
        this.fileUrl = this.user?.photoURL || 'assets/default-avatar.svg';
      },
      (error) => {
        console.error(error);
      }
    );
  }

  ngOnDestroy() {
    if (this.userSubscription) { this.userSubscription.unsubscribe(); }
  }
}
