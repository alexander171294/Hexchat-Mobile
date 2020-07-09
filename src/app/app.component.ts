import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { ConnectionHandlerService } from './services/connection-handler.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private localNotifications: LocalNotifications,
    private backgroundMode: BackgroundMode,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      document.body.classList.add(localStorage.getItem('theme'));
      const notifications = localStorage.getItem('notifications');
      if (!notifications) {
        if (!this.localNotifications.hasPermission()) {
          this.localNotifications.requestPermission().then(permissions => {
            localStorage.setItem('notifications', permissions ? 'yes' : 'no');
          });
        }
      }
      this.backgroundMode.enable();
    });
  }
}
