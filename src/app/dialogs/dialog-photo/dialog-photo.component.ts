import { Component, OnInit } from '@angular/core';

import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Photo } from '../../models/photo.model';
import { PhotosService } from '../../services/photos.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-photo',
    imports: [ReactiveFormsModule],
    templateUrl: './dialog-photo.component.html',
    styleUrls: ['./dialog-photo.component.css']
})
export class DialogPhotoComponent implements OnInit {
  photoForm!: UntypedFormGroup;
  fileUrl!: string;
  fileIsUploading = false;
  fileUploaded = false;
  createdDate!: string;

  constructor(
    private ps: PhotosService,
    private formBuilder: UntypedFormBuilder,
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
    this.ps.createNewPhoto(newPhoto);
    this.dialogRef.close();
  }

  onUploadFile(file: File) {
    this.fileIsUploading = true;
    this.ps.uploadFile(file).then((url: any) => {
      this.fileUrl = url;
      this.fileIsUploading = false;
      this.fileUploaded = true;
    });
  }

  detectFiles(event: any) {
    this.onUploadFile(event.target.files[0]);
  }
}
