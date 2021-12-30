import Component from "@ember/component";
import { action } from "@ember/object";

// needed until we add @glimmer/tracking
const tracked = Ember._tracked;

const OPENSEA_API = "https://api.opensea.io/api/v1";
const LIMIT = 20;

const queryParamTmpl = (key, value) => value
  ? `${key}=${value}`
  : '';

const strQueryParams = (queryParams) =>
  Object.entries(queryParams)
  .map(p => queryParamTmpl(...p))
  .filter(p => p)
  .join('&')

export default class extends Component {
  @tracked assets = [];
  offset = 0;
  @tracked collections;
  @tracked loading = false;
  @tracked error;
  observer;
  lastImg;
  noMore = false;

  constructor() {
    super(...arguments);
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.observer.unobserve(entry.target);
          this.fetchMoreAssets();
        }
      });
    }, {
      root: document.querySelector('.avatar-selector.modal-body'),
      rootMargin: "15px",
      threshold: 1.0
    });
  }

  async fetchAssets(offset) {
    this.error = undefined;
    this.loading = true;
    try {
      const address = this.address;
      // const address = "0xdccac502461c0d8261daf2ab3e411663e39b2654";
      // const address = "0x39cc9c86e67baf2129b80fe3414c397492ea8026";
      // const address = "0x2e3c41e8f8278532326673c598fdd240a620e518";
      const queryParams = {
        owner: address,
        offset,
        collection: this.query
      }
      const response = await fetch(`${OPENSEA_API}/assets?${strQueryParams(queryParams)}`);
      const rawAssets = (await response.json()).assets;
      const assets = rawAssets.filter(asset =>
        asset.image_url && asset.asset_contract.schema_name === "ERC721"
      );
      this.noMore = rawAssets.length < LIMIT ? true : false;
      this.assets = [...this.assets, ...assets];
    } catch (e) {
      this.error = I18n.t("nft_avatar.trouble_at_sea");
    } finally {
      this.loading = false;
    }
  }

  async fetchCollections() {
    try {
      const address = this.address;
      // const address = "0xdccac502461c0d8261daf2ab3e411663e39b2654";
      // const address = "0x39cc9c86e67baf2129b80fe3414c397492ea8026";
      // const address = "0x2e3c41e8f8278532326673c598fdd240a620e518";
      const response = await fetch(`${OPENSEA_API}/collections?asset_owner=${address}`);
      const collections = (await response.json()).filter(collection => collection.slug);
      this.collections = collections;
    } catch (e) {
      this.error = I18n.t("nft_avatar.trouble_at_sea");
    }
  }

  didReceiveAttrs() {
    this.fetchAssets();
    this.fetchCollections();
  }

  didRender() {
    const lastImg = this.element.querySelector(".nft-gallery .nft:last-child");
    if (lastImg && !this.loading && !this.noMore) {
      this.observer.observe(lastImg);
      this.lastImg = lastImg;
    }
  }

  @action
  async fetchMoreAssets() {
    this.offset += LIMIT;
    this.fetchAssets(this.offset);
  }

  @action
  async refetchAssets() {
    this.offset = 0;
    this.assets = [];
    this.fetchAssets();
  }

  @action
  async selectAsset(event) {
    this.select({
      src: event.target.src,
      tokenId: event.target.dataset.tokenId,
      contractAddress: event.target.dataset.contractAddress
    });
  }

  willDestroy() {
    this.observer.disconnect();
  }
}
