import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';
import { Message } from '../models/message.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { auth } from '../firebase';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  messages: Message[] = [];
  newMessage = '';
  currentUid = '';
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  private unsubscribe: (() => void) | null = null;
  private shouldScroll = true;

  // Delete confirmation modal
  showDeleteModal = false;
  messageToDelete: Message | null = null;

  // Comments
  expandedComments: Set<string> = new Set();
  commentInputs: { [messageId: string]: string } = {};

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private chatService: ChatService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUid = auth.currentUser?.uid || '';
    this.chatService.markAsRead();
    this.unsubscribe = this.chatService.listenMessages(messages => {
      this.messages = messages;
      this.shouldScroll = true;
      this.chatService.markAsRead();
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToTop();
      this.shouldScroll = false;
    }
  }

  private scrollToTop(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) {
      el.scrollTop = 0;
    }
  }

  isMine(msg: Message): boolean {
    return msg.uid === this.currentUid;
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui à ${time}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier à ${time}`;
    }
    const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    return `${dateStr} à ${time}`;
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }

  showDateSeparator(index: number): boolean {
    if (index === 0) return true;
    const prev = new Date(this.messages[index - 1].timestamp).toDateString();
    const curr = new Date(this.messages[index].timestamp).toDateString();
    return prev !== curr;
  }

  openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  async send(): Promise<void> {
    if (!this.newMessage.trim() && !this.selectedImage) return;
    const text = this.newMessage;
    const image = this.selectedImage;
    this.newMessage = '';
    this.removeImage();
    await this.chatService.sendMessage(text, image || undefined);
    this.snackBar.open('Publication envoyée !', '', { duration: 2000 });
  }

  async toggleLike(msg: Message): Promise<void> {
    await this.chatService.toggleLike(msg.id);
  }

  openDeleteModal(msg: Message): void {
    if (msg.uid === this.currentUid) {
      this.messageToDelete = msg;
      this.showDeleteModal = true;
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.messageToDelete = null;
  }

  async confirmDelete(): Promise<void> {
    if (this.messageToDelete) {
      await this.chatService.deleteMessage(this.messageToDelete);
      this.closeDeleteModal();
      this.snackBar.open('Publication supprimée', '', { duration: 2000 });
    }
  }

  // Comments methods
  toggleComments(msgId: string): void {
    if (this.expandedComments.has(msgId)) {
      this.expandedComments.delete(msgId);
    } else {
      this.expandedComments.add(msgId);
    }
  }

  isCommentsExpanded(msgId: string): boolean {
    return this.expandedComments.has(msgId);
  }

  async addComment(msgId: string): Promise<void> {
    const text = this.commentInputs[msgId]?.trim();
    if (!text) return;
    this.commentInputs[msgId] = '';
    await this.chatService.addComment(msgId, text);
    this.snackBar.open('Commentaire ajouté', '', { duration: 2000 });
  }

  async deleteComment(msgId: string, commentId: string): Promise<void> {
    await this.chatService.deleteComment(msgId, commentId);
    this.snackBar.open('Commentaire supprimé', '', { duration: 2000 });
  }

  ngOnDestroy(): void {
    this.chatService.leaveChatPage();
    this.unsubscribe?.();
  }
}
