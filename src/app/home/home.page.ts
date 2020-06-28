import { Component } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { ModalController } from '@ionic/angular';
import { AddServerPage } from '../add-server/add-server.page';
import { ServerData } from '../services/serverData';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  
  public servers: ServerData[] = [];

  constructor(private wsSrv: WebsocketService, public modalController: ModalController) {
    const server = new ServerData();
    server.connected = true;
    server.created = 'now';
    server.name = 'Hira Network';
    server.server = 'irc.hira.li:6667';
    server.submsg = 'Autojoin: #underc0de';
    this.servers.push(server);
  }

  refresh(ev) {
    setTimeout(() => {
      ev.detail.complete();
    }, 3000);
  }

  async showAddServer() {
    const modal = await this.modalController.create({
      component: AddServerPage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  connect() {
    this.wsSrv.connect('ws://irc.network.org:8091/webirc/websocket/').subscribe(r => {
      console.log('Event received ', r);
    })

    /**
ENCODING CP1252
HOST irc.hira.li:6667
user websocket * * :WebSocket User
nick websocket_842
     */
  }

  send() {
    const command = prompt('ingrese el comando');
    if(command) {
      this.wsSrv.getWS().send(command);
    }
  }

}
