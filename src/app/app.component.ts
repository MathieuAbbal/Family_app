import { Component } from '@angular/core';
import { initializeApp } from "firebase";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FamilyApp';

  constructor(){
   
const firebaseConfig = {
  apiKey: "AIzaSyB4DkZu3SqYLJCrxFGS7DybGGKUBrlJqaI",
  authDomain: "familyapp-e83b7.firebaseapp.com",
  databaseURL: "https://familyapp-e83b7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "familyapp-e83b7",
  storageBucket: "familyapp-e83b7.appspot.com",
  messagingSenderId: "728695329604",
  appId: "1:728695329604:web:c0a1ef7ebf32de4bcd7d11"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
  }
}
