import { Component } from '@angular/core';
import { EditProfileService } from '../edit-profile.service';
import { User } from '../../models/user.model';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  user: User | null = null;
  profileForm!: UntypedFormGroup;
  formBuilder = new UntypedFormBuilder();
  constructor(private editProfileService: EditProfileService) { } // Injection correcte du service

  ngOnInit(): void {
    this.editProfileService.getUserData().subscribe(
      (userData) => {
        this.user = userData;
        console.log('user', this.user);
        this.initForm(this.user)
      },
      (error) => {
        console.error(error);
      }
    );
  }
  initForm(user: User) {
    this.profileForm = this.formBuilder.group({
      emailControl: [{ value: user?.email || '', disabled: true }, [Validators.required, Validators.email]],
      displayNameControl: [user?.displayName || ''],
      phoneNumberControl: [user?.phoneNumber || ''],
      photoURLControl: [user?.photoURL || ''],
      dateBirthControl: [user?.dateBirth || ''],
    });
    // Mettez à jour l'image de profil si elle existe
    if (this.user?.photoURL) {
      const output = document.getElementById('preview_img') as HTMLImageElement;
      output.src = this.user.photoURL;
    }
  }
  loadFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files[0];
    const output = document.getElementById('preview_img') as HTMLImageElement; // Cast en HTMLImageElement
    output.src = URL.createObjectURL(file);
    output.onload = function () {
      URL.revokeObjectURL(output.src); // Libération de la mémoire
    }
  }

  onSubmitProfileForm() {
    console.log('submit profile form', this.profileForm.value);
    if (this.profileForm.valid) {
      const uid = this.user.uid; // Assurez-vous d'avoir l'UID de l'utilisateur
      const formData = this.profileForm.value;

      const userData = {
        displayName: formData.displayNameControl,
        phoneNumber: formData.phoneNumberControl,
        photoURL: formData.photoURLControl,
        dateBirth: formData.dateBirthControl
      };

      this.editProfileService.updateUserData(uid, userData)
        .then(() => {
          console.log('Données utilisateur mises à jour');
        })
        .catch(error => {
          console.error('Erreur lors de la mise à jour des données utilisateur', error);
        });
    }
  }
}

