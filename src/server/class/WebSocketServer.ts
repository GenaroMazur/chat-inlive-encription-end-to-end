import { IncomingMessage, Server } from "http";
import { AddressInfo } from "net";
import WebSocket, { WebSocketServer as WebSocketS } from "ws";

export class WebSocketServer {
    private webSocket: WebSocketS

    constructor(httpServer:Server) {
        this.webSocket = new WebSocketS({ server: httpServer })

        this.webSocket.on("listening", () => {
            const address = httpServer.address() as AddressInfo
            console.log( "listening on ws://" + (address.address=="::"?"localhost":address.address) + ":" + address.port);
        })
    }

    public setConnectionHandler(callback:(client:WebSocket, req:IncomingMessage)=>any) {
        this.webSocket.on("connection",callback)
        return this
    }
}