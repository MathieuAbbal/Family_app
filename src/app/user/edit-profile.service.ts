import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { auth, db, storage } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

@Injectable({
  providedIn: 'root'
})
export class EditProfileService {

  constructor() { }

  getUserData(): Observable<any> {
    return new Observable((observer) => {
      const unsubscribe = onAuthStateChanged(auth,
        (user) => {
          if (user) {
            get(ref(db, '/users/' + user.uid)).then((snapshot) => {
              const userData = snapshot.val();
              observer.next(userData);
            }).catch((error) => {
              observer.error(error);
            });
          } else {
            observer.next(null);
          }
        },
        (error) => {
          observer.error(error);
        },
        () => {
          observer.complete();
        }
      );
      return unsubscribe;
    });
  }
  updateUserData(uid: string, data: any): Promise<void> {
    return update(ref(db, `/users/${uid}`), data);
  }


  deleteOldAvatar(oldUrl: string): Promise<void> {
    if (!oldUrl || !oldUrl.includes('firebasestorage.googleapis.com')) {
      return Promise.resolve();
    }
    return deleteObject(storageRef(storage, oldUrl)).catch(() => {});
  }

  private compressImage(file: File, maxWidth = 400, quality = 0.7): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e: any) => {
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
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  uploadFile(file: File) {
    return this.compressImage(file).then((compressed) => {
      const almostUniqueFileName = Date.now().toString();
      const fileRef = storageRef(storage, '/avatars/' + almostUniqueFileName + '.jpg');
      return uploadBytes(fileRef, compressed, { contentType: 'image/jpeg' })
        .then((snapshot) => getDownloadURL(snapshot.ref));
    });
  }
}
