import { withPluginApi } from "discourse/lib/plugin-api";
import "discourse/plugins/discourse-nft-avatar/lib/web3.min";

const web3 = new Web3(Web3.givenProvider);

export default {
  name: "verify-nft-owner",
  initialize() {
    withPluginApi("1.0.0", async api => {
      const currentUser = api.getCurrentUser();
      if (currentUser === null) return false;
      const {
        nft_contract_address,
        nft_token_id,
        nft_verified
      } = currentUser.custom_fields;
      console.log("nft_custom_fields", currentUser.custom_fields);

      if (nft_verified === true) {
        const owner = await owner_of(nft_token_id, nft_contract_address);
        const ownerAddress = web3.eth.abi.decodeParameter("address", owner);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        // const address = "0xdccac502461c0d8261daf2ab3e411663e39b2654";
        console.log(address, address.length, ownerAddress, ownerAddress.length);
        console.log(address.toLowerCase() === ownerAddress.toLowerCase());
        if (address.toLowerCase() !== ownerAddress.toLowerCase()) {
          currentUser.set("custom_fields.nft_verified", false);
          currentUser.save([ "custom_fields" ]);
        }
      }
    });
  }
}

export const owner_of = async (token_id, nft_address) => {
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

  const nft_contract = new web3.eth.Contract(nft_abi, nft_address);
  const call_data = nft_contract.methods["ownerOf"](token_id).encodeABI();
  const owner = await web3.eth.call({
    to: nft_address,
    data: call_data,
  });
  return owner;
}

export const balance_of = async (owner, nft_address) => {
  const nft_abi = [
    {
      inputs: [
        {
          name: "owner",
          type: "address"
        }
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ];

  const nft_contract = new web3.eth.Contract(nft_abi, nft_address);
  const call_data = nft_contract.methods["balanceOf"](owner).encodeABI();
  const balance = await web3.eth.call({
    to: nft_address,
    data: call_data,
  });
  return balance;
}
