import { config } from "dotenv";
config()
import { Server } from "http";
import { WebSocketServer } from "./class/WebSocketServer";
import { connectionHandler } from "./handlers/connectionHandler";

const server = new Server();
const webSocket = new WebSocketServer(server);

webSocket.setConnectionHandler(connectionHandler)

server.listen(8080);
