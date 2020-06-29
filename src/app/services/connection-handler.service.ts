import { Injectable } from '@angular/core';
import { ServerData, ServersService } from './servers.service';
import { WebSocketHDLR } from './websocket';
import { resolve } from 'dns';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectionHandlerService {

  public websockets: IWebsockets = {};

  constructor(private srvSrv: ServersService) { }

  connect(server: ServerData): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      if(server.connected) {
        res();
      } else {
        this.srvSrv.updateStatusConnection(server.id, true);
        this.websockets[server.id] = new WebSocketHDLR();
        this.websockets[server.id].connect(environment.gateway).subscribe(
          msg => { this.onGetMessage(msg, server) },
          err => { this.onErrorOccoured(err, server); rej() },
          () => { this.onComplete(server); res() }
        );
      }
    });
  }

  onGetMessage(message: string, server: ServerData) {
    console.log('message received', message);
  }

  onErrorOccoured(err: any, server: ServerData) {
    console.error('ERROR DE CONEXION', err);
    this.srvSrv.updateStatusConnection(server.id, false);
  }

  onComplete(server: ServerData) {
    console.log('COMPLETED.');
    this.websockets[server.id].send('ENCODING CP1252');
    this.websockets[server.id].send('HOST ' + server.server);
    this.websockets[server.id].send('user websocket * * :WebSocket User');
    this.websockets[server.id].send('nick ' + server.apodo);
  }

}

export interface IWebsockets {
  [key: string]: WebSocketHDLR;
}