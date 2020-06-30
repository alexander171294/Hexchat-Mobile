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
  public serverName: string;
  public filter: string;
  public command: string;
  public channelsMenu: string[] = [];
  public usersMenu: string[] = [];
  private wsd: WSData;
  public isChannel: boolean;

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
    this.wsd = this.connHdlr.getWSData(this.serverID);
    this.serverName = this.connHdlr.getServerName(this.serverID);
    this.messages = [];
    if(this.wsd) {
      this.processMessages();
      this.channelsMenu = this.connHdlr.getChannels(this.serverID);
      this.connHdlr.onMessageReceived().subscribe((rwMsg: RawMessageEvent) => {
        if(this.serverID == rwMsg.serverID) {
          if(this.filter) {
            if(this.filter == rwMsg.channel) {
              this.addMessage(rwMsg.message);
            }
          } else {
            this.addMessage(rwMsg.message);
          }
        }
        this.channelsMenu = this.connHdlr.getChannels(this.serverID);
      });
    } else {
      this.navCtrl.navigateBack('/home');
    }
  }

  channels() {
    this.menu.open('channels');
  }

  changeFilter(channel: string) {
    this.menu.close('channels');
    this.filter = channel;
    this.processMessages();
    this.isChannel = channel[0] == '#';
    if(this.isChannel) {
      this.usersMenu = this.connHdlr.getUsers(this.serverID, this.filter);
    }
  }

  queryUser(user: string) {
    this.menu.close('users');
    let queryFor = user;
    queryFor = queryFor[0] === '@' ? queryFor.slice(1) : queryFor;
    this.connHdlr.addChannelMSG(this.serverID, '@' + queryFor);
    this.channelsMenu = this.connHdlr.getChannels(this.serverID);
    this.changeFilter('@' + queryFor);
  }

  processMessages() {
    this.messages = [];
    if(this.filter) {
      if(this.wsd.dividedStream[this.filter]) {
        this.wsd.dividedStream[this.filter].forEach((data) => {
          this.addMessage(data);
        });
      }
    } else {
      this.wsd.rawStream.forEach((data) => {
        this.addMessage(data);
      });
    }
  }

  users() {
    this.usersMenu = this.connHdlr.getUsers(this.serverID, this.filter);
    this.menu.open('users');
  }

  ionViewWillLeave() {
    // this.routerOutlet.swipeGesture = true;
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
    this.command = evt.target.value;
    if(evt.keyCode == 13 && this.command) {
      if(this.command[0] == '/') {
        if(this.command.toLowerCase().indexOf('/query ') === 0 ) {
          let queryFor = this.command.slice(7);
          queryFor = queryFor[0] === '@' ? queryFor.slice(1) : queryFor;
          this.connHdlr.addChannelMSG(this.serverID, '@' + queryFor);
          this.channelsMenu = this.connHdlr.getChannels(this.serverID);
          this.changeFilter('@' + queryFor);
        } else if(this.command.toLowerCase().indexOf('/join ') === 0 ) {
          let channel = this.command.slice(6);
          console.log('JOIN channel?', channel);
          this.connHdlr.addChannelMSG(this.serverID, channel);
          this.channelsMenu = this.connHdlr.getChannels(this.serverID);
          this.changeFilter(channel);
          this.connHdlr.send(this.serverID, 'JOIN ' + channel);
        } else {
          this.connHdlr.send(this.serverID, this.command.slice(1));
        }
      } else {
        if(this.filter) {
          const target = this.filter[0] === '@' ? this.filter.slice(1) : this.filter;
          this.connHdlr.send(this.serverID, 'PRIVMSG ' + target + ' :' + this.command);
          // :Harko!~Harkolandia@harkonidaz.irc.tandilserver.com PRIVMSG Alex172 :probanding
          this.connHdlr.registerMessageSended(this.serverID, this.command, this.filter);
        }
      }
      evt.target.value = '';
    }
  }

}

// 332 titulo del canal
// 353 lista de usuarios.
// JOIN usuario se une?
// LEAVE usuario se va?