import { Injectable } from '@angular/core';
import { Photo } from '../models/photo.model';
import { db, storage } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class PhotosService {
  photos: Photo[] = [];
  photosSubject = new Subject<Photo[]>();
  constructor(
    private _snackBar: MatSnackBar

  ) {
    this.getPhotos();
  }

  durationInSeconds = 5;
  emitPhotos() {
    this.photosSubject.next(this.photos);
  }
  savePhotos() {
    set(ref(db, '/photos'), this.photos);
  }
  getPhotos() {
    onValue(ref(db, '/photos'), (data) => {
      this.photos = data.val() ? data.val() : [];
      this.emitPhotos();
    });
  }


  createNewPhoto(newPhoto: Photo) {
    this.photos.push(newPhoto);
    this.savePhotos();

    this._snackBar.open('Photo ajoutée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });
  }
  private compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round(height * maxWidth / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => blob ? resolve(blob) : reject('Compression echouee'),
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  uploadFile(file: File): Promise<string> {
    return this.compressImage(file).then((compressed) => {
      const almostUniqueFileName = Date.now().toString();
      const fileRef = storageRef(storage, 'photos/' + almostUniqueFileName + '.jpg');
      return uploadBytes(fileRef, compressed, { contentType: 'image/jpeg' })
        .then((snapshot) => getDownloadURL(snapshot.ref));
    });
  }
  removePhoto(photo: Photo) {
    if (photo?.image) {
      const fileRef = storageRef(storage, photo.image);
      deleteObject(fileRef).catch(
        (error) => {
          console.log('Fichier non trouvé : ' + error);
        }
      )
    }
    const photoIndexToRemove = this.photos.findIndex(
      (El) => El === photo);
    this.photos.splice(photoIndexToRemove, 1);
    this.savePhotos();
    this.emitPhotos();
    this._snackBar.open('Photo supprimée', 'avec succès !!', {
      duration: this.durationInSeconds * 1000,
    });
  }
}
