export class JettonTransfer {
    private constructor(
        private params: JettonTransferParams
    ) {

    }

    public static create(params: JettonTransferParams) {
        let transfer = new JettonTransfer(params)

        return transfer
    }

    public async send() {

    }
    
    public boc() {
        
    }
}

type JettonTransferParams = {
    fromWallet: string,
    toWallet: string,
    jettonAddress: string,
    jettonAmount: string
}