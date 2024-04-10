import { WebSocketClient } from "../class/WebSocketClient";


export function talkController(client: WebSocketClient, message: { type: "talk", message?: unknown, to?: unknown, id:string }) {
    if (!("message" in message) || typeof message.message !== "string") return client.send({ message: "Debe contener un'message' valido", from:"server" })
    if (!("to" in message) || typeof message.to !== "string") return client.send({ message: "Debe contener una 'to' valida",from:"server" })
    if (client.username === message.to) return client.send({ message: "No se pueden enviar mensajes a si mismo",from:"server" })

    client.send({message:client.talkTo(message.to,message.message)?"¡ Mensaje Enviado !":"No se encuentra conectado a ese usuario", from:"server", id:message.id})
}