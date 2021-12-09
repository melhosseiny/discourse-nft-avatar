const OPENSEA_API = "https://api.opensea.io/api/v1";

export default Ember.Component.extend({
  async didInsertElement() {
    // const address = this.get("address");
    const address = "0xdccac502461c0d8261daf2ab3e411663e39b2654";
    const response = await fetch(`${OPENSEA_API}/assets?owner=${address}`);
    const assets = (await response.json()).assets.filter(asset => asset.image_url);
    console.log(address, assets);
    this.set("assets", assets);
  },
  actions: {
    async selectAsset(event) {
      console.log(event.target.src);
      const response = await fetch(event.target.src)
      const blob = await response.blob();
      console.log(blob);
    }
  }
})
