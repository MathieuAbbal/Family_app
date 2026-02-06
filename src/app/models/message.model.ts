export interface Comment {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL: string;
  timestamp: number;
}

export interface Message {
  id: string;
  text: string;
  uid: string;
  displayName: string;
  photoURL: string;
  timestamp: number;
  imageURL?: string;
  likes?: { [uid: string]: boolean };
  comments?: { [key: string]: Comment };
  _likeCount?: number;
  _liked?: boolean;
  _commentCount?: number;
  _comments?: Comment[];
}
