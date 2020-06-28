import { Component, OnInit, Input } from '@angular/core';
import { ServerData } from '../services/serverData';

@Component({
  selector: 'app-servercard',
  templateUrl: './servercard.component.html',
  styleUrls: ['./servercard.component.scss'],
})
export class ServerCardComponent implements OnInit {

  @Input() server: ServerData;

  constructor() { }

  ngOnInit() {}

  isIos() {
    const win = window as any;
    return win && win.Ionic && win.Ionic.mode === 'ios';
  }
}
