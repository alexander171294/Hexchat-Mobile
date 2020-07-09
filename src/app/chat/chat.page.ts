import { Component, OnInit, ViewChild, ElementRef, MissingTranslationStrategy, OnDestroy } from '@angular/core';
import { MenuController, NavController, IonRouterOutlet, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ConnectionHandlerService, WSData, RawMessageEvent, IRCMessage } from '../services/connection-handler.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit, OnDestroy {

  public messages: IRCMessage[];
  private serverID: string;
  public serverName: string;
  public filter: string;
  public command: string;
  public channelsMenu: string[] = [];
  public usersMenu: string[] = [];
  private wsd: WSData;
  public isChannel: boolean;

  private errorSubscripiton: Subscription;
  private messageSubscription: Subscription;

  constructor(private menu: MenuController,
              private routerOutlet: IonRouterOutlet,
              private route: ActivatedRoute,
              private connHdlr: ConnectionHandlerService,
              private navCtrl: NavController,
              private toastCtrl: ToastController) { }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
    this.serverID = this.route.snapshot.paramMap.get('id');
    this.wsd = this.connHdlr.getWSData(this.serverID);
    this.serverName = this.connHdlr.getServerName(this.serverID);
    this.messages = [];
    if (this.wsd) {
      this.processMessages();
      this.channelsMenu = this.connHdlr.getChannels(this.serverID);
      this.messageSubscription = this.connHdlr.onMessageReceived().subscribe((rwMsg: RawMessageEvent) => {
        if (this.serverID === rwMsg.serverID) {
          if (this.filter) {
            if (this.filter === rwMsg.channel) {
              this.addMessage(rwMsg.message);
            }
          } else {
            this.addMessage(rwMsg.message);
          }
        }
        this.channelsMenu = this.connHdlr.getChannels(this.serverID);
      });
      this.errorSubscripiton = this.connHdlr.onError().subscribe(() => {
        this.presentToast('Error de conexión.');
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
    this.isChannel = channel[0] === '#';
    if (this.isChannel) {
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
    if (this.filter) {
      if (this.wsd.dividedStream[this.filter]) {
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
    this.scrollDown();
    this.messages.push(rawMSG);
  }

  sendCommand(evt) {
    this.command = evt.target.value;
    if (evt.keyCode === 13 && this.command) {
      if (this.command[0] === '/') {
        if (this.command.toLowerCase().indexOf('/query ') === 0 ) {
          let queryFor = this.command.slice(7);
          queryFor = queryFor[0] === '@' ? queryFor.slice(1) : queryFor;
          this.connHdlr.addChannelMSG(this.serverID, '@' + queryFor);
          this.channelsMenu = this.connHdlr.getChannels(this.serverID);
          this.changeFilter('@' + queryFor);
        } else if (this.command.toLowerCase().indexOf('/join ') === 0 ) {
          const channel = this.command.slice(6);
          console.log('JOIN channel?', channel);
          this.connHdlr.addChannelMSG(this.serverID, channel);
          this.channelsMenu = this.connHdlr.getChannels(this.serverID);
          this.changeFilter(channel);
          this.connHdlr.send(this.serverID, 'JOIN ' + channel);
        } else {
          this.connHdlr.send(this.serverID, this.command.slice(1));
        }
      } else {
        if (this.filter) {
          const target = this.filter[0] === '@' ? this.filter.slice(1) : this.filter;
          this.connHdlr.send(this.serverID, 'PRIVMSG ' + target + ' :' + this.command);
          // :Harko!~Harkolandia@harkonidaz.irc.tandilserver.com PRIVMSG Alex172 :probanding
          this.connHdlr.registerMessageSended(this.serverID, this.command, this.filter);
        }
      }
      evt.target.value = '';
    }
  }

  scrollDown() {
    setTimeout(() => {
      const elem = document.getElementById('chatList');
      elem.scrollTo({top: elem.scrollHeight});
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.errorSubscripiton.unsubscribe();
      this.messageSubscription.unsubscribe();
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      color: 'danger',
      duration: 2000
    });
    toast.present();
  }

}

// 332 titulo del canal
// 353 lista de usuarios.
// JOIN usuario se une?
// LEAVE usuario se va?
