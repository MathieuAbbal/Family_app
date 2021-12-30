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
  apiKey: "***FIREBASE_API_KEY***",
  authDomain: "familyapp-e83b7.firebaseapp.com",
  databaseURL: "https://familyapp-e83b7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "familyapp-e83b7",
  storageBucket: "familyapp-e83b7.appspot.com",
  messagingSenderId: "728695329604",
  appId: "***FIREBASE_WEB_APP_ID***"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
  }
}
