import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ServerData } from '../services/servers.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-servercard',
  templateUrl: './servercard.component.html',
  styleUrls: ['./servercard.component.scss'],
})
export class ServerCardComponent implements OnInit {

  @Input() server: ServerData;
  @Output() editRequested: EventEmitter<void> = new EventEmitter<void>();
  private timeoutRef: NodeJS.Timeout;
  private static readonly pressToEdit = 500;
  private holdFrom: number;

  constructor(private navCtrl: NavController) { }

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
      this.navCtrl.navigateForward('/chat');
      clearTimeout(this.timeoutRef);
    }
    this.holdFrom = 0;
  }
}
