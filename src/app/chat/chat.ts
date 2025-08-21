import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Inject, NgZone, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import $ from 'jquery';
import { ChatService } from '../services/chat.service';
@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, HttpClientModule ],
  //changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {
  // socket = io("http://localhost:3000");
  // messages: { sender: string, text: string, isLoading?: boolean }[] = [];
  // userInput = "";

  // constructor(
  //   private ngZone: NgZone,
  //   private cdr: ChangeDetectorRef
  // ) {}

  // ngOnInit() {
  //   this.socket.on("botMessage", (msg: string) => {
  //     this.ngZone.run(() => {
  //       // Remove loading indicator
  //       const loaderIndex = this.messages.findIndex(m => m.isLoading);
  //       if (loaderIndex !== -1) {
  //         this.messages.splice(loaderIndex, 1);
  //       }

  //       // Add bot message
  //       this.messages.push({ sender: "bot", text: msg });
  //       this.cdr.markForCheck();
  //     });
  //   });
  // }

  // sendMessage() {
  //   if (this.userInput.trim()) {
  //     // Push user message
  //     this.messages.push({ sender: "user", text: this.userInput });

  //     // Add loading indicator for bot
  //     this.messages.push({ sender: "bot", text: "Typing...", isLoading: true });

  //     // Send to backend
  //     this.socket.emit("userMessage", this.userInput);

  //     // Clear input
  //     this.userInput = "";
  //     this.cdr.detectChanges();
  //   }
  // }
//   socket: any;
  
//   messages: { sender: string, text: string, isLoading?: boolean }[] = [];
//   userInput = "";
//   typingInterval: any;

//   @ViewChild('chatContainer') chatContainer!: ElementRef;

//   constructor(
//     private ngZone: NgZone,
//     private cdr: ChangeDetectorRef,
//     private appRef: ApplicationRef
//   ) {}

//   ngOnInit() {
//     this.socket = io("http://localhost:3000");
//     this.socket.on("botMessage", (msg: string) => {
//       // Run inside Angular zone to trigger change detection
//       this.ngZone.run(() => {
//         // Remove loading indicator
//         const loaderIndex = this.messages.findIndex(m => m.isLoading);
//         if (loaderIndex !== -1) {
//           this.messages.splice(loaderIndex, 1);
//         }

//         // Add bot message
//         this.messages.push({ sender: "bot", text: msg });
//         // ❌ No detectChanges() here
//       });
//     });
//   }

//  sendMessage() {
//     if (this.userInput.trim()) {
//       // Push user message
//       this.messages.push({ sender: "user", text: this.userInput });

//       // Add loading indicator for bot
//       this.messages.push({ sender: "bot", text: "Typing...", isLoading: true });

//       // Send to backend
//       this.socket.emit("userMessage", this.userInput);

//       // Clear input
//       this.userInput = "";
//       // ❌ No detectChanges() here either
//     }
//   }

//   animateTyping(loader: { sender: string, text: string, isLoading?: boolean }) {
//     let dots = 0;
//     if (this.typingInterval) clearInterval(this.typingInterval);

//     this.typingInterval = setInterval(() => {
//       dots = (dots + 1) % 4;
//       loader.text = "Typing" + ".".repeat(dots);
//       this.cdr.detectChanges();
//     }, 400);
//   }

//   scrollToBottom() {
//     setTimeout(() => {
//       if (this.chatContainer) {
//         this.chatContainer.nativeElement.scrollTop =
//           this.chatContainer.nativeElement.scrollHeight;
//       }
//     }, 100);
//   }

 @ViewChild('chatInput') chatInput!: ElementRef<HTMLInputElement>;
 
inputType: string = 'text'; // default
placeholder: string = 'Type here...';

 messages: any[] = [];
   userInput = '';
   chatuserInput = '';
   //inputType: 'text' | 'number' | 'date' | 'select' = 'text';
   selectOptions: string[] = [];
 
  formInputs: { [key: string]: any } = {}; // store each slot value
