import { Component, signal } from '@angular/core';
import { Chat } from './chat/chat';

@Component({
  selector: 'app-root',
  imports: [Chat],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('rasa-angular-chat');
  formData = {
    name: '',
    dob: '',
    state: '',
    city: '',
    household: 1,
    income: '',
    pregnant: '',
    insured: ''
  };

  onSubmit() {
    console.log('Form Data Submitted:', this.formData);
    alert('Eligibility check initiated!');
  }
}
