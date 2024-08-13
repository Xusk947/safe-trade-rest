import { Injectable, Res, MessageEvent, Logger } from '@nestjs/common';
import { Response } from 'express';
import { Subject } from 'rxjs';

@Injectable()
export class SseService {
    private logger = new Logger(SseService.name)

    /** List of connected clients */
    connectedClients = new Map<string, { close: () => void, subject: Subject<MessageEvent> }>();

    constructor() { }

    async createConnection(@Res() response: Response, clientId: string, onClose?: (clientId: string) => void) {
        // Create a subject for this client in which we'll push our data
        const subject = new Subject<MessageEvent>();

        // Create an observer that will take the data pushed to the subject and
        // write it to our connection stream in the right format
        const observer = {
            next: (msg: MessageEvent) => {
                // Called when data is pushed to the subject using subject.next()
                // Encode the message as SSE (see https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events)

                // Here's an example of what it could look like, assuming msg.data is an object
                // If msg.data is not an object, you should adjust accordingly

                if (msg.type)
                    response.write(`event: ${msg.type}\n`)
                if (msg.id)
                    response.write(`id: ${msg.id}\n`)
                if (msg.retry)
                    response.write(`retry: ${msg.retry}\n`)

                response.write(`data: ${JSON.stringify(msg.data)}\n\n`);
            },
            complete: () => { this.logger.log(`observer.complete`) },
            error: (err: any) => { this.logger.log(`observer.error: ${err}`) },
        };

        subject.subscribe(observer);
        this.connectedClients.set(
            clientId,
            {
                close: () => {
                    this.logger.log(`close: ${clientId}`);
                    response.end();
                    if (onClose) onClose(clientId)
                },
                subject: subject,
            });

        response.on('close', () => {
            this.logger.log(`close: ${clientId}`);
            response.end();
            if (onClose) onClose(clientId)
        });

        // Send headers to establish SSE connection
        response.set({
            'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
            'Connection': 'keep-alive',
            'Content-Type': 'text/event-stream',
        })

        response.flushHeaders();

    }

    async disconnectClient(clientId: string) {
        this.connectedClients.get(clientId)?.close();
        this.connectedClients.delete(clientId);
    }

    async sendDataToClient(clientId: string, message: MessageEvent) {
        const connection = this.connectedClients.get(clientId)
        if (connection) {
            this.logger.log(`Sending data ${JSON.stringify(message)} to ${clientId}`)
            connection.subject.next(message)
        }
    }
}
