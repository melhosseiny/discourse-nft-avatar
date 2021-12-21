import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "alert",
  initialize() {
    withPluginApi("1.0.0", api => {
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
                  message: "Can't find MetaMask. Install MetaMask or use Brave Wallet."
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
          selectNFT(url) {
            this.set("uploader", "nft");
            this.set("nft", url);
          },
          setUploader() {
            this.set("uploader", "file");
          }
        }
      });
    });
  }
}
