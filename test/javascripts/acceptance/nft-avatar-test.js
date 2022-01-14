import { acceptance, exists, query, queryAll } from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import { click, fillIn, visit } from "@ember/test-helpers";

import assets from "discourse/plugins/discourse-nft-avatar/fixtures/assets";
import assetsCollection from "discourse/plugins/discourse-nft-avatar/fixtures/assets_collection";
import collections from "discourse/plugins/discourse-nft-avatar/fixtures/collections";

import { ASSETS_LIMIT } from "discourse/plugins/discourse-nft-avatar/discourse/components/nft-gallery";

const OWNER_OF_NONE = "0x3b8fff947d5dd0c0f0ef7aaa611ecf92e0885f96";
const OWNER_OF_MANY = "0x63c9fb006e4474699cc6ccd09167ce5d2a875c9d";

const mockEthereumService = owner => {
  return { request: () => [owner] };
};

acceptance("NFT avatar uploader works", function (needs) {
  needs.user();

  needs.hooks.beforeEach(function () {
    window.ethereum = mockEthereumService(OWNER_OF_MANY);
  });

  needs.pretender((server, helper) => {
    // ?owner=0x63c9fb006e4474699cc6ccd09167ce5d2a875c9d
    server.get("https://api.opensea.io/api/v1/assets", request => {

      if (request.queryParams.owner === OWNER_OF_NONE) {
        return helper.response({ assets: [] });
      }
      if ("collection" in request.queryParams) {
        return helper.response(assetsCollection);
      }
      return helper.response(assets);
    });

    // ?asset_owner=0x63c9fb006e4474699cc6ccd09167ce5d2a875c9d&limit=300
    server.get("https://api.opensea.io/api/v1/collections", () => {
      return helper.response(collections);
    });
  });

  test("Clicking NFT button connects to wallet and fetches NFTs", async function (assert) {
    await visit("/u/eviltrout/preferences/");
    await click(".pref-avatar button");

    assert.ok(exists('#nft-avatar-uploader'), "it shows upload NFT button");

    await click("#nft-avatar-uploader");

    assert.ok(exists(".nft-gallery"), "it shows NFT gallery");
    assert.equal(queryAll(".nft-gallery .nft").length, ASSETS_LIMIT, "it shows 20 NFTs");
    assert.equal(queryAll("datalist#collections option").length, 21, "it shows 21 collections in a dropdown");

    await fillIn("#collection-input", "stoner-cats-official");
    await click(".nft-gallery"); // click outside

    assert.equal(queryAll(".nft-gallery .nft").length, 4, "it shows 4 Stoner Cats");
  });

  test("Show message if user doesn't own any NFTs", async function (assert) {
    window.ethereum = mockEthereumService(OWNER_OF_NONE);

    await visit("/u/eviltrout/preferences/");
    await click(".pref-avatar button");
    await click("#nft-avatar-uploader");

    assert.equal(queryAll(".nft-gallery .nft").length, 0, "it shows 0 NFTs");
    assert.equal(query(".nft-gallery .alert").textContent.trim(), "You don't own any NFTs", "it shows message");
  });
});

acceptance("NFT avatar uploader works - Wallet support", function (needs) {
  needs.user();

  test("Show message if MetaMask is not installed", async function (assert) {
    window.ethereum = undefined;

    await visit("/u/eviltrout/preferences/");
    await click(".pref-avatar button");
    await click("#nft-avatar-uploader");

    assert.equal(query(".alert.alert-error").textContent.trim(), "Can't find MetaMask. Install MetaMask or use Brave Wallet.", "it shows an error message");
  });
});
