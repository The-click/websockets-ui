import { winService } from "../service/WinsService";
import { BaseController } from "./BaseController";
import { WebSocket } from "ws";

export class WinsController extends BaseController {
    constructor() {
        super();
    }

    getProcessedRequests() {
        return {};
    }

    sendUpdateWinners(ws: WebSocket) {
        ws.send(this.getResponse("update_winners", winService.getAllWins()));
    }
}
