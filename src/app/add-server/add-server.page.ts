import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ServersService, ServerData } from '../services/servers.service';

@Component({
  selector: 'app-add-server',
  templateUrl: './add-server.page.html',
  styleUrls: ['./add-server.page.scss'],
})
export class AddServerPage implements OnInit {

  public serverID: string;

  public serverData: ServerData;

  constructor(public modalCtrl: ModalController, private srvSrv: ServersService) { }

  ngOnInit() {
    if(this.serverID) {
      this.serverData = this.srvSrv.getServerFromID(this.serverID);
    } else {
      this.serverData = new ServerData();
    }
  }

  save() {
    const now = new Date();
    this.serverData.created = now.getDate() + '/' + (now.getMonth() + 1) + '/' + now.getFullYear();
    this.srvSrv.save(this.serverData);
    this.cancel();
  }

  delete() {
    if(confirm('Are you sure?')) {
      this.srvSrv.delete(this.serverID);
      this.cancel();
    }
  }

  cancel(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

}
