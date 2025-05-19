import { WebSocket } from "ws";

export abstract class BaseController {
    abstract getProcessedRequests(): {
        [key: string]: (data: any, ws: WebSocket) => any;
    };

    getResponse(type: string, data: any) {
        console.log(
            "=>\n",
            JSON.stringify(
                { type, data: JSON.stringify(data, null, 1), id: 0 },
                null,
                1
            )
        );
        return JSON.stringify({ type, data: JSON.stringify(data), id: 0 });
    }
}
