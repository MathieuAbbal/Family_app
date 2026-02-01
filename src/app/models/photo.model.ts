import { Comment } from './comment.model';

export class Photo {
    image!: string;
    _comments?: Comment[];
    _likeCount?: number;
    _liked?: boolean;
    _showComments?: boolean;
    _newCommentText?: string;
    constructor(
        public title: string,
        public createdDate: string
    ) {}
}
