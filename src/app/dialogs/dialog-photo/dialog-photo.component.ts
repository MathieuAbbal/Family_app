import { Component, OnInit } from '@angular/core';

import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Photo } from '../../models/photo.model';
import { PhotosService } from '../../services/photos.service';
import { MatDialogRef } from '@angular/material/dialog';
import { auth, db } from '../../firebase';
import { ref, get } from 'firebase/database';

@Component({
    selector: 'app-dialog-photo',
    imports: [ReactiveFormsModule],
    templateUrl: './dialog-photo.component.html',
    styleUrls: ['./dialog-photo.component.css']
})
export class DialogPhotoComponent implements OnInit {
  photoForm!: FormGroup;
  fileUrl!: string;
  fileIsUploading = false;
  fileUploaded = false;
  createdDate!: string;

  constructor(
    private ps: PhotosService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<DialogPhotoComponent>
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.photoForm = this.formBuilder.group({
      title: [''],
    });
  }

  onSavePhoto() {
    const title = this.photoForm.get('title')!.value;
    const date = new Date();
    const createdDate = date.toString();
    const newPhoto = new Photo(title, createdDate);
    newPhoto.image = this.fileUrl;
    const user = auth.currentUser;
    if (user) {
      newPhoto.authorUid = user.uid;
      get(ref(db, `/users/${user.uid}`)).then(snap => {
        const profile = snap.val() || {};
        newPhoto.authorName = profile.displayName || user.displayName || '';
        newPhoto.authorPhoto = profile.photoURL || user.photoURL || '';
        this.ps.createNewPhoto(newPhoto);
        this.dialogRef.close();
      });
    } else {
      this.ps.createNewPhoto(newPhoto);
      this.dialogRef.close();
    }
  }

  onUploadFile(file: File) {
    this.fileIsUploading = true;
    this.ps.uploadFile(file).then((url: string) => {
      this.fileUrl = url;
      this.fileIsUploading = false;
      this.fileUploaded = true;
    });
  }

  detectFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.onUploadFile(input.files[0]);
    }
  }
}
