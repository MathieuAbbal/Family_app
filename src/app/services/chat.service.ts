import { Injectable, signal } from '@angular/core';
import { db, auth, storage } from '../firebase';
import { ref, push, set, remove, onValue, off, query, limitToLast, get } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Message, Comment } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private messagesRef = ref(db, '/chat/messages');
  private _unreadCount = signal(0);
  readonly unreadCount = this._unreadCount.asReadonly();
  private lastReadTimestamp = 0;
  private isOnChatPage = false;
  private unsubUnread: (() => void) | null = null;

  constructor() {
    this.loadLastRead();
  }

  private loadLastRead(): void {
    const saved = localStorage.getItem('chat_last_read');
    this.lastReadTimestamp = saved ? parseInt(saved, 10) : 0;
  }

  markAsRead(): void {
    this.lastReadTimestamp = Date.now();
    localStorage.setItem('chat_last_read', this.lastReadTimestamp.toString());
    this._unreadCount.set(0);
    this.isOnChatPage = true;
  }

  leaveChatPage(): void {
    this.isOnChatPage = false;
  }

  startUnreadListener(): void {
    if (this.unsubUnread) return;
    const q = query(this.messagesRef, limitToLast(100));
    onValue(q, (snapshot) => {
      if (this.isOnChatPage) {
        this._unreadCount.set(0);
        return;
      }
      const data = snapshot.val();
      if (!data) { this._unreadCount.set(0); return; }
      const count = Object.values(data).filter((msg: any) =>
        msg.timestamp > this.lastReadTimestamp && msg.uid !== auth.currentUser?.uid
      ).length;
      this._unreadCount.set(count);
    });
    this.unsubUnread = () => off(q);
  }

  stopUnreadListener(): void {
    this.unsubUnread?.();
    this.unsubUnread = null;
  }

  listenMessages(callback: (messages: Message[]) => void): () => void {
    const q = query(this.messagesRef, limitToLast(100));
    const uid = auth.currentUser?.uid;
    onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (!data) { callback([]); return; }
      const messages: Message[] = Object.keys(data)
        .map(key => {
          const msg = { ...data[key], id: key };
          // Calculate like count and liked status
          msg._likeCount = msg.likes ? Object.keys(msg.likes).length : 0;
          msg._liked = uid ? !!msg.likes?.[uid] : false;
          // Process comments
          if (msg.comments) {
            msg._comments = Object.keys(msg.comments)
              .map(key => ({ ...msg.comments[key], id: key }))
              .sort((a, b) => a.timestamp - b.timestamp);
            msg._commentCount = msg._comments.length;
          } else {
            msg._comments = [];
            msg._commentCount = 0;
          }
          return msg;
        })
        .sort((a, b) => b.timestamp - a.timestamp); // Plus récents en premier (feed style)
      callback(messages);
    });
    return () => off(q);
  }

  async sendMessage(text: string, imageFile?: File): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    if (!text.trim() && !imageFile) return;

    let imageURL: string | undefined;

    // Upload image if provided
    if (imageFile) {
      imageURL = await this.uploadImage(imageFile);
    }

    const newRef = push(this.messagesRef);
    await set(newRef, {
      id: newRef.key,
      text: text.trim(),
      uid: user.uid,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      timestamp: Date.now(),
      ...(imageURL && { imageURL }),
    });
  }

  private async uploadImage(file: File): Promise<string> {
    const compressed = await this.compressImage(file);
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}.jpg`;
    const fileRef = storageRef(storage, `feed/${fileName}`);
    const snapshot = await uploadBytes(fileRef, compressed, { contentType: 'image/jpeg' });
    return getDownloadURL(snapshot.ref);
  }

  private compressImage(file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
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
            (blob) => blob ? resolve(blob) : reject('Compression failed'),
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

  async toggleLike(messageId: string): Promise<void> {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const likeRef = ref(db, `/chat/messages/${messageId}/likes/${uid}`);
    const snapshot = await get(likeRef);
    if (snapshot.val()) {
      await remove(likeRef);
    } else {
      await set(likeRef, true);
    }
  }

  async addComment(messageId: string, text: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;

    const commentRef = push(ref(db, `/chat/messages/${messageId}/comments`));
    await set(commentRef, {
      text: text.trim(),
      uid: user.uid,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      timestamp: Date.now(),
    });
  }

  async deleteComment(messageId: string, commentId: string): Promise<void> {
    await remove(ref(db, `/chat/messages/${messageId}/comments/${commentId}`));
  }

  async deleteMessage(msg: Message): Promise<void> {
    // Delete image from storage if exists
    if (msg.imageURL) {
      try {
        const fileRef = storageRef(storage, msg.imageURL);
        await deleteObject(fileRef);
      } catch (e) {
        console.log('Image not found or already deleted');
      }
    }
    await remove(ref(db, `/chat/messages/${msg.id}`));
  }
}
