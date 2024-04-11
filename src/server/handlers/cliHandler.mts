import inquirer from "inquirer";
import { WebSocketServer } from "../class/WebSocketServer.js";
import { WebSocketClient } from "../class/WebSocketClient.js";
import { isIP } from "net";

export async function cliHandler(ws: WebSocketServer) {
    const action = await inquirer.prompt({
        "message": "Acciones",
        "type": "list",
        "name": "action",
        "choices": [
            "estado",
            "usuarios",
            "apagar",
            "configurar ips permitidas"
        ]
    });

    switch (action.action) {
        case "estado":
            console.log("Estado del servidor:", ws.status);
            console.log("Puerto de escucha:", ws.port);
            console.log("Cantidad de usuarios:", Object.keys(WebSocketClient.clients).length);
            break;
        case "usuarios":
            const username = (await inquirer.prompt({
                "message": "Acciones",
                "type": "list",
                "name": "username",
                "choices": ["EXIT", ...Object.keys(WebSocketClient.clients)]
            })).username;
            if (username === "EXIT") break;

            const action = (await inquirer.prompt({
                "message": "Acciones",
                "type": "list",
                "name": "action",
                "choices": ["cancelar", "expulsar", "bloquear ip"]
            })).action;

            if (action === "cancelar") break;

            if (action == "expulsar") WebSocketClient.clients[username].closeConnection();

            if (action === "bloquear ip") {
                ws.ipBlacklist.push(WebSocketClient.clients[username].ip);
                WebSocketClient.clients[username].closeConnection();
            }
            break;
        case "apagar":
            process.exit(0);
            break;
        case "configurar ips permitidas":
            const ipAction = (await inquirer.prompt({
                "message": "Acciones",
                "type": "list",
                "name": "ip",
                "choices": ["cancelar", "lista blanca", "lista negra"]
            })).ip;

            if (ipAction === "cancelar") break;

            if (ipAction === "lista blanca") {
                const action = (await inquirer.prompt({
                    "message": "Acciones",
                    "type": "list",
                    "name": "action",
                    "choices": ["cancelar", "agregar", ...ws.permitedIps]
                })).action;

                if (action === "cancelar") break;

                if (action === "agregar") {
                    const ips = (await inquirer.prompt({
                        type: "input",
                        name: "ips",
                        message: "coloque las ips o sub redes que quiere añadir separado por comas (ej: ::1, 127.0.0.1, 192.168.0.0/24, 0.0.0.0/0) "
                    })).ips as string;

                    ws.addAllowIp(ips
                        .split(",")
                        .map(s => s.trim())
                        .filter(s => {
                            const mask = parseInt(s.split("/")[1] || "-1");

                            return isIP(s) || (isIP(s.split("/")[0]) && s.includes("/") && mask >= 0 && mask < 25);
                        }));
                } else {
                    const deleteIp = (await inquirer.prompt({
                        type: "confirm",
                        name: "delete",
                        message: "¿ Estas seguro de que quieres quitar esta regla ?"
                    })).delete as boolean;

                    if (deleteIp) ws.permitedIps = ws.permitedIps.filter(ip => ip !== action);
                };

            } else {
                const action = (await inquirer.prompt({
                    "message": "Acciones",
                    "type": "list",
                    "name": "action",
                    "choices": ["cancelar", "agregar", ...ws.ipBlacklist]
                })).action;

                if (action === "cancelar") break;

                if (action === "agregar") {
                    const ips = (await inquirer.prompt({
                        type: "input",
                        name: "ips",
                        message: "coloque las ips que quiere añadir separado por comas (ej: ::1, 127.0.0.1, 192.168.0.3) "
                    })).ips as string;

                    ws.ipBlacklist.push(...ips
                        .split(",")
                        .map(s => s.trim())
                        .filter(s => {
                            const mask = parseInt(s.split("/")[1] || "-1");

                            return isIP(s) || (isIP(s.split("/")[0]) && s.includes("/") && mask >= 0 && mask < 25);
                        }));
                } else {
                    const deleteIp = (await inquirer.prompt({
                        type: "confirm",
                        name: "delete",
                        message: "¿ Estas seguro de que quieres quitar esta regla ?"
                    })).delete as boolean;

                    if (deleteIp) ws.ipBlacklist = ws.ipBlacklist.filter(ip => ip !== action);
                }
                break;
            }
    }
    return cliHandler(ws);
}