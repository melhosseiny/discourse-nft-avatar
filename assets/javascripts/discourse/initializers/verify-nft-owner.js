import { withPluginApi } from "discourse/lib/plugin-api";
import { owner_of } from "discourse/plugins/discourse-nft-avatar/lib/erc721";

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

      if (nft_verified === false) {
        const owner = await owner_of(nft_token_id, nft_contract_address);
        const ownerAddress = web3.eth.abi.decodeParameter("address", owner);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        // const address = "0xdccac502461c0d8261daf2ab3e411663e39b2654";
        console.log(address, address.length, ownerAddress, ownerAddress.length);
        console.log(address.toLowerCase() === ownerAddress.toLowerCase());
        if (address.toLowerCase() !== ownerAddress.toLowerCase()) {
          currentUser.set("custom_fields.nft_verified", true);
          currentUser.save([ "custom_fields" ]);
        }
      }
    });
  }
}
