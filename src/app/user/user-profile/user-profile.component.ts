import { Component, ElementRef, ViewChild } from '@angular/core';
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
  fileUrl!: string;
  fileIsUploading = false;
  fileUploaded = false;

  @ViewChild('previewImg') previewImg: ElementRef<HTMLImageElement>;

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
    console.log('init form', user);
    this.profileForm = this.formBuilder.group({
      emailControl: [{ value: user?.email || '', disabled: true }, [Validators.required, Validators.email]],
      displayNameControl: [user?.displayName || ''],
      phoneNumberControl: [user?.phoneNumber || ''],
      photoURLControl: [''],
      dateBirthControl: [user?.dateBirth || ''],
    });
    this.fileUrl = this.user?.photoURL || '';
  
  }
  loadFile(file: File): void {
    this.fileIsUploading = true;
    this.editProfileService.uploadFile(file).then((url: any) => {
      this.fileUrl = url;
      this.profileForm.get('photoURLControl').setValue('');
      this.fileIsUploading = false;
      this.fileUploaded = true;
    })
  }
  detectFiles(event: any) {
    this.loadFile(event.target.files[0]);
  }
  onSubmitProfileForm() {
    console.log('submit profile form', this.profileForm.value);
    
      const uid = this.user.uid; // Assurez-vous d'avoir l'UID de l'utilisateur
      const formData = this.profileForm.value;

      const userData = {
        displayName: formData.displayNameControl,
        phoneNumber: formData.phoneNumberControl,
        photoURL: this.fileUrl,
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
  ngAfterViewInit() {
    
  }
}

