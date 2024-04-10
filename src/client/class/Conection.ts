import WebSocket from "ws";
import { encriptWithRsa, genRsaPair } from "../utils/rsa.utils";
import { randomBytes, randomUUID } from "crypto";
import { isJSON } from "../utils/isJson.utils";

export class Connection {
    public passphrase: string;
    public privateKey: string;
    private publicKey: string;

    private ws: WebSocket | null = null;
    public url: string | null = null;

    private pendingMessages: { [id: string]: { resolve: (data: unknown) => void; }; } = {};

    public inbox: { [username: string]: { messages: string[], new:boolean }|undefined; } = {};

    constructor() {
        this.passphrase = randomBytes(16).toString("hex").slice(0, 16);
        const key = genRsaPair(this.passphrase);
        this.privateKey = key.privateKey;
        this.publicKey = key.publicKey;
    }

    public connect(url: string) {
        return new Promise((resolve) => {

            this.url = url;
            this.ws = new WebSocket(url);

            this.ws.on("open", () => {
                console.log("Connected to", url);
                resolve(this);
            });
        });
    }

    public setMessageHandler(callback: (message: string) => any) {
        if (!this.ws) throw new Error("No WebSocket");
        this.ws.on("message", (message) => {

            if (isJSON(message.toString("utf-8"))) {
                const json = JSON.parse(message.toString("utf-8"));
                if (typeof json === "object" && json && "id" in json && typeof json.id === "string") {
                    this.pendingMessages[json.id].resolve(json);
                }
            }

            callback(message.toString("utf-8"));
        });
    }


    private send(type: "logout"): void;
    private send(type: "get", source: "users" | "contacts"): Promise<{ from: string, message: string, id: string, users: { [username: string]: { username: string, publicKey: string; }; }; }>;
    private send(type: "talk", to: string, message: string): Promise<{ from: string, message: string, id: string; }>;
    private send(type: "login", username: string, publicKey: string): Promise<{ from: string, message: string, id: string; }>;
    private send(type: "get" | "login" | "logout" | "talk", source?: string, data?: string): Promise<{ from: string, message: string, id: string; }> {
        return new Promise((resolve: any) => {
            const id = randomUUID();
            if (!this.ws) return resolve({ message: "No WebSocket connection", from: "system", id });
            const messageToSend: { type: string, id: string, to?: string, username?: string, message?: string, publicKey?: string, source?: String; } = { type, id };

            switch (type) {
                case "login":
                    messageToSend.username = source;
                    messageToSend.publicKey = data;
                    break;
                case "logout":
                    console.log("logged out");
                    break;
                case "talk":
                    messageToSend.to = source;
                    messageToSend.message = data;
                    break;
                case "get":
                    messageToSend.source = source;
                    break;
            }

            this.ws.send(JSON.stringify(messageToSend));
            this.pendingMessages[id] = { resolve };
        });
    }

    public disconnect() {
        if (!this.ws) return false;
        this.send("logout");
        this.ws.close();
        this.ws = null;
        return true;
    }

    public async login(username: string) {
        return await this.send("login", username, this.publicKey);
    }

    public async getUsers(): Promise<{ [username: string]: { username: string, publicKey: string; }; }> {
        return (await this.send("get", "users")).users;
    }

    public async sendMessage(message: string, to: string) {
        const users = await this.getUsers();
        const user = users[to];
        if (!user) return { message: "Usuario no encontrado" };

        return this.send("talk", user.username, encriptWithRsa(message, user.publicKey));
    }
}