export default {
  setupComponent(args, component) {
    component.set("address", "");
  },
  actions: {
    uploadComplete() {
      console.log("selected");
      this.element.querySelector("input").checked = true;
      // this.done();
    },
    async connectToWallet() {
      try {
        if (!window.ethereum) {
          throw new Error("Can't find MetaMask");
        }
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("accounts", accounts);
        this.set("address", accounts[0].toLowerCase());
      } catch (e) {
        console.error(e);
        console.error(`${e.message}`);
      }
    },
    selectNFT(url) {
      this.set("nft", url);
    }
  }
}
