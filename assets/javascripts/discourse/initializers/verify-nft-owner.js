import "discourse/plugins/discourse-nft-avatar/lib/web3.min";
import { withPluginApi } from "discourse/lib/plugin-api";
import { owner_of } from "discourse/plugins/discourse-nft-avatar/lib/erc721";

// eslint-disable-next-line
const web3 = new Web3(Web3.givenProvider);

export default {
  name: "verify-nft-owner",
  initialize() {
    withPluginApi("1.0.0", async (api) => {
      const currentUser = api.getCurrentUser();
      if (currentUser === null) {
        return false;
      }

      const {
        nft_verified,
        nft_wallet_address,
        nft_contract_address,
        nft_token_id,
      } = currentUser.custom_fields;

      if (nft_verified === true) {
        const owner = await owner_of(nft_token_id, nft_contract_address);
        const ownerAddress = web3.eth.abi.decodeParameter("address", owner);

        if (nft_wallet_address.toLowerCase() !== ownerAddress.toLowerCase()) {
          currentUser.set("custom_fields.nft_verified", false);
          currentUser.set("user_option", {});
          currentUser.save(["custom_fields"]);
        }
      }
    });
  },
};
