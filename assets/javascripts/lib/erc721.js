// https://eips.ethereum.org/EIPS/eip-721

// eslint-disable-next-line
const web3 = new Web3(Web3.givenProvider);

// Find the owner of an NFT
export const owner_of = async (token_id, contract_address) => {
  const nft_abi = [
    {
      inputs: [
        {
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ownerOf",
      outputs: [
        {
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const nft_contract = new web3.eth.Contract(nft_abi, contract_address);
  const call_data = nft_contract.methods["ownerOf"](token_id).encodeABI();
  const owner = await web3.eth.call({
    to: contract_address,
    data: call_data,
  });
  return owner;
};

// Count all NFTs assigned to an owner
export const balance_of = async (owner, contract_address) => {
  const nft_abi = [
    {
      inputs: [
        {
          name: "owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const nft_contract = new web3.eth.Contract(nft_abi, contract_address);
  const call_data = nft_contract.methods["balanceOf"](owner).encodeABI();
  const balance = await web3.eth.call({
    to: contract_address,
    data: call_data,
  });
  return balance;
};
