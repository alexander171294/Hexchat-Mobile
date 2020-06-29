export class IRCParser {
    public static parseMessage(message: string): IRCMessage[] {
        const out = [];
        message.split('\r\n').forEach(msgLine => {
            const r = /:([^:]+):*(.*)/.exec(msgLine);
            const TAG = r[1];
            const MSG = r[2];
            const partials = TAG.split(' ');
            const im = new IRCMessage();
            im.origin = partials[0];
            im.code = partials[1];
            const target = /([^!]*!)?([^@]+@)?(.*)/.exec(partials[2]);
            const od = new OriginData();
            if(target.length == 2) {
                od.server = target[1];
            }
            if(target.length == 3) {
                od.server = target[2];
                od.identitity = target[1];
            }
            if(target.length == 4) {
                od.server = target[3];
                od.identitity = target[2];
                od.nick = target[1];
            }
            im.simplyTarget = target[1];
            im.target = od;
            im.message = MSG;
            out.push(im);
        });
        return out;
    }
}

export class IRCMessage {
    public origin: string;
    public code: string;
    public target: OriginData;
    public simplyTarget: string;
    public message: string;
}

export class OriginData {
    public nick?: string;
    public identitity?: string;
    public server: string;
}