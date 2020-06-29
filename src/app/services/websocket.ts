import {webSocket, WebSocketSubject} from 'rxjs/webSocket';
import { Observable } from 'rxjs';

export class WebSocketHDLR {

    private wss: WebSocketSubject<string>;

    connect(url: string): Observable<string> {
        this.wss = webSocket<string>({url, serializer: msg => msg, deserializer: msg => msg.data });
        return this.wss.asObservable();
    }

    public send(msg: string) {
        this.wss.next(msg);
    }

}