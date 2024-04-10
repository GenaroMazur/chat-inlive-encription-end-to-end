import { loginController } from "../controllers/login.controller";
import { logoutController } from "../controllers/logout.controller";
import { WebSocketClient } from "../class/WebSocketClient";
import { isJSON } from "../utils/isJson.utils";
import { talkController } from "../controllers/talk.controller";
import { getController } from "../controllers/get.controller";

export function messageHandler(client: WebSocketClient) {
    return (message: string) => {
        if (!isJSON(message))return client.send({ message: "Debe ser un json valido", from:"server" })
        const messageObj: unknown = JSON.parse(message)
        console.log(messageObj)
        if (typeof messageObj !== "object" || messageObj === null) return client.send({ message: "Debe ser un objeto valido", from:"server" })
        
        if (!("type" in messageObj) || typeof messageObj.type !== "string") return client.send({ message: "Debe tener propiedad 'type' con los siguientes valores:'login','logout','talk'", from:"server" })
        if (!("id" in messageObj) || typeof messageObj.id !== "string") return client.send({ message: "El mensaje debe tener un id", from: "server" })
        
        switch (messageObj.type) {
            case "login":
                loginController(client,messageObj as any)
                break
            case "logout":
                logoutController(client)
                break
            case "talk":
                talkController(client, messageObj as any)
                break
            case "get":
                getController(client, messageObj as any)
                break
            default:
                client.send({ message: "'type' debe ser uno de los siguientes valores:'login','logout','talk'", from:"server" })
        }
    }
}