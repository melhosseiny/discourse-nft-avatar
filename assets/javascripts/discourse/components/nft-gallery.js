import { tracked } from "@glimmer/tracking";
import Component from "@ember/component";
import { action } from "@ember/object";
import I18n from "I18n";

const OPENSEA_API = "https://api.opensea.io/api/v2";
export const ASSETS_LIMIT = 20;

const queryParamTmpl = (key, value) => (value ? `${key}=${value}` : "");

const strQueryParams = (queryParams) =>
  Object.entries(queryParams)
    .map((p) => queryParamTmpl(...p))
    .filter((p) => p)
    .join("&");

export default class extends Component {
  @tracked loading = false;
  @tracked error;
  @tracked noMore = false;
  assets = []; // not @tracked to work in nft-avatar-test
  next = undefined;
  collections = []; // not @tracked to work in nft-avatar-test
  observer;
  lastImg;

  constructor() {
    super(...arguments);
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            this.fetchMoreAssets();
          }
        });
      },
      {
        root: document.querySelector(".avatar-selector.modal-body"),
        rootMargin: "15px",
        threshold: 1.0,
      }
    );
  }

  async fetchAssets(next_cursor) {
    this.error = undefined;
    this.loading = true;
    try {
      const queryParams = {
        limit: ASSETS_LIMIT,
        collection: this.query,
        next: next_cursor,
      };
      const response = await fetch(
        `${OPENSEA_API}/chain/ethereum/account/${
          this.address
        }/nfts?${strQueryParams(queryParams)}`,
        {
          headers: {
            "x-api-key": this.siteSettings.opensea_api_key,
          },
        }
      );
      const { nfts, next } = await response.json();
      this.noMore = nfts.length < ASSETS_LIMIT ? true : false;
      this.set("assets", [
        ...this.assets,
        ...nfts.map((nft) => {
          nft.display_image_url = nft.display_image_url.replace(
            "&auto=format",
            ""
          );
          return nft;
        }),
      ]);
      this.next = next;
      const collections = [...new Set(nfts.map((nft) => nft.collection))];
      this.set("collections", [
        ...new Set([...this.collections, ...collections]),
      ]);
    } catch (e) {
      this.error = I18n.t("nft_avatar.trouble_at_sea");
    } finally {
      this.loading = false;
    }
  }

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    this.fetchAssets();
  }

  didRender() {
    super.didRender(...arguments);
    const lastImg = this.element.querySelector(".nft-gallery .nft:last-child");
    if (lastImg && !this.loading && !this.noMore) {
      this.observer.observe(lastImg);
      this.lastImg = lastImg;
    }
  }

  @action
  async fetchMoreAssets() {
    this.fetchAssets(this.next);
  }

  @action
  async refetchAssets() {
    this.next = undefined;
    this.set("assets", []);
    this.fetchAssets();
  }

  @action
  async selectAsset(event) {
    this.select({
      src: event.target.src,
      tokenId: event.target.dataset.tokenId,
      contractAddress: event.target.dataset.contractAddress,
    });
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.observer.disconnect();
  }
}
