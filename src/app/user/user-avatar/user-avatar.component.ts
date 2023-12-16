import { Component } from '@angular/core';
import { EditProfileService } from '../edit-profile.service';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-user-avatar',
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.css']
})
export class UserAvatarComponent {

  user: User | null = null;


  constructor(private editProfileService: EditProfileService) { }

  ngOnInit(): void {
    this.editProfileService.getUserData().subscribe(
      (userData) => {
        this.user = userData;
        console.log('user', this.user);
      },
      (error) => {
        console.error(error);
      }
    );
  }




}
