import { Injectable, Logger, Res } from '@nestjs/common';
import { Response } from 'express';
import { SseService } from 'src/sse/services/sse/sse/sse.service';
import { TradeSseUpdate } from 'src/trade/utils/types';

@Injectable()
export class TradeSseService {
    private logger = new Logger(TradeSseService.name)
    private connections: Map<string, number>;

    constructor(
        private readonly sseService: SseService
    ) {
        this.connections = new Map();
    }


    async registerTradeSSE(userId: string, @Res() response: Response) {
        const tradeId = 0;

        if (this.connections.has(userId)) {
            this.sseService.disconnectClient(userId)
        }

        this.sseService.createConnection(response, userId, (clientId) => { this.deleteConnection(clientId) });
        this.connections.set(userId, tradeId)
        this.logger.log(`User ${userId} connected to trade ${tradeId}`)
        this.sseService.sendDataToClient(userId, {
            data: 'Connection established',
            type: 'ping',
        })
    }

    sendHandshake(userId: string) {
        if (this.connections.has(userId)) {
            this.sseService.sendDataToClient(userId, {
                data: 'Connection established',
                type: TradeSseUpdate.CONNECTED,
            });
        }
    }

    sendDisconnect(userId: string) {
        if (this.connections.has(userId)) {
            this.sseService.sendDataToClient(userId, {
                data: 'Connection closed',
                type: TradeSseUpdate.DISCONNECTED,
            });
            this.sseService.disconnectClient(userId)
        }
    }

    sendTradeData(tradeData: any, userId: string) {
        
    }
    async sendMessage() {
        for (const [key, value] of this.connections) {
            const data = (Math.random() * 100).toString()

            this.logger.log(`Sending data ${data} to ${key}`)

            this.sseService.sendDataToClient(key, {
                data: "Hello",
            });
        }
    }

    public deleteConnection(userid: string) {
        if (this.connections.has(userid)) {
            this.connections.delete(userid)
            this.logger.log(`User ${userid} disconnected from trade`)
        }
    }
}
