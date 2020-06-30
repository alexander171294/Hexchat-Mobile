import { Component, OnInit, ViewChild, ElementRef, MissingTranslationStrategy } from '@angular/core';
import { MenuController, NavController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ConnectionHandlerService, WSData, RawMessageEvent, IRCMessage } from '../services/connection-handler.service';
import { IRCParser } from '../utils/IrcParser';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  public messages: IRCMessage[];
  private serverID: string;
  public filter: string;
  public command: string;

  // public chats: ChatsStream;

  @ViewChild('listChat') listChat: ElementRef;

  constructor(private menu: MenuController,
              private routerOutlet: IonRouterOutlet,
              private route: ActivatedRoute,
              private connHdlr: ConnectionHandlerService,
              private navCtrl: NavController) { }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    this.serverID = this.route.snapshot.paramMap.get('id');
    const wsd: WSData = this.connHdlr.getWSData(this.serverID);
    this.messages = [];
    if(wsd) {
      wsd.rawStream.forEach((data) => {
        this.addMessage(data);
      });
      this.connHdlr.onMessageReceived().subscribe((rwMsg: RawMessageEvent) => {
        if(this.serverID == rwMsg.serverID) {
          this.addMessage(rwMsg.message);
        }
      });
    } else {
      this.navCtrl.navigateBack('/home');
    }
  }

  channels() {
    this.menu.open('channels');
  }

  users() {
    this.menu.open('users');
  }

  ionViewWillLeave() {
    this.routerOutlet.swipeGesture = true;
  }

  addMessage(rawMSG: IRCMessage) {
    // const now = new Date();
    // IRCParser.parseMessage(rawMSG).forEach(parsedMessage => {
    //   const msg = new IRCMessage();
    //   if(parsedMessage.code != 'PRIVMSG') {
    //     msg.special = true;
    //     msg.message = parsedMessage.message;
    //     msg.nick = '*';
    //   } else {
    //     msg.message = parsedMessage.message;
    //     msg.nick = parsedMessage.simplyOrigin;
    //     msg.time = now.getDate()+'/'+(now.getMonth()+1)+'/'+now.getFullYear();
    //     if (parsedMessage.target === this.connHdlr.getServerNick(this.serverID)) { // privado hacia mi
    //       // TODO: guardar en un chat stream y luego filtrarlo por seleccion
    //     } else { // de un canal

    //     }
    //   }
    //   this.messages.push(msg);
    // });
    // setTimeout(() => {
    //   console.log(this.listChat);
    //   if(this.listChat) {
    //     this.listChat.nativeElement.scrollTo(this.listChat.nativeElement.scrollHeight);
    //   }
    // }, 10);
    this.messages.push(rawMSG);
  }

  sendCommand(evt) {
    if(evt.keyCode == 13) {
      if(this.command[0] == '/') {
        this.connHdlr.send(this.serverID, this.command.slice(1));
      } else {

      }
      this.command = '';
    }
  }

}

