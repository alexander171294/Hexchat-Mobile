export class IRCParser {
    public static parseMessage(message: string): IRCMessage[] {
        const out = [];
        message.split('\r\n').forEach(msgLine => {
            const r = /:([^:]+):?(.*)/.exec(msgLine);
            const TAG = r[1];
            const MSG = r[2];
            const partials = TAG.split(' ');
            const im = new IRCMessage();
            im.code = partials[1];
            const target = /([^!]*!)?([^@]+@)?(.*)/.exec(partials[0]);
            const od = new OriginData();
            if(!target[2]) {
                od.server = target[1];
                im.simplyOrigin = od.server;
            } else if(!target[3]) {
                od.server = target[2];
                od.identitity = target[1].slice(0, target[1].length-1);
                im.simplyOrigin = od.identitity;
            } else {
                od.server = target[3];
                od.identitity = target[2].slice(0, target[1].length-1);
                od.nick = target[1].slice(0, target[1].length-1);
                im.simplyOrigin = od.nick;
            }
            im.origin = od;
            im.target = partials[2];
            im.message = MSG;
            out.push(im);
        });
        return out;
    }

    public static getChannelOfUsers(message: string) {
        return /=([^:]+):/.exec(message)[1].trim();
    }


}

export class IRCMessage {
    public origin: OriginData;
    public simplyOrigin: string;
    public code: string;
    public target: string;
    public message: string;
}

export class OriginData {
    public nick?: string;
    public identitity?: string;
    public server: string;
}