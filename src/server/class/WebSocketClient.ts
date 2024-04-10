import { IncomingMessage } from "http";
import WebSocket from "ws";

export class WebSocketClient {
    public static clients: { [username: string]: WebSocketClient; } = {};

    public username: string | null = null;
    public publicKey: string | null = null;

    public contacts: string[] = [];


    constructor(
        public readonly ws: WebSocket,
        private readonly req: IncomingMessage
    ) { }

    public login(username: string, publicKey: string) {
        if(WebSocketClient.clients[username]) return false
        this.username = username;
        this.publicKey = publicKey;
        WebSocketClient.clients[username] = this
        return true
    }

    public logout() {
        if(!this.username) return false 
        delete WebSocketClient.clients[this.username]
        this.username = null
        return true
    }

    public closeConnection() {
        this.username?delete WebSocketClient.clients[this.username]:null
    }

    public send(message: {message:string, from:string, id?:string, users?:{[username:string]:{publicKey:string, username:string}}}) {
        this.ws.send(JSON.stringify(message));
    }

    public talkTo(username: string, message: string) {
        const client = WebSocketClient.clients[username];
        if (!client) return false

        client.send({message, from:this.username!})

        return true
    }

}