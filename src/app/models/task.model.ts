export class Task {
    constructor(
        public id: string,
        public name: string,
        public urg: string,
        public title: string,
        public descriptif: string,
        public statut:string,
        public createdDate: string
    ) { }
}