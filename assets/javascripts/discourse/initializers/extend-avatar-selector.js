import { withPluginApi } from "discourse/lib/plugin-api";
import { popupAjaxError } from "discourse/lib/ajax-error";
import I18n from "I18n";

export default {
  name: "extend-avatar-selector",
  initialize() {
    withPluginApi("1.0.0", (api) => {
      api.modifyClass("controller:avatar-selector", {
        pluginId: "discourse-nft-avatar",
        uploader: "",
        connecting: false,
        actions: {
          async connectToWallet() {
            this.set("uploader", "nft");
            try {
              this.set("connecting", true);
              if (!window.ethereum) {
                throw {
                  name: "metamask_error",
                  message: I18n.t("nft_avatar.no_wallet"),
                };
              }
              const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
              });
              this.set("address", accounts[0].toLowerCase());
            } catch (e) {
              this.set("connectError", e.message);
            } finally {
              this.set("connecting", false);
            }
          },
          selectNFT(nft) {
            const { src, tokenId, contractAddress } = nft;
            this.set("uploader", "nft");
            this.set("nft", src);
            this.user.set("custom_fields.nft_verified", true);
            this.user.set("custom_fields.nft_wallet_address", this.address);
            this.user.set("custom_fields.nft_token_id", tokenId);
            this.user.set(
              "custom_fields.nft_contract_address",
              contractAddress
            );
          },
          setUploader() {
            this.set("uploader", "file");
          },
          saveAvatarSelection() {
            const selectedUploadId = this.selectedUploadId;
            const type = this.selected;

            this.user.save(["custom_fields"]);

            this.user
              .pickAvatar(selectedUploadId, type)
              .then(() => window.location.reload())
              .catch(popupAjaxError);
          },
        },
      });
    });
  },
};
