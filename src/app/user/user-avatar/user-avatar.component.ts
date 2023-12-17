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
  fileUrl!: string;

  constructor(private editProfileService: EditProfileService) { }

  ngOnInit(): void {
    this.editProfileService.getUserData().subscribe(
      (userData) => {
        this.user = userData;
        this.fileUrl = this.user?.photoURL || 'https://i.pinimg.com/originals/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg';
        console.log('user', this.user);
      },
      (error) => {
        console.error(error);
      }
    );
  }




}