currentSlot: string | null = null;
isTyping: boolean = false;

   constructor(@Inject(PLATFORM_ID) private platformId: Object,private chatService: ChatService, private cdr: ChangeDetectorRef, private ngZone: NgZone) {}
 
  ngOnInit(): void {
    //this.send('hi')
    // Load history
     this.chatService.getHistory().subscribe((h: any) => {
      if (h && Array.isArray(h)) {
        this.ngZone.run(() => {
          //this.messages = h;
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      }
    });
  }
 
  // Focus input programmatically
  focusInput() {
    if (this.chatInput) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.chatInput.nativeElement.focus();
        }, 0);
      });
    }
  }

  // Simulate Enter press programmatically
  triggerEnter() {
    if (this.chatInput) {
      const event = new KeyboardEvent('keyup', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter'
      });
      this.chatInput.nativeElement.dispatchEvent(event);
    }
  }

  sendFileToRasa(filename: string, base64?: string) {
    // this.ngZone.run(() => {
    //    this.messages.push({
    //             from: 'bot',
    //             text: "Processing your document... please wait ⏳",
    //             timestamp: new Date(),
    //             currentSlot: this.currentSlot,
    //           });
    // })
   
  // Example: send as a text message with a special intent
  const payload = `/file_uploaded{"filename":"${filename}","content":"${base64 || ''}"}`;
  this.sendFile(filename,payload); // reusing your send() method
}

