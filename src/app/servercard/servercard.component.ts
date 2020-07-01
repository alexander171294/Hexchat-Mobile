import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ServerData } from '../services/servers.service';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { ConnectionHandlerService } from '../services/connection-handler.service';

@Component({
  selector: 'app-servercard',
  templateUrl: './servercard.component.html',
  styleUrls: ['./servercard.component.scss'],
})
export class ServerCardComponent implements OnInit {

  @Input() server: ServerData;
  @Output() editRequested: EventEmitter<void> = new EventEmitter<void>();
  private timeoutRef: any;
  private static readonly pressToEdit = 500;
  private holdFrom: number;

  constructor(private navCtrl: NavController,
              private loadingController: LoadingController,
              private connections: ConnectionHandlerService,
              private toastCtrl: ToastController) { }

  ngOnInit() {}

  isIos() {
    const win = window as any;
    return win && win.Ionic && win.Ionic.mode === 'ios';
  }

  onElementHold(evt) {
    console.log('Hold', evt);
    this.holdFrom = evt.timeStamp;
    this.timeoutRef = setTimeout(() => {
      this.editRequested.emit();
      evt.preventDefault();
    }, ServerCardComponent.pressToEdit);
  }

  onElementRelease(evt) {
    console.log('Release in: ' + (evt.timeStamp - this.holdFrom));
    if(evt.timeStamp - this.holdFrom > ServerCardComponent.pressToEdit) {
      evt.preventDefault();
    } else {
      this.presentLoading().then(d => {
        this.connections.connect(this.server).then(r => {
          this.loadingController.dismiss();
          this.navCtrl.navigateForward('/chat/' + this.server.id);
        }).catch(r => {
          this.loadingController.dismiss();
          // mostrar toast:
          this.toastCtrl.create({
            message: 'Error connecting.',
            duration: 1000
          }).then(toast => {
            toast.present();
          });
          this.server.connected = false;
        })
      });
      // this.navCtrl.navigateForward('/chat');
      clearTimeout(this.timeoutRef);
    }
    this.holdFrom = 0;
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Connecting...'
    });
    await loading.present();
  }
}
