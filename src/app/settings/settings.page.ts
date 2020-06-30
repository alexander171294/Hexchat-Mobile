import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  theme: string;

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {
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

}
