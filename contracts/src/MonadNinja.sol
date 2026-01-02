// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.19;

import { IEntropyConsumer } from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import { IEntropyV2 } from "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";

// @param entropyAddress The address of the entropy contract.
contract MonadNinja is IEntropyConsumer {
    event RandomnessRequested(uint64 sequenceNumber);
    event RandomnessResult(uint64 sequenceNumber, uint256 randomNumber);

    error RewardTxFailed();

    IEntropyV2 public entropy;
    address[] private players;
    mapping(address => bool) private played;
    mapping(address => string) private names;
    mapping(address => uint256) private scores;

    constructor(address entropyAddress) {
        entropy = IEntropyV2(entropyAddress);
    }

    function updateScore(string memory name, uint256 score) external {
        if(played[msg.sender]){
            names[msg.sender] = name;
            scores[msg.sender] = score;
        }
        played[msg.sender] = false;
    }

    function requestRandomNumber() external payable {
        // Get the fee for the request
        uint256 fee = entropy.getFeeV2();
        // Request the random number with the callback
        uint64 sequenceNumber = entropy.requestV2{ value: fee }();
        // Store the sequence number to identify the callback request
        played[msg.sender] = true;

        // check if msg.sender is already on players array
        bool exists = false;
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] == msg.sender) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            players.push(msg.sender);
        }

        if(msg.value > fee){
            (bool ok, ) = payable(msg.sender).call{value: (msg.value - fee)}("");
        }
        emit RandomnessRequested(sequenceNumber);
    }

    // @param sequenceNumber The sequence number of the request.
    // @param provider The address of the provider that generated the random number. If your app uses multiple providers, you can use this argument to distinguish which one is calling the app back.
    // @param randomNumber The generated random number.
    // This method is called by the entropy contract when a random number is generated.
    // This method **must** be implemented on the same contract that requested the random number.
    // This method should **never** return an error -- if it returns an error, then the keeper will not be able to invoke the callback.
    // If you are having problems receiving the callback, the most likely cause is that the callback is erroring.
    // See the callback debugging guide here to identify the error https://docs.pyth.network/entropy/debug-callback-failures
    function entropyCallback(
        uint64 sequence,
        address provider,
        bytes32 randomNumber
    ) internal override {
        emit RandomnessResult(sequence, uint256(randomNumber));
    }

    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    function getInfo(address sender) external view returns(string memory name, uint256 score){
        return (names[sender], scores[sender]);
    }
    
    function getPlayers() external view returns(address[] memory){
        return players;
    }

    function getEntropyFee() external view returns(uint256) {
        return entropy.getFeeV2();
    }

    function chooseWinner() external payable {
        address firstPlace = players[0];
        for(uint256 i = 1; i < players.length; i++){
            if(scores[players[i]] > scores[firstPlace]){
                firstPlace = players[i];
            }
        }
        (bool sent, ) = payable(firstPlace).call{value: msg.value}("");
        require(sent, RewardTxFailed());
    }
}