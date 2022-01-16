import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Photo } from '../models/photo.model';
import { PhotosService } from '../services/photos.service';

@Component({
  selector: 'app-dialog-photo',
  templateUrl: './dialog-photo.component.html',
  styleUrls: ['./dialog-photo.component.css'],
})
export class DialogPhotoComponent implements OnInit {
  photoForm!: FormGroup;
  fileUrl!: string;
  fileIsUploading = false;
  fileUploaded = false;
  createdDate!: string;

  constructor(private ps: PhotosService, private formBuilder: FormBuilder) {}

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
  //  const date = new Date();
    var d = new Date();
    var date =  d.getDate()+'/'+(d.getMonth()+1)+'/'+d.getFullYear();
    var hours = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    var fullDate = date+' à '+hours;
    console.log(fullDate);
    const createdDate = fullDate ;
    
    const newPhoto = new Photo(title,createdDate);
    newPhoto.image = this.fileUrl;

    this.ps.createNewPhoto(newPhoto);
    console.log('test', newPhoto);
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
