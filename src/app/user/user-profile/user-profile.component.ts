import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';

import { EditProfileService } from '../edit-profile.service';
import { User } from '../../models/user.model';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-profile',
    imports: [ReactiveFormsModule],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  user: User | null = null;
  profileForm!: FormGroup;
  fileUrl!: string;
  fileIsUploading = false;
  fileUploaded = false;
  private userSubscription!: Subscription;

  @ViewChild('previewImg') previewImg!: ElementRef<HTMLImageElement>;

  constructor(
    private editProfileService: EditProfileService,
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.editProfileService.getUserData().subscribe(
      (userData) => {
        this.user = userData;
        if (this.user) {
          this.initForm(this.user);
        }
      },
      () => {
        this._snackBar.open('Erreur lors du chargement du profil', '', { duration: 5000 });
      }
    );
  }

  initForm(user: User) {
    this.profileForm = this.formBuilder.group({
      emailControl: [{ value: user?.email || '', disabled: true }, [Validators.required, Validators.email]],
      displayNameControl: [user?.displayName || ''],
      phoneNumberControl: [user?.phoneNumber || ''],
      photoURLControl: [''],
      dateBirthControl: [user?.dateBirth ? user.dateBirth.substring(0, 10) : ''],
    });
    this.fileUrl = this.user?.photoURL || 'https://i.pinimg.com/originals/2f/15/f2/2f15f2e8c688b3120d3d26467b06330c.jpg';
  }

  loadFile(file: File): void {
    this.fileIsUploading = true;
    const oldUrl = this.user?.photoURL || '';
    this.editProfileService.deleteOldAvatar(oldUrl).then(() => {
      return this.editProfileService.uploadFile(file);
    }).then((url: string) => {
      this.fileUrl = url;
      this.profileForm.get('photoURLControl')?.setValue('');
      this.fileIsUploading = false;
      this.fileUploaded = true;
    });
  }

  detectFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.loadFile(input.files[0]);
    }
  }

  onSubmitProfileForm() {
    const uid = this.user?.uid;
    if (!uid) return;
    const formData = this.profileForm.value;
    const userData = {
      displayName: formData.displayNameControl,
      phoneNumber: formData.phoneNumberControl,
      photoURL: this.fileUrl,
      dateBirth: formData.dateBirthControl
    };
    this.editProfileService.updateUserData(uid, userData)
      .then(() => this._snackBar.open('Profil mis a jour', 'avec succes !!', { duration: 5000 }))
      .catch(() => this._snackBar.open('Erreur lors de la mise a jour', '', { duration: 5000 }));
  }


  ngOnDestroy() {
    if (this.userSubscription) { this.userSubscription.unsubscribe(); }
  }
}
