import { IncomingMessage, Server } from "http";
import { matches } from "ip-matching";
import { AddressInfo } from "net";
import WebSocket, { WebSocketServer as WebSocketS } from "ws";

export class WebSocketServer {
    public webSocket: WebSocketS;
    public permitedIps: string[] = [];
    public status: "LIVE 🚀" | "CLOSE ❌" = "CLOSE ❌";
    public port: number | null = null;
    public ipBlacklist: string[] = [];

    constructor(httpServer: Server) {
        this.webSocket = new WebSocketS({ server: httpServer });

        this.webSocket.on("listening", () => {
            const address = httpServer.address() as AddressInfo;
            console.log("listening on ws://" + (address.address == "::" ? "localhost" : address.address) + ":" + address.port);
            this.status = "LIVE 🚀";
        });

        this.webSocket.on("close", () => {
            this.status = "CLOSE ❌";
        });
    }

    public setConnectionHandler(callback: (client: WebSocket, req: IncomingMessage) => any) {

        this.webSocket.on("connection", (w, r) => {
            let ip = r.socket.remoteAddress!.replace("::ffff:", "");

            if (this.permitedIps.some((permitedIp) => matches(ip, permitedIp)) && !this.ipBlacklist.includes(ip)) {
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