import { Connection } from "../class/Conection";
import { isJSON } from "../utils/isJson.utils";
import { decriptWithRsa } from "../utils/rsa.utils";

export function messageHandler(client: Connection) {
    const { privateKey, passphrase } = client;
    return (message: string) => {

        if (!isJSON(message)) return false;

        const messageObj: unknown = JSON.parse(message);
        if (typeof messageObj !== "object" || messageObj === null) return false;
        if (!("from" in messageObj) || typeof messageObj.from !== "string") return false;
        if (!("message" in messageObj) || typeof messageObj.message !== "string") return false;

        if (messageObj.from !== "server") {
            const messageDecripted = decriptWithRsa(messageObj.message, privateKey, passphrase);
            messageObj.message = messageDecripted;

            if (client.inbox[messageObj.from]) {

                client.inbox[messageObj.from]!.messages.push(messageObj.message as string);
                client.inbox[messageObj.from]!.new = true;
            } else {
                client.inbox[messageObj.from] = {
                    messages: [messageObj.message as string],
                    new: true
                };
            }
        }
    };
}