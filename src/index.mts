import inquirer from "inquirer";
import { config } from "dotenv";
config();
import { Server } from "http";
import { WebSocketServer } from "./server/class/WebSocketServer.js";
import { connectionHandler } from "./server/handlers/connectionHandler.js";
import { Connection } from "./client/class/Conection.js";
import { messageHandler } from "./client/handlers/messageHandler.js";
import { clientAction } from "./client/handlers/cliHandler.mjs";



inquirer.prompt({
    "type": "list",
    "name": "function",
    "loop": true,
    "message": "Que funcionalidad usar",
    "choices": [
        "cliente",
        "servidor"
    ]
}).then(async (r) => {
    if (r.function === "cliente") {
        const url = await inquirer.prompt([{
            type: "input",
            name: "host",
            default: "localhost",
            message:"Servidor que da el sercicio de mensajeria"
        }, {
            type: "number",
            name: "port",
            default: "8080",
            message:"Puerto del servidor de mensajeria"
        }]);
        const client = new Connection();

        await client.connect("ws://" + url.host + ":" + url.port);
        client.setMessageHandler(messageHandler(client));

        const username = await inquirer.prompt({
            type: "input",
            name: "username"
        });

        console.log((await client.login(username.username)).message);
        
        await clientAction(client)

    } else {
        const port = await inquirer.prompt({
            "type": "number",
            "name": "port",
            "default": 8080,
        });

        const server = new Server();
        const webSocket = new WebSocketServer(server);

        webSocket.setConnectionHandler(connectionHandler);

        server.listen(port.port);
    }
});