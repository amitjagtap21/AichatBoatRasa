import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
 
@Injectable({
  providedIn: 'root'
})

export class ChatService {
    private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  backend = 'http://localhost:3000';
  userId: string;

  constructor() {
    // SSR-safe window access
    if (isPlatformBrowser(this.platformId)) {
      const w = window as any;
      if (w?.env?.BACKEND_URL) this.backend = w.env.BACKEND_URL;

      let id = localStorage.getItem('chatUserId');
      if (!id) { id = uuidv4(); localStorage.setItem('chatUserId', id); }
      this.userId = id;
    } else {
      // server-side render fallback
      this.userId = 'ssr-user';
    }
  }
 
  sendMessage(message: string) {
return this.http.post(`${this.backend}/chat`, { message, userId: this.userId });
  }
 
  uploadFile(file: File) {
    const fd = new FormData();
    fd.append('file', file);
return this.http.post(`${this.backend}/upload`, fd);
  }
 
  getHistory() {
    return this.http.get(`${this.backend}/chat/history/${this.userId}`);
  }
 
  checkEligibility(payload: any) {
return this.http.post(`${this.backend}/eligibility`, { ...payload, userId: this.userId });
  }
}