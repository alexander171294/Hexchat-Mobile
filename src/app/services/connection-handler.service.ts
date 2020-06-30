import { Injectable, EventEmitter } from '@angular/core';
import { ServerData, ServersService } from './servers.service';
import { WebSocketHDLR } from './websocket';
import { environment } from 'src/environments/environment';
import { IRCParser } from '../utils/IrcParser';

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
    const now = new Date();
    IRCParser.parseMessage(message).forEach(parsedMessage => {
      const msg = new IRCMessage();
      let channel = '';
      if(parsedMessage.code == '353') {
        const channel = /=([^:]+):/.exec(message)[1].trim();
        const users = parsedMessage.message.trim().split(' ');
        this.websockets[server.id].users[channel] = users;
      } else if(parsedMessage.code != 'PRIVMSG') {
        msg.special = true;
        msg.message = parsedMessage.message;
        msg.nick = '*';
      } else {
        msg.message = parsedMessage.message;
        msg.nick = parsedMessage.simplyOrigin;
        msg.time = now.getDate()+'/'+(now.getMonth()+1)+'/'+now.getFullYear();
        if (parsedMessage.target === this.websockets[server.id].server.apodo) { // privado hacia mi
          // TODO: guardar en un chat stream y luego filtrarlo por seleccion
          channel = '@'+parsedMessage.simplyOrigin;
          if(!this.websockets[server.id].dividedStream[channel]) {
            this.websockets[server.id].dividedStream[channel] = [];
            this.addChannelMSG(server.id, channel);
          }
          this.websockets[server.id].dividedStream[channel].push(msg);
        } else { // de un canal
          channel = parsedMessage.target;
          if(!this.websockets[server.id].dividedStream[channel]) {
            this.websockets[server.id].dividedStream[channel] = [];
            this.addChannelMSG(server.id, channel);
          }
          this.websockets[server.id].dividedStream[channel].push(msg);
        }
        msg.channel = channel;
      }
      this.websockets[server.id].rawStream.push(msg);
      this.messageEvent.emit(new RawMessageEvent(server.id, msg, channel));
    });
  }

  public registerMessageSended(id: string, message: string, channel: string) {
    const now = new Date();
    const msg = new IRCMessage();
    msg.message = message;
    msg.nick = this.websockets[id].server.apodo;
    msg.time = now.getDate()+'/'+(now.getMonth()+1)+'/'+now.getFullYear();
    msg.me = true;
    msg.channel = channel;
    if(!this.websockets[id].dividedStream[channel]) {
      this.websockets[id].dividedStream[channel] = [];
    }
    this.websockets[id].dividedStream[channel].push(msg);
    this.messageEvent.emit(new RawMessageEvent(id, msg, channel));
  }

  public addChannelMSG(id: string, user: string) {
    if(this.websockets[id].privMsgChannels.findIndex(channel => channel === user) >= 0) {
      return;
    }
    this.websockets[id].privMsgChannels.push(user);
  }

  public getChannels(id: string): string[] {
    return this.websockets[id].privMsgChannels;
  }

  public getUsers(id: string, channel: string): string[] {
    return this.websockets[id].users[channel];
  }

  private onErrorOccoured(err: any, server: ServerData) {
    console.error('ERROR DE CONEXION', err);
    this.srvSrv.updateStatusConnection(server.id, false);
  }

  private onComplete(server: ServerData) {
    this.websockets[server.id].ws.send('ENCODING UTF-8');
    this.websockets[server.id].ws.send('HOST ' + server.server);
    this.websockets[server.id].ws.send('user ' + server.username + ' * * :WebSocket User');
    this.websockets[server.id].ws.send('nick ' + server.apodo);
    this.websockets[server.id].server = server;
    // this.websockets[server.id].send('/join #underc0de ');
  }

  public send(id: string, command: string) {
    this.websockets[id].ws.send(command);
  }

  public getWSData(id: string) {
    return this.websockets[id];
  }

  public getServerName(id: string) {
    return this.websockets[id]?.server.name;
  }

  public onMessageReceived(): EventEmitter<RawMessageEvent> {
    return this.messageEvent;
  }

  public getServerNick(id: string): string {
    return this.websockets[id].server.apodo;
  }

  public getServer(id: string): ServerData {
    return this.websockets[id].server;
  }

}

export class RawMessageEvent {
  public serverID: string;
  public message: IRCMessage;
  public channel: string;
  constructor(serverID: string, message: IRCMessage, channel: string) {
    this.serverID = serverID;
    this.message = message;
    this.channel = channel;
  }
}

export class WSData {
  public ws: WebSocketHDLR;
  public rawStream: IRCMessage[] = [];
  public dividedStream: ChatStreams = {};
  public users: UsersList = {};
  public privMsgChannels: string[] = [];
  public server: ServerData;
}

export interface UsersList {
  [key: string]: string[];
}


export interface IWebsockets {
  [key: string]: WSData;
}

export interface ChatStreams {
  [key: string]: IRCMessage[];
}

export class IRCMessage {
  public me: boolean;
  public special: boolean;
  public nick: string;
  public message: string;
  public time: string;
  public channel: string;
}