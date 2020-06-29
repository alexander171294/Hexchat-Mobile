import { Injectable, EventEmitter } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class ServersService {

  private servers: ServerDataHash = {};
  private serversUpdateEvent: EventEmitter<ServerData> = new EventEmitter<ServerData>();

  constructor() {
    const servers = JSON.parse(localStorage.getItem('servers'));
    if(servers) {
      this.servers = servers;
    }
  }

  public getServers(): ServerDataHash {
    return this.servers;
  }

  public static getRandomID(): string {
    return uuidv4();
  }

  public save(server: ServerData) {
    this.servers[server.id] = server;
    localStorage.setItem('servers', JSON.stringify(this.servers));
    this.serversUpdateEvent.emit(server);
  }

  public delete(serverID: string) {
    delete this.servers[serverID];
    localStorage.setItem('servers', JSON.stringify(this.servers));
    this.serversUpdateEvent.emit(undefined);
  }

  public getServerFromID(id: string) {
    return this.servers[id];
  }

  public onServerChange(): EventEmitter<ServerData> {
    return this.serversUpdateEvent;
  }

  public updateStatusConnection(id: string, status: boolean) {
    this.servers[id].connected = status;
    this.serversUpdateEvent.emit(this.servers[id]);
  }
}

export interface ServerDataHash {
  [key: string]: ServerData;
}

export class ServerData {
  public id: string = ServersService.getRandomID();
  public name: string;
  public apodo: string;
  public apodoSecundario: string;
  public username: string;
  public method: string;
  public server: string;
  public created: string;
  public password: string;
  public autoConnect: boolean;
  public connected: boolean;
  public submsg: string;
}