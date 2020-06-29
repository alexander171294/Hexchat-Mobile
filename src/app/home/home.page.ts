import { Component } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { ModalController, GestureController, Gesture } from '@ionic/angular';
import { AddServerPage } from '../add-server/add-server.page';
import { ServerData, ServersService } from '../services/servers.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  
  public servers: ServerData[];

  constructor(private wsSrv: WebsocketService, 
              private modalController: ModalController, 
              private srvSrv: ServersService) {
    this.refreshServers();
    this.srvSrv.onServerChange().subscribe(srv => {
      this.refreshServers();
    })
  }

  refreshServers() {
    this.servers = [];
    Object.entries(this.srvSrv.getServers()).forEach((srv) => {
      this.servers.push(srv[1]);
    });
  }

  refresh(ev) {
    setTimeout(() => {
      ev.detail.complete();
    }, 3000);
  }

  async showAddServer(serverId?: string) {
    const modal = await this.modalController.create({
      component: AddServerPage,
      componentProps: {
        serverID: serverId
      },
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  edit(server: ServerData) {
    this.showAddServer(server.id);
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
