import { withPluginApi } from "discourse/lib/plugin-api";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { h } from "virtual-dom";
import { avatarFor } from "discourse/widgets/post";
import autoGroupFlairForUser from "discourse/lib/avatar-flair";
import I18n from "I18n";

export default {
  name: "init",
  initialize() {
    withPluginApi("1.0.0", api => {
      api.includePostAttributes("user_nft_verified");

      api.customUserAvatarClasses(user => {
        return user.custom_fields.nft_verified ? ["nft"] : [];
      });

      api.reopenWidget("post-avatar", {
        html(attrs) {
          let body;
          if (!attrs.user_id) {
            body = iconNode("far-trash-alt", { class: "deleted-user-avatar" });
          } else {
            body = avatarFor.call(this, this.settings.size, {
              template: attrs.avatar_template,
              username: attrs.username,
              name: attrs.name,
              url: attrs.usernameUrl,
              className: "main-avatar",
              hideTitle: true,
              extraClasses: attrs.user_nft_verified ? "nft" : ""
            });
          }

          const postAvatarBody = [body];

          if (attrs.flair_url || attrs.flair_bg_color) {
            postAvatarBody.push(this.attach("avatar-flair", attrs));
          } else {
            const autoFlairAttrs = autoGroupFlairForUser(this.site, attrs);

            if (autoFlairAttrs) {
              postAvatarBody.push(this.attach("avatar-flair", autoFlairAttrs));
            }
          }

          const result = [h("div.post-avatar", postAvatarBody)];

          if (this.settings.displayPosterName) {
            result.push(this.attach("post-avatar-user-info", attrs));
          }

          return result;
        }
      })

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
                  message: I18n.t("nft_avatar.no_wallet")
                }
              }
              const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
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
            this.user.set("custom_fields.nft_token_id", tokenId);
            this.user.set("custom_fields.nft_contract_address", contractAddress);
          },
          setUploader() {
            this.set("uploader", "file");
          },
          saveAvatarSelection() {
            const selectedUploadId = this.selectedUploadId;
            const type = this.selected;

            this.user.save([
              "custom_fields"
            ]);

            this.user
              .pickAvatar(selectedUploadId, type)
              .then(() => window.location.reload())
              .catch(popupAjaxError);
          },
        }
      });
    });
  }
}
