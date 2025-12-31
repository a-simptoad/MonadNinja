export const abi = [
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint64",
					"name": "sequenceNumber",
					"type": "uint64"
				}
			],
			"name": "RandomnessRequested",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"internalType": "uint64",
					"name": "sequenceNumber",
					"type": "uint64"
				},
				{
					"indexed": false,
					"internalType": "uint256",
					"name": "randomNumber",
					"type": "uint256"
				}
			],
			"name": "RandomnessResult",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [],
			"name": "WinnerTxFailed",
			"type": "event"
		},
		{
			"inputs": [],
			"name": "entropy",
			"outputs": [
				{
					"internalType": "contract IEntropyV2",
					"name": "",
					"type": "address"
				}
			],
			"stateMutability": "view",
			"type": "function"
		},
		{
			"inputs": [],
			"name": "requestRandomNumber",
			"outputs": [],
			"stateMutability": "payable",
			"type": "function"
		},
		{
			"inputs": [
				{
					"internalType": "string",
					"name": "name",
					"type": "string"
				},
				{
					"internalType": "uint256",
					"name": "score",
					"type": "uint256"
				}
			],
			"name": "updateScore",
			"outputs": [],
			"stateMutability": "nonpayable",
			"type": "function"
		}
] as const;