import { httpServer } from "./src/http_server/index";
import { WebSocketServer } from "ws";

const HTTP_PORT = 8181;

const wss = new WebSocketServer({ port: 3000 });
wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    console.log(wss.clients);

    ws.on("message", function message(data) {
        console.log("received: %s", data);
    });
});

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);
