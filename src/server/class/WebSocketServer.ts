import { IncomingMessage, Server } from "http";
import { matches } from "ip-matching";
import { AddressInfo } from "net";
import WebSocket, { WebSocketServer as WebSocketS } from "ws";

export class WebSocketServer {
    private webSocket: WebSocketS;
    public permitedIps: string[] = [];
    constructor(httpServer: Server) {
        this.webSocket = new WebSocketS({ server: httpServer });

        this.webSocket.on("listening", () => {
            const address = httpServer.address() as AddressInfo;
            console.log("listening on ws://" + (address.address == "::" ? "localhost" : address.address) + ":" + address.port);
        });
    }

    public setConnectionHandler(callback: (client: WebSocket, req: IncomingMessage) => any) {

        this.webSocket.on("connection", (w, r) => {
            let ip = r.socket.remoteAddress!.replace("::ffff:", "");

            if (this.permitedIps.some((permitedIp) => matches(ip, permitedIp))) {
                callback(w, r);
            } else {
                console.log(ip + " no permitido");
                w.terminate();
            }
        });
        return this;
    }

    public addAllowIp(ip: string[]) {
        this.permitedIps.push(...ip);
        return this;
    }
}