import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  theme: string;
  logSize: number;

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {
    this.logSize = localStorage.getItem('logSize') ? parseInt(localStorage.getItem('logSize')) : environment.saveLastMessages;
  }

  changedTheme() {
    console.log('Changing', this.theme);
    document.body.classList.remove('monokai');
    document.body.classList.remove('aubergine');
    document.body.classList.remove('black');
    document.body.classList.remove('blues');
    document.body.classList.remove('paper');
    document.body.classList.add(this.theme);
    localStorage.setItem('theme', this.theme);
  }

  cancel(){
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  chgLogSize(evt) {
    console.log('Changing log size', evt.srcElement.value);
    this.logSize = parseInt(evt.srcElement.value);
    localStorage.setItem('logSize', this.logSize.toString());
    environment.saveLastMessages = this.logSize;
  }

  clearLogs() {
    if(confirm('Seguro quiere eliminar logs?')) {
      localStorage.removeItem('dividedStream');
      window.location.reload();
    }
  }

  deleteServers() {
    if(confirm('Seguro quiere eliminar los servidores?')) {
      localStorage.removeItem('servers');
      window.location.reload();
    }
  }

}
