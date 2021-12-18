import Component from "@ember/component";
import { action } from "@ember/object";

// needed until we add @glimmer/tracking
const tracked = Ember._tracked;

const OPENSEA_API = "https://api.opensea.io/api/v1";
const LIMIT = 20;

export default class extends Component {
  @tracked assets = [];
  offset = 0;
  @tracked collections;
  @tracked loading = false;
  observer;
  lastImg;
  noMore = false;

  constructor() {
    super(...arguments);
    console.log(document.querySelector('.avatar-selector.modal-body'));

    let options = {
      root: document.querySelector('.avatar-selector.modal-body'),
      rootMargin: "15px",
      threshold: 1.0
    }

    let callback = (entries, observer) => {
      entries.forEach(entry => {
        console.log("intersecting", entry, entry.isIntersecting, entry.intersectionRatio);
        if (entry.isIntersecting) {
          console.log(`unobserving ${entry.target.outerHTML}`);
          this.observer.unobserve(entry.target);
          this.fetchMoreAssets();
        }
      });
    };
    this.observer = new IntersectionObserver(callback, options);
  }

  async fetchAssets(offset) {
    this.loading = true;
    // const address = this.get("address");
    // const address = "0xdccac502461c0d8261daf2ab3e411663e39b2654";
    const address = "0x39cc9c86e67baf2129b80fe3414c397492ea8026";
    const response = await fetch(`${OPENSEA_API}/assets?owner=${address}${offset ? `&offset=${offset}` : ''}${this.query ? `&collection=${this.query}` : ''}`);
    const assets = (await response.json()).assets.filter(asset => asset.image_url);
    console.log(address, assets, assets.length);
    this.noMore = assets.length < LIMIT ? true : false;
    this.assets = [...this.assets, ...assets];
    this.loading = false;
  }

  async fetchCollections() {
    console.log("fetching collections");
    // const address = this.get("address");
    // const address = "0xdccac502461c0d8261daf2ab3e411663e39b2654";
    const address = "0x39cc9c86e67baf2129b80fe3414c397492ea8026";
    const response = await fetch(`${OPENSEA_API}/collections?asset_owner=${address}`);
    const collections = (await response.json()).filter(collection => collection.slug);
    console.log(address, collections);
    this.collections = collections;
  }

  didReceiveAttrs() {
    this.fetchAssets();
    this.fetchCollections();
  }

  didRender() {
    console.log("didRender", this.loading, this.assets.length, this.noMore);
    const lastImg = this.element.querySelector(".nft-gallery .nft:last-child");
    if (lastImg && !this.loading && !this.noMore) {
      console.log(`observing ${lastImg.outerHTML}`);
      this.observer.observe(lastImg);
      this.lastImg = lastImg;
    }
  }

  @action
  async fetchMoreAssets() {
    console.log("fetching more assets");
    this.offset += LIMIT;
    this.fetchAssets(this.offset);
  }

  @action
  async saySomething() {
    console.log("something");
    this.offset = 0;
    this.assets = [];
    this.fetchAssets();
  }

  @action
  async selectAsset(event) {
    console.log(event.target.src);
    this.select(event.target.src);
  }
}
