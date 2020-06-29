import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AddServerPage } from '../add-server/add-server.page';
import { ServerData, ServersService } from '../services/servers.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  
  public servers: ServerData[];

  constructor(private modalController: ModalController, 
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

}
