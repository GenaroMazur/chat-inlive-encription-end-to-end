import inquirer from "inquirer";
import { Connection } from "../class/Conection.js";

export async function clientAction(connection: Connection) {
    const actionChoised = await inquirer.prompt({
        "type": "list",
        "name": "action",
        "loop": true,
        "message": "Acciones |  Ctrl + C para salir",
        "choices": [
            { "name": "Listar usuarios", "value": "getUsers" },
            { "name": "Enviar un mensaje", "value": "talk" },
            { "name": "Bandeja de entrada", "value": "inbox" },
            { "name": "Cerrar sesion", "value": "logout" }

        ]
    });

    switch (actionChoised.action) {
        case "logout":
            console.log("bye bye");
            connection.disconnect();
            return;
        case "getUsers":
            console.log(Object.keys(await connection.getUsers()));
            break;
        case "inbox":
        
            const inboxUsername = await inquirer.prompt({
                type: "rawlist",
                name: "username",
                message: "Ver mensaje de:",
                loop: true,
                choices: [{name:"EXIT", value:"EXIT"}, ...Object.entries(connection.inbox).map(([username, inbox]) => {
                    return { name:inbox?.new?"* "+username:"  "+username,value:username };
                }) as any]
            });
            if (inboxUsername.username === "EXIT") break;
            await inquirer.prompt({
                type: "list",
                pageSize: 20,
                name: "message",
                message: inboxUsername.username,
                loop: true,
                choices: connection.inbox[inboxUsername.username]!.messages.map((m, i, a) => {
                    const message ={value:i + " - " + m};
                    if(i == a.length - 1) (message as any).checked = true;
                    return message
                })
            });
            break;
        case "talk":
            const users = Object.keys(await connection.getUsers());
            users.unshift("EXIT");
            const username = await inquirer.prompt({
                type: "rawlist",
                name: "username",
                message: "Enviar un mensaje a:",
                loop: true,
                choices: users
            });
            if (username.username == "EXIT") return clientAction(connection);

            const message = await inquirer.prompt({
                type: "input",
                name: "message",
                message: "mensaje"
            });
            connection.sendMessage(message.message, username.username);
            console.clear();
            break;
    }
    return clientAction(connection);
}