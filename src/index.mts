import inquirer from "inquirer";
import { config } from "dotenv";
config();
import { Server } from "http";
import { WebSocketServer } from "./server/class/WebSocketServer.js";
import { connectionHandler } from "./server/handlers/connectionHandler.js";
import { Connection } from "./client/class/Conection.js";
import { messageHandler } from "./client/handlers/messageHandler.js";
import { clientAction } from "./client/handlers/cliHandler.mjs";
import { networkInterfaces } from "os";
import { isIP } from "net";
import ipMatching from "ip-matching"


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
            message: "Servidor que da el sercicio de mensajeria"
        }, {
            type: "number",
            name: "port",
            default: "8080",
            message: "Puerto del servidor de mensajeria"
        }]);
        const client = new Connection();

        await client.connect("ws://" + url.host + ":" + url.port);
        client.setMessageHandler(messageHandler(client));

        const username = await inquirer.prompt({
            type: "input",
            name: "username"
        });

        console.log((await client.login(username.username)).message);

        await clientAction(client);

    } else {
        const port = await inquirer.prompt({
            "type": "number",
            "name": "port",
            "default": 8080,
        });

        const allowIps = await inquirer.prompt({
            type: "list",
            "name": "allowIps",
            "message": "Modo de escucha",
            "loop": true,
            "choices": [
                "localhost",
                "lan",
                "todos",
                "avanzado"
            ]
        });

        const server = new Server();
        const webSocket = new WebSocketServer(server);

        webSocket.setConnectionHandler(connectionHandler);

        switch (allowIps.allowIps) {
            case "todos":
                webSocket.addAllowIp(["0.0.0.0/0"]);
            case "lan":
                let lan: string = "";
                const interfaces = networkInterfaces();

                Object.keys(interfaces).forEach((iface) => {
                    const ifaceData = interfaces[iface];
                    ifaceData!.forEach((address) => {
                        if (address.family === 'IPv4' && !address.internal) {
                            lan = address.address;
                        }
                    });
                });

                lan = lan.split(".").map((oct, i, arr) => {
                    if (i == arr.length - 1) oct = "0";
                    return oct;
                }).join(".") + "/24";

                webSocket.addAllowIp([lan]);
            case "localhost":
                webSocket.addAllowIp(["::1", "127.0.0.1"]);
                break;
            case "avanzado":
                const ips = (await inquirer.prompt({
                    type: "input",
                    name: "ips",
                    message: "coloque las ips o sub redes que quiere añadir separado por comas (ej: ::1, 127.0.0.1, 192.168.0.0/24, 0.0.0.0/0) "
                })).ips as string;

                webSocket.addAllowIp(ips
                    .split(",")
                    .map(s => s.trim())
                    .filter(s => {
                        const mask = parseInt(s.split("/")[1] || "-1");

                        return isIP(s) || (isIP(s.split("/")[0]) && s.includes("/") && mask >= 0 && mask < 25);
                    }));

                break;
        }


        server.listen(port.port);
    }
});