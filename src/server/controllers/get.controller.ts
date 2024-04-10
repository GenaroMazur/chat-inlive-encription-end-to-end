import { WebSocketClient } from "../class/WebSocketClient";

export function getController(client:WebSocketClient, message:{type:"get", source?:unknown, id:string}) {
    if(!client.username) return client.send({message:"Se requiere autenticacion", from:"server"}) 
    if (!message.source || typeof message.source !== "string") return client.send({ message: "Se requiere 'source' solicitado", from: "server" })
    
    switch (message.source as string) {
        case "contacts":
            break;
        case "users":
            const users:{[username:string]:{publicKey:string, username:string}} = {}
            for (const user of Object.values(WebSocketClient.clients)) {
                users[user.username!]={publicKey:user.publicKey!, username:user.username!}
            }
            client.send({message:"Lista de usuarios", users, from:"server", id:message.id})
            break;
        default:

    }
}