import { IncomingMessage } from "http";
import WebSocket from "ws"
import { WebSocketClient } from "../class/WebSocketClient";
import { messageHandler } from "./messageHandler";

export function connectionHandler(ws: WebSocket, req: IncomingMessage) {
    const client = new WebSocketClient(ws, req)

    client.ws.on("message", messageHandler(client))
    client.ws.on("close", () => {
        client.closeConnection()
        if (client.username) {
            console.log(client.username,"Se desconectó")
        }
    })
}