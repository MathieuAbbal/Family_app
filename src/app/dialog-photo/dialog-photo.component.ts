
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Photo } from '../models/photo.model';
import { PhotosService } from '../services/photos.service';



@Component({
  selector: 'app-dialog-photo',
  templateUrl: './dialog-photo.component.html',
  styleUrls: ['./dialog-photo.component.css']
})



export class DialogPhotoComponent implements OnInit {
 
  photoForm!: FormGroup;
  fileUrl!: string;
  fileIsUploading = false;
  fileUploaded = false;

  constructor(private ps: PhotosService,
    private formBuilder:FormBuilder,
    private router: Router) { }

  ngOnInit(): void {
    this.initForm();
    
  }
  
  initForm(){
    this.photoForm=this.formBuilder.group({
      title:['', Validators.required],
    //  photo:['',Validators.required]

    });
  }
  onSavePhoto(){
    const title = this.photoForm.get('title')!.value;
    
    const newPhoto = new Photo(title);
    newPhoto.photo = this.fileUrl
    
    this.ps.createNewPhoto(newPhoto);
    console.log(newPhoto);
    this.router.navigate(['/photo']);
  }
    

  onUploadFile(file: File) {
    this.fileIsUploading = true;
    this.ps.uploadFile(file).then(
      (url: any) => {
        this.fileUrl = url;
        this.fileIsUploading = false;
        this.fileUploaded = true;
      }
    );
  }
  detectFiles(event :any) {
    this.onUploadFile(event.target.files[0]);
}
}
