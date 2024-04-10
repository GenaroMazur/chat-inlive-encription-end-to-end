import { Connection } from "./class/Conection";
import { messageHandler } from "./handlers/messageHandler";

const client = new Connection();

client.connect("ws://localhost:8080")
    .then(async () => {
        client.setMessageHandler(messageHandler(client))

        console.log(await client.login("genaro"));
    });
