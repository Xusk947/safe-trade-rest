import tonMnemonic, { generateMnemonic } from "tonweb-mnemonic";

export async function generateWallet() {
    const mnemonic = await generateMnemonic();
    
    return mnemonic
}