import { Injectable, EventEmitter } from '@angular/core';
import { ServerData, ServersService } from './servers.service';
import { WebSocketHDLR } from './websocket';
import { environment } from 'src/environments/environment';
import { IRCParser } from '../utils/IrcParser';
import { parse } from 'path';

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
        this.loadLog(server.id);
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
    if(message.indexOf('PING') === 0) {
      const pingResp = message.slice(5);
      console.log('Sending pong');
      this.send(server.id,'PONG ' + pingResp);
      return;
    }
    
    IRCParser.parseMessage(message).forEach(parsedMessage => {
      const msg = new IRCMessage();
      let channel = '';
      if(parsedMessage.code == '353') {
        const channel = IRCParser.getChannelOfUsers(message);
        const users = parsedMessage.message.trim().split(' ');
        this.websockets[server.id].users[channel] = users;
      } else if(parsedMessage.code == '396') { // displayed host
        // autologin
        if(this.websockets[server.id].server.method === 'nickserv') {
          this.send(server.id, 'PRIVMSG nickserv identify ' + this.websockets[server.id].server.password);
        }
        if(this.websockets[server.id].server.method === 'spassword') {
          this.send(server.id, 'PASS ' + this.websockets[server.id].server.password);
        }
        // autojoin
        if(this.websockets[server.id].server.autojoin) {
          const channels = this.websockets[server.id].server.autojoin.split(' ');
          channels.forEach(channel => {
            console.log('Joining to ' + channel);
            this.send(server.id, 'JOIN '+channel);
            this.addChannelMSG(server.id, channel);
          });
        }
      } else if(parsedMessage.code == '322') {
        // real channel list.
        // const channel = IRCParser.getChannelOfUsers(message);
        // const users = parsedMessage.message.trim().split(' ');
        // this.websockets[server.id].users[channel] = users;
      } else if(parsedMessage.code == 'PART') {
        //:Harko!~Harkolandia@harkonidaz.irc.tandilserver.com PART #SniferL4bs :"Leaving"
        channel = parsedMessage.target;
        if(!this.websockets[server.id].users[channel]) {
          this.websockets[server.id].users[channel] = [];
        }
        let index = this.websockets[server.id].users[channel].findIndex(user => user === parsedMessage.simplyOrigin);
        delete this.websockets[server.id].users[channel][index];
        msg.special = true;
        msg.message = parsedMessage.simplyOrigin + ' leaving (' + parsedMessage.message + ')';
        msg.nick = '*';
        msg.channel = channel;
        this.addMessage(server.id, msg, channel);
      } else if(parsedMessage.code == 'JOIN') {
        //:Harko!~Harkolandia@harkonidaz.irc.tandilserver.com JOIN :#SniferL4bs
        console.log('Joining ', parsedMessage);
        channel = parsedMessage.message;
        if(!this.websockets[server.id].users[channel]) {
          this.websockets[server.id].users[channel] = [];
        }
        this.websockets[server.id].users[channel].push(parsedMessage.simplyOrigin);
        msg.special = true;
        msg.message = parsedMessage.origin.nick + ' ('+parsedMessage.origin.identitity+'@'+parsedMessage.origin.server+') Joining';
        msg.nick = '*';
        msg.channel = channel;
        this.addMessage(server.id, msg, channel);
      } else if(parsedMessage.code != 'PRIVMSG') {
        msg.special = true;
        msg.message = parsedMessage.message;
        msg.nick = '*';
        // msg.time = this.getTime();
      } else {
        msg.message = parsedMessage.message;
        msg.nick = parsedMessage.simplyOrigin;
        msg.time = this.getTime();
        msg.date = this.getDateStr();
        if (parsedMessage.target === this.websockets[server.id].server.apodo) { // privado hacia mi
          // TODO: guardar en un chat stream y luego filtrarlo por seleccion
          channel = '@'+parsedMessage.simplyOrigin;
          this.addMessage(server.id, msg, channel);
        } else { // de un canal
          channel = parsedMessage.target;
          this.addMessage(server.id, msg, channel);
        }
        msg.channel = channel;
      }
      this.addMessage(server.id, msg);
      this.messageEvent.emit(new RawMessageEvent(server.id, msg, channel));
    });
  }

  private addMessage(serverID: string, message: IRCMessage, channel?: string): void {
    if(channel) {
      if(!this.websockets[serverID].dividedStream[channel]) {
        this.websockets[serverID].dividedStream[channel] = [];
        this.addChannelMSG(serverID, channel);
      }
      this.websockets[serverID].dividedStream[channel].push(message);
    } else {
      this.websockets[serverID].rawStream.push(message);
    }
    this.saveLog();
  }

  private saveLog() {
    const logsOut = {};
    Object.entries(this.websockets).forEach(elem => {
      const serverID = elem[0];
      const servData = elem[1];
      // logs[serverID] = servData.dividedStream;
      const chatsOuts = {};
      Object.entries(servData.dividedStream).forEach(channChats => {
        const channel = channChats[0];
        const messages = channChats[1];
        chatsOuts[channel] = messages.slice(environment.saveLastMessages < 0 ? environment.saveLastMessages : (-1 * environment.saveLastMessages));
      })
      logsOut[serverID] = {
        dividedStream: chatsOuts
      };
    });
    localStorage.setItem('dividedStream', JSON.stringify(logsOut));
  }

  private loadLog(serverID: string) {
    if(localStorage.getItem('dividedStream')) {
      const dividedStream = JSON.parse(localStorage.getItem('dividedStream'))[serverID].dividedStream;
      Object.entries(dividedStream).forEach(channChats => {
        const channel = channChats[0];
        const messages: any = channChats[1];
        const processedMessages = [];
        messages.forEach(msg => {
          msg.time = msg.time;
          msg.fromLog = true;
          processedMessages.push(msg);
        });
        dividedStream[channel] = processedMessages;
      });
      this.websockets[serverID].dividedStream = dividedStream;
    }
  }

  private getTime(): string {
    const now = new Date();
    const hours = now.getHours() < 10 ? '0'+now.getHours() : now.getHours();
    const min = now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes();
    const second = now.getSeconds() < 10 ? '0'+now.getSeconds() : now.getSeconds();
    return hours + ':' + min + ':' + second;
  }

  private getDateStr(): string {
    const now = new Date();
    const month = (now.getMonth()+1);
    const monthStr = month < 10 ? '0' + month : month;
    const day = now.getDate();
    const dayStr = day < 10 ? '0' + day : day; 
    return dayStr+'/'+monthStr+'/'+now.getFullYear();
  }

  public registerMessageSended(id: string, message: string, channel: string) {
    const msg = new IRCMessage();
    msg.message = message;
    msg.nick = this.websockets[id].server.apodo;
    msg.time = this.getTime();
    msg.date = this.getDateStr();
    msg.me = true;
    msg.channel = channel;
    this.addMessage(id, msg, channel);
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
    this.websockets[server.id].ws.send('user ' + server.username + ' * * :HexchatForAndroid');
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
  public date: string;
  public fromLog: boolean;
  public channel: string;
}