/** Handle button click: show title to user, sanitize payload, send to Rasa */
  sendFile(filename: any, payload: any) {
    this.isTyping = true; // show typing indicator

    this.ngZone.run(() => {
   // 1) Show what user chose
    this.messages.push({ from: 'user', text: filename || 'Selected', timestamp: new Date() });


    // 4) Send message to Rasa
    this.chatService.sendMessage(payload).subscribe((res: any) => {
      this.isTyping = false; // hide typing indicator
      if (Array.isArray(res)) {
        this.ngZone.run(() => {
          for (let r of res) {
            if (r.text) {
              this.messages.push({
                from: 'bot',
                text: r.text,
                timestamp: new Date(),
                currentSlot: this.currentSlot,
              });
              this.handleBotMessage(r.text);
              this.updateInputTypeBasedOnBot(r.text);
            }
            if (r.buttons) {
              this.messages.push({
                from: 'bot',
                buttons: r.buttons,
                timestamp: new Date(),
              });
            }
            if (r.custom && r.custom.data && r.custom.data.type === 'file_upload') {
              this.messages.push({
                from: 'bot',
                text: r.custom.data.text || 'Please upload a file:',
                timestamp: new Date(),
                custom: { type: 'file_upload' }
              });
            }
            
            if (r.custom && r.custom.data && r.custom.data.type === 'details_card') {
              console.log('Details card:', r);
              this.messages.push({
                from: 'bot',
                type: 'details_card',
                title: r.custom.data.title,
                fields: r.custom.data.fields
              });
            }
          }
          // ✅ trigger change detection manually
          // Focus input
          $('#chatInput').focus();

          // Set a value
          $('#chatInput').val('Hello bot');

          // Trigger Enter key programmatically
          const e = $.Event('keyup', { which: 13 }); // enter key
          $('#chatInput').trigger(e);       // trigger enter
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      }
    });
  });

    
  }

  send(value?: any, displayText?: string) {
    this.isTyping = true; // show typing indicator
    console.log('Sending message:', value, displayText);
 // If function is called without a value, use current input field value
 const text = (displayText ?? value ?? this.userInput).toString();
  //const text = (value ?? this.userInput).toString();
    if (!text || text.trim() === '') return;

    //const text = this.userInput == '' ? this.chatuserInput : this.userInput;
    this.messages.push({ from: 'user', text, timestamp: new Date() });
    this.chatService.sendMessage(text).subscribe((res: any) => {
      this.isTyping = false; // hide typing indicator
      if (Array.isArray(res)) {
        this.ngZone.run(() => {
          for (let r of res) {
            console.log(r)
            if (r.text) {
              console.log('Bot response:', r.text);
              this.messages.push({
                from: 'bot',
                text: r.text,
                timestamp: new Date(),
                currentSlot: this.currentSlot,
              });
              this.handleBotMessage(r.text);
              this.updateInputTypeBasedOnBot(r.text);
            }
            if (r.buttons) {
              this.messages.push({
                //from: 'bot',
                buttons: r.buttons,
                timestamp: new Date()
              });
            }
           if (r.custom && r.custom.data && r.custom.data.type === 'details_card') {
              console.log('Details card:', r);
              this.messages.push({
                from: 'bot',
                type: 'details_card',
                title: r.custom.data.title,
                fields: r.custom.data.fields
              });
            }
            //this.updateInputTypeBasedOnBot(r.text);
          }
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      }
      this.userInput = '';
    });
  }

  private scrollToBottom(): void {
    if (isPlatformBrowser(this.platformId)) { // ✅ only run in browser
      const container = $('.messages');
      if (container.length) {
        container.stop().animate({ scrollTop: container[0].scrollHeight }, 300);
      }
    }
  }
 
  /** Handle button click: show title to user, sanitize payload, send to Rasa */
  onButtonClick(parentMsg: any, btn: any) {
    
    this.isTyping = true; // show typing indicator
    this.ngZone.run(() => {
   // 1) Show what user chose
    this.messages.push({ from: 'user', text: btn.title || 'Selected', timestamp: new Date() });

    // 2) Sanitize payload (convert '{{' '}}' back to '{' '}' for Rasa parsing)
    let payload: string = btn.payload || '';
    if (payload.startsWith('/')) {
      payload = this.sanitizePayload(payload);
    } else if (!payload) {
      // fallback to title if payload missing
      payload = btn.title;
    }

    // 3) Optionally disable this button group after click
    parentMsg.buttonsDisabled = true;

    // 4) Send message to Rasa
    this.chatService.sendMessage(payload).subscribe((res: any) => {
      this.isTyping = false; // hide typing indicator
      if (Array.isArray(res)) {
        this.ngZone.run(() => {
          for (let r of res) {
            if (r.text) {
              this.messages.push({
                from: 'bot',
                text: r.text,
                timestamp: new Date(),
                currentSlot: this.currentSlot,
              });
              this.handleBotMessage(r.text);
              this.updateInputTypeBasedOnBot(r.text);
            }
            if (r.buttons) {
              this.messages.push({
                from: 'bot',
                buttons: r.buttons,
                timestamp: new Date(),
              });
            }
            if (r.custom && r.custom.data && r.custom.data.type === 'file_upload') {
              this.messages.push({
                from: 'bot',
                text: r.custom.data.text || 'Please upload a file:',
                timestamp: new Date(),
                custom: { type: 'file_upload' }
              });
            }
            if (r.custom && r.custom.data && r.custom.data.type === 'details_card') {
              console.log('Details card:', r);
              this.messages.push({
                from: 'bot',
                type: 'details_card',
                title: r.custom.data.title,
                fields: r.custom.data.fields
              });
            }
          }
          // ✅ trigger change detection manually
          // Focus input
          $('#chatInput').focus();

          // Set a value
          $('#chatInput').val('Hello bot');

          // Trigger Enter key programmatically
          const e = $.Event('keyup', { which: 13 }); // enter key
          $('#chatInput').trigger(e);       // trigger enter
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      }
    });
  });

    
  }


  onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];

  // ✅ Optional: convert to base64 if you want to send full content
  const reader = new FileReader();
  reader.onload = () => {
    const base64 = reader.result as string;

    console.log("📤 File selected:", file.name);
    console.log("📄 Base64 content:", base64);

    // Send message to backend Rasa
    this.sendFileToRasa(file.name, base64);
  };
  reader.readAsDataURL(file); // converts file to base64
}


  /** Render responses from Rasa (text + buttons) */
  private handleRasaResponses(responses: any) {
    if (!Array.isArray(responses)) return;

    this.ngZone.run(() => {
      for (const r of responses) {
        if (r.text) {
          this.messages.push({
            from: 'bot',
            text: r.text,
            timestamp: new Date(),
            currentSlot: this.currentSlot
          });
          this.handleBotMessage(r.text);
        }
        if (r.buttons) {
          this.messages.push({
            from: 'bot',
            buttons: r.buttons,
            timestamp: new Date()
          });
        }
        // (optional) handle images, attachments, custom payloads here
        // if (r.image) { ... }
        // if (r.custom) { ... }
      }
      this.cdr.detectChanges();
      this.scrollToBottom();
    });
  }
  /** Convert escaped braces from domain.yml payloads back to normal JSON braces */
  private sanitizePayload(p: string): string {
    // from /choose_application{{"application":"medicaid"}} to /choose_application{"application":"medicaid"}
    return p.replace('{{', '{').replace('}}', '}');
  }

  handleBotMessage(cmsg: any) {
    
  //this.messages.push({ from: 'bot', text: msg.text });
console.log('Bot message:', cmsg);
  // Detect which slot bot is asking for
  var msg = cmsg ? cmsg.toLowerCase() : '';
  if (msg.includes('full_name')) {
    this.currentSlot = 'name';
  } else if (msg.includes('date_of_birth')) {
    this.currentSlot = 'dob';
  } else if (msg.includes('monthly_income')) {
    this.currentSlot = 'income';
  } else if (msg.includes('type_of_insurance')) {
    this.currentSlot = 'insurance_type';
  } else {
    this.currentSlot = null;
  }
}

sendSlotValue() {
  if (this.currentSlot) {
    const value = this.formInputs[this.currentSlot];
    this.send(value);
    this.currentSlot = null;
  }
}

  updateInputTypeBasedOnBot(cBotText: any) {
    var botText = cBotText ? cBotText.toLowerCase() : '';
    if (botText.includes('full_name')) { this.inputType = 'text'; }
    else if (botText.includes('date_of_birth')) { this.inputType = 'date'; }
    else if (botText.includes('monthly_income')) { this.inputType = 'number'; }
    else if (botText.includes('which_insurance')) { this.inputType = 'select'; this.selectOptions = ['Health','Life','Motor']; }
    else { this.inputType = 'text'; }
  }
 
  onSelect(option: any) {
    this.chatuserInput = option;
    this.send();
  }

  ngAfterViewInit() {
    this.welcomsend('/greet', true);  
  }

   isOpen = false;  // track open/close

  toggleChat(value?: boolean) {
    this.isOpen = value !== undefined ? value : this.isOpen;
    console.log(value)
    if (this.isOpen) {
    console.log('Chat opened');

    // Wait for the DOM to render the messages container
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.scrollToBottom();
        if (this.messages.length === 0) {
            this.welcomsend('/greet', true);   // Rasa will match to intent greet → utter_greet
          }
      }, 0); // 0ms allows the DOM to update
    });
  }

    // if(value === true) {
    //   console.log('Chat opened');
    //   this.scrollToBottom(); // scroll to bottom when toggled
    //   this.scrollToBottom();
    // }
    
  }


  welcomsend(message: string, silent: boolean = false) {
  if (!message.trim()) return;

  if (!silent) {
    this.messages.push({ from: 'user', text: message }); // only show real user msgs
  }
this.isTyping = true; // show typing indicator
  this.chatService.sendMessage(message).subscribe((res: any) => {
    this.isTyping = false; // hide typing indicator
      if (Array.isArray(res)) {
        this.ngZone.run(() => {
          for (let r of res) {
            console.log(r)
            if (r.text) {
              console.log('Bot response:', r.text);
              this.messages.push({
                from: 'bot',
                text: r.text,
                timestamp: new Date(),
                currentSlot: this.currentSlot,
              });
              this.handleBotMessage(r.text);
              this.updateInputTypeBasedOnBot(r.text);
            }
            if (r.buttons) {
              this.messages.push({
                //from: 'bot',
                buttons: r.buttons,
                timestamp: new Date()
              });
            }
            if (r.custom && r.custom.data && r.custom.data.type === 'details_card') {
              console.log('Details card:', r);
              this.messages.push({
                from: 'bot',
                type: 'details_card',
                title: r.custom.data.title,
                fields: r.custom.data.fields
              });
            }
            //this.updateInputTypeBasedOnBot(r.text);
          }
          this.cdr.detectChanges();
          this.scrollToBottom();
        });
      }
      this.userInput = '';
    });
}

}
