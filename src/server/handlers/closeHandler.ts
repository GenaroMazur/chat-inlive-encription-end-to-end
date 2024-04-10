import { WebSocketClient } from "../class/WebSocketClient";

export function closeHandler(client: WebSocketClient) {
    return () => {
        client.closeConnection();
        if (client.username) {
            console.log(client.username, "Se desconectó");
        }
    };
}