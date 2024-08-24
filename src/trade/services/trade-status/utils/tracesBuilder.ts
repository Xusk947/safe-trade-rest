import { TonApiClient } from "src/crypto/client/tonApiClient";
import { JettonTransfer } from "src/lib/crypto/jettonTransfer";
import { ActionSimplePreview, Event } from "tonapi-sdk-js";

export class TracesBuilder {
    private accountTraces: TransferTrace[] = [];

    constructor(private readonly walletAddress: string) {

    }

    async fetchTraces() {
        const traces = await TonApiClient.accounts.getAccountTraces(this.walletAddress);

        for (let i = 0; i < traces.traces.length; i++) {
            const event: Event = await TonApiClient.events.getEvent(traces.traces[i].id);
            const trace = this.exportDataFromTrace(event);

            this.accountTraces.push(trace);
        }

        return this;
    }

    public countReceivedToken(token: string, sender: string) {
        let value = 0;
        let transactions = 0;
        let hasItem = false;

        for (let i = 0; i < this.accountTraces.length; i++) {
            const trace = this.accountTraces[i];
            if (!trace) continue;
            
            if (trace.tokenAddress == token && trace.from == sender) {
                value += trace.amount;
                transactions++;
                hasItem = true;
            } else if (trace.to == sender && trace.tokenAddress == "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c") {
                value += trace.amount;
                transactions++;
                hasItem = true;
            }
        }

        return { value, transactions, hasItem };
    }
    
    private exportDataFromTrace(event: Event) {
        let transfer: TransferTrace | undefined;
    
        event.actions.forEach(action => {
            const preview = action.simple_preview;
    
            if (preview) {
                const type = preview.name;
    
                if (type == 'Jetton Transfer') {
                    transfer = getTransferFromJettonTransfer(preview);
                } else if (type == 'Ton Transfer') {
                    transfer = getTransferFromTonTransfer(preview);
                }
            }
        })
    
        return transfer;
    }
}

function getTransferFromJettonTransfer(preview: ActionSimplePreview) {
    const tradeWallet = preview.accounts[0];
    const senderWallet = preview.accounts[1];
    const masterWallet = preview.accounts[2];
    const amount = preview.value.split(' ')[0];

    const transfer: TransferTrace = {
        tokenAddress: masterWallet.address,
        amount: Number(amount),
        from: senderWallet.address,
        to: tradeWallet.address,
        name: preview.value.split(' ')[1]
    }

    return transfer;
}

function getTransferFromTonTransfer(preview: ActionSimplePreview) {
    const tradeWallet = preview.accounts[0];
    const senderWallet = preview.accounts[1];
    const masterWallet = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'
    const amount = preview.value.split(' ')[0];

    const transfer: TransferTrace = {
        tokenAddress: masterWallet,
        amount: Number(amount),
        from: senderWallet.address,
        to: tradeWallet.address,
        name: 'TON'
    }

    return transfer;
}

export type TransferTrace = {
    tokenAddress: string,
    amount: number,
    from: string,
    to: string,
    name: string,
}