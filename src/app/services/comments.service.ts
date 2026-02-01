import { Injectable } from '@angular/core';
import { db } from '../firebase';
import { ref, get, push, set, remove } from 'firebase/database';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {

  constructor() { }

  getComments(photoIndex: number): Promise<Comment[]> {
    return get(ref(db, `/photo-interactions/${photoIndex}/comments`))
      .then(snapshot => {
        const data = snapshot.val();
        if (!data) return [];
        return Object.keys(data).map(key => ({ ...data[key], id: key }));
      });
  }

  addComment(photoIndex: number, comment: Omit<Comment, 'id'>): Promise<void> {
    const newRef = push(ref(db, `/photo-interactions/${photoIndex}/comments`));
    return set(newRef, { ...comment, id: newRef.key });
  }

  deleteComment(photoIndex: number, commentId: string): Promise<void> {
    return remove(ref(db, `/photo-interactions/${photoIndex}/comments/${commentId}`));
  }

  toggleLike(photoIndex: number, uid: string): Promise<boolean> {
    const likeRef = ref(db, `/photo-interactions/${photoIndex}/likes/${uid}`);
    return get(likeRef).then(snapshot => {
      if (snapshot.val()) {
        return remove(likeRef).then(() => false);
      } else {
        return set(likeRef, true).then(() => true);
      }
    });
  }

  getLikeCount(photoIndex: number): Promise<number> {
    return get(ref(db, `/photo-interactions/${photoIndex}/likes`))
      .then(snapshot => {
        const data = snapshot.val();
        return data ? Object.keys(data).length : 0;
      });
  }

  isLiked(photoIndex: number, uid: string): Promise<boolean> {
    return get(ref(db, `/photo-interactions/${photoIndex}/likes/${uid}`))
      .then(snapshot => !!snapshot.val());
  }
}
