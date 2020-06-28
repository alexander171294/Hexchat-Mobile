import { Component, OnInit } from '@angular/core';
import { MenuController, NavController, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  constructor(private menu: MenuController, private routerOutlet: IonRouterOutlet) { }

  ngOnInit() {
    this.routerOutlet.swipeGesture = false;
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
