import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, IonRouterOutlet } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ConnectionHandlerService, WSData, RawMessageEvent } from '../services/connection-handler.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  public messages: Message[];
  private serverID: string;

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
        const msg = new Message();
        msg.message = data;
        this.messages.push(msg);
      });
      this.connHdlr.onMessageReceived().subscribe((rwMsg: RawMessageEvent) => {
        if(this.serverID == rwMsg.serverID) {
          const msg = new Message();
          msg.message = rwMsg.message;
          this.messages.push(msg);
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

}

export class Message {
  public me: boolean;
  public special: boolean;
  public nick: string;
  public message: string;
  public time: string;
}