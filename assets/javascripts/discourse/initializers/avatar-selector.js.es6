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
              console.log("connecting to wallet");
              this.set("connecting", true);
              if (!window.ethereum) {
                throw new Error("Can't find MetaMask");
              }
              const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
              console.log("accounts", accounts);
              this.set("address", accounts[0].toLowerCase());
            } catch (e) {
              console.error(e);
              console.error(`${e.message}`);
            } finally {
              this.set("connecting", false);
              console.log("connected to wallet");
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
