export class IRCParser {
    public static parseMessage(message: string): IRCMessage {
        const r = /:([^:]+):(.*)/.exec(message);
        const TAG = r[1];
        const MSG = r[2];
        const partials = TAG.split(' ');
        const im = new IRCMessage();
        im.origin = partials[0];
        im.code = partials[1];
        im.target = partials[2];
        im.message = MSG;
        // console.log(TAG, MSG, im);
        return im;
    }
}

export class IRCMessage {
    public origin: string;
    public code: string;
    public target: string;
    public message: string;
}