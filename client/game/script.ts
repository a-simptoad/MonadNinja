const {Web3} = require('web3');
const RandomNessABI = require("../../contracts/out/MonadNinja.sol/MonadNinja.json");
const EntropyABI = require("@pythnetwork/entropy-sdk-solidity/abis/IEntropyV2.json");

async function main() {
    const web3 = new Web3(process.env["RPC_URL"]);
    const { address } = web3.eth.accounts.wallet.add(
        process.env["PRIVATE_KEY"],
    )[0];

    web3.eth.defaultBlock = "finalized";

    const randomnessContract = new web3.eth.Contract(
        RandomNessABI.abi,
        process.env["CONTRACT_ADDRESS"],
    );

    const entropyContract = new web3.eth.Contract(
        EntropyABI,
        process.env["ENTROPY_ADDRESS"],
    );

    const fee = await entropyContract.methods.getFeeV2().call()
    console.log(`fee: ${fee}`);
    
    const requestReceipt = await randomnessContract.methods
    .request()
    .send({
        value: fee,
        from: address,
    });
    console.log(`request tx: ${requestReceipt.transactionHash}`);

    // Read the sequence number for the request from the transaction events.
    const sequenceNumber =
        requestReceipt.events.RandomnessRequested.returnValues.sequenceNumber;
    console.log(`sequence: ${sequenceNumber}`);

    let fromBlock = requestReceipt.blockNumber;
    const intervalId = setInterval(async () => {
    const currentBlock = await web3.eth.getBlockNumber();
        if(fromBlock > currentBlock) {
        return;
        }
        // Get 'FlipResult' events emitted by the CoinFlip contract for given block range.
        const events = await randomnessContract.getPastEvents("RandomnessResult", {
        fromBlock: fromBlock,
        toBlock: currentBlock,
        });
        fromBlock = currentBlock + 1n;
        // Find the event with the same sequence number as the request.
        const event = events.find(event => event.returnValues.sequenceNumber === sequenceNumber);
        // // If the event is found, log the result and stop polling.
        // if(event !== undefined) {
        // console.log(`result: ${event.returnValues.isHeads ? 'Heads' : 'Tails'}`);
        // clearInterval(intervalId);
        // }
        if(event !== undefined) {
            console.log(`result: ${event.returnValues.randomNumber}`);
            clearInterval(intervalId);
        }
    }, 1000);
}

main();