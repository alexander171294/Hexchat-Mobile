import { Injectable, EventEmitter } from '@angular/core';
import { ServerData, ServersService } from './servers.service';
import { WebSocketHDLR } from './websocket';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConnectionHandlerService {

  public websockets: IWebsockets = {};
  public messageEvent: EventEmitter<RawMessageEvent> = new EventEmitter<RawMessageEvent>();

  constructor(private srvSrv: ServersService) { }

  public connect(server: ServerData): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      if(server.connected) {
        res();
      } else {
        this.srvSrv.updateStatusConnection(server.id, true);
        this.websockets[server.id] = new WSData();
        this.websockets[server.id].ws = new WebSocketHDLR();
        this.websockets[server.id].ws.connect(environment.gateway).subscribe(
          msg => { this.onGetMessage(msg, server); res() },
          err => { this.onErrorOccoured(err, server); rej() },
          () => {  }
        );
        this.onComplete(server);
      }
    });
  }

  private onGetMessage(message: string, server: ServerData) {
    console.log(message);
    this.websockets[server.id].rawStream.push(message);
    this.messageEvent.emit(new RawMessageEvent(server.id, message));
  }

  private onErrorOccoured(err: any, server: ServerData) {
    console.error('ERROR DE CONEXION', err);
    this.srvSrv.updateStatusConnection(server.id, false);
  }

  private onComplete(server: ServerData) {
    this.websockets[server.id].ws.send('ENCODING UTF-8');
    this.websockets[server.id].ws.send('HOST ' + server.server);
    this.websockets[server.id].ws.send('user websocket * * :WebSocket User');
    this.websockets[server.id].ws.send('nick ' + server.apodo);
    // this.websockets[server.id].send('/join #underc0de ');
  }

  public getWSData(id: string) {
    return this.websockets[id];
  }

  public onMessageReceived(): EventEmitter<RawMessageEvent> {
    return this.messageEvent;
  }

}

export class RawMessageEvent {
  public serverID: string;
  public message: string;
  constructor(serverID: string, message: string) {
    this.serverID = serverID;
    this.message = message;
  }
}

export class WSData {
  public ws: WebSocketHDLR;
  public rawStream: string[] = [];
  public dividedStream: ChatStreams;
}

export interface IWebsockets {
  [key: string]: WSData;
}

export interface ChatStreams {
  [key: string]: string[];
}