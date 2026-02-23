import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChatService } from '../services/chat.service';
import { Message } from '../models/message.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { auth } from '../firebase';

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  host: { style: 'display:flex;flex-direction:column;height:100%;overflow:hidden' }
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  messages: Message[] = [];
  newMessage = '';
  currentUid = '';
  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  private unsubscribe: (() => void) | null = null;
  private shouldScroll = true;

  // Fullscreen lightbox (WhatsApp style)
  fullscreenImages: string[] = [];
  fullscreenIndex = 0;
  showFullscreen = false;
  private lightboxTouchStartY = 0;
  private lightboxTouchStartX = 0;
  lightboxTranslateY = 0;

  // Comments
  expandedComments: Set<string> = new Set();
  commentInputs: { [messageId: string]: string } = {};

  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('lightboxScroller') lightboxScroller!: ElementRef<HTMLElement>;

  constructor(
    private chatService: ChatService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
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

  openFullscreen(urls: string[], index: number): void {
    this.fullscreenImages = urls;
    this.fullscreenIndex = index;
    this.showFullscreen = true;
    this.lightboxTranslateY = 0;
    // Scroll to correct image after render
    setTimeout(() => {
      const scroller = this.lightboxScroller?.nativeElement;
      if (scroller) {
        scroller.scrollTo({ left: index * scroller.clientWidth, behavior: 'instant' as ScrollBehavior });
      }
    });
  }

  closeFullscreen(): void {
    this.showFullscreen = false;
    this.lightboxTranslateY = 0;
  }

  onLightboxScroll(): void {
    const scroller = this.lightboxScroller?.nativeElement;
    if (!scroller || scroller.clientWidth === 0) return;
    this.fullscreenIndex = Math.round(scroller.scrollLeft / scroller.clientWidth);
  }

  onLightboxTouchStart(e: TouchEvent): void {
    this.lightboxTouchStartY = e.touches[0].clientY;
    this.lightboxTouchStartX = e.touches[0].clientX;
  }

  onLightboxTouchMove(e: TouchEvent): void {
    const deltaY = e.touches[0].clientY - this.lightboxTouchStartY;
    const deltaX = Math.abs(e.touches[0].clientX - this.lightboxTouchStartX);
    // Only track vertical swipe if not scrolling horizontally
    if (deltaY > 0 && deltaX < 50) {
      this.lightboxTranslateY = deltaY;
    }
  }

  onLightboxTouchEnd(): void {
    // Swipe down to close (threshold 120px)
    if (this.lightboxTranslateY > 120) {
      this.closeFullscreen();
    } else {
      this.lightboxTranslateY = 0;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (!this.showFullscreen) return;
    if (e.key === 'Escape') this.closeFullscreen();
    if (e.key === 'ArrowLeft') {
      const scroller = this.lightboxScroller?.nativeElement;
      if (scroller) scroller.scrollBy({ left: -scroller.clientWidth, behavior: 'smooth' });
    }
    if (e.key === 'ArrowRight') {
      const scroller = this.lightboxScroller?.nativeElement;
      if (scroller) scroller.scrollBy({ left: scroller.clientWidth, behavior: 'smooth' });
    }
  }

  openFilePicker(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      this.selectedImages.push(...newFiles);
      // Create previews
      for (const file of newFiles) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreviews.push(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    // Reset input so the same files can be re-selected
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  removeAllImages(): void {
    this.selectedImages = [];
    this.imagePreviews = [];
  }

  async send(): Promise<void> {
    if (!this.newMessage.trim() && this.selectedImages.length === 0) return;
    const text = this.newMessage;
    const images = this.selectedImages.length > 0 ? [...this.selectedImages] : undefined;
    this.newMessage = '';
    this.removeAllImages();
    await this.chatService.sendMessage(text, images);
    this.snackBar.open('Publication envoyée !', '', { duration: 2000 });
  }

  async toggleLike(msg: Message): Promise<void> {
    await this.chatService.toggleLike(msg.id);
  }

  confirmDeleteMessage(msg: Message): void {
    if (msg.uid !== this.currentUid) return;
    this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: 'Supprimer cette publication ?' }
    }).afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.chatService.deleteMessage(msg);
        this.snackBar.open('Publication supprimée', '', { duration: 2000 });
      }
    });
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

  confirmDeleteComment(msgId: string, commentId: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { customMessage: 'Supprimer ce commentaire ?' }
    }).afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.chatService.deleteComment(msgId, commentId);
        this.snackBar.open('Commentaire supprimé', '', { duration: 2000 });
      }
    });
  }

  ngOnDestroy(): void {
    this.chatService.leaveChatPage();
    this.unsubscribe?.();
  }
}
