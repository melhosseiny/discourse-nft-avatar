import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { withPluginApi } from "discourse/lib/plugin-api";
import I18n from "I18n";

window.getEthereum = () => window.ethereum || window.braveEthereum;

export default {
  name: "extend-avatar-selector",
  initialize() {
    withPluginApi("1.0.0", (api) => {
      api.modifyClass(
        "component:modal/avatar-selector",
        (Superclass) =>
          class extends Superclass {
            @tracked uploader = "";
            @tracked connecting = false;
            @tracked connectError = undefined;
            @tracked address = undefined;
            @tracked nft = undefined;

            @action
            async connectToWallet() {
              this.uploader = "nft";

              try {
                this.connecting = true;
                const ethereum = window.getEthereum();
                if (!ethereum) {
                  throw {
                    name: "metamask_error",
                    message: I18n.t("nft_avatar.no_wallet"),
                  };
                }
                const accounts = await ethereum.request({
                  method: "eth_requestAccounts",
                });
                this.address = accounts[0].toLowerCase();
              } catch (e) {
                this.connectError = e.message;
              } finally {
                this.connecting = false;
              }
            }

            @action
            selectNFT(nft) {
              const { src, tokenId, contractAddress } = nft;
              this.uploader = "nft";
              this.nft = src;
              this.user.set("custom_fields.nft_verified", true);
              this.user.set("custom_fields.nft_wallet_address", this.address);
              this.user.set("custom_fields.nft_token_id", tokenId);
              this.user.set(
                "custom_fields.nft_contract_address",
                contractAddress
              );
            }

            @action
            setUploader() {
              this.uploader = "file";
            }

            @action
            saveAvatarSelection() {
              const selectedUploadId = this.selectedUploadId;
              const type = this.selected;

              this.user.save(["custom_fields"]);

              this.user
                .pickAvatar(selectedUploadId, type)
                .then(() => window.location.reload())
                .catch(popupAjaxError);
            }
          }
      );
    });
  },
};
