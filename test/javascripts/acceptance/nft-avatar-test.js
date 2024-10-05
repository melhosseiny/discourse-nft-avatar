import { click, fillIn, visit, waitUntil } from "@ember/test-helpers";
import { test } from "qunit";
import {
  acceptance,
  exists,
  query,
  queryAll,
  updateCurrentUser,
} from "discourse/tests/helpers/qunit-helpers";
import I18n from "I18n";
import { ASSETS_LIMIT } from "discourse/plugins/discourse-nft-avatar/discourse/components/nft-gallery";
import assets from "discourse/plugins/discourse-nft-avatar/fixtures/assets";
import assetsCollection from "discourse/plugins/discourse-nft-avatar/fixtures/assets_collection";

const OPENSEA_API = "https://api.opensea.io/api/v2";

const OWNER_OF_NONE = "0x3b8fff947d5dd0c0f0ef7aaa611ecf92e0885f96";
const OWNER_OF_MANY = "0x63c9fb006e4474699cc6ccd09167ce5d2a875c9d";
const FAKE_OWNER = "0x";

const mockEthereumService = (owner) => {
  return { request: () => [owner] };
};

acceptance("NFT avatar uploader works", function (needs) {
  needs.user({ can_upload_avatar: true });

  needs.pretender((server, helper) => {
    // https://api.opensea.io/api/v2/chain/ethereum/account/0x63c9fb006e4474699cc6ccd09167ce5d2a875c9d/nfts?limit=20
    server.get(
      `${OPENSEA_API}/chain/ethereum/account/${OWNER_OF_MANY}/nfts`,
      (request) => {
        if ("collection" in request.queryParams) {
          return helper.response(assetsCollection);
        }
        return helper.response(assets);
      }
    );

    // https://api.opensea.io/api/v2/chain/ethereum/account/0x3b8fff947d5dd0c0f0ef7aaa611ecf92e0885f96/nfts?limit=20
    server.get(
      `${OPENSEA_API}/chain/ethereum/account/${OWNER_OF_NONE}/nfts`,
      () => {
        return helper.response({ nfts: [] });
      }
    );

    server.put("/u/eviltrout/preferences/avatar/pick", () => {
      return helper.response({ success: "OK" });
    });

    server.get(
      "https://lh3.googleusercontent.com/r5wv8pB_nlslCxoeZd25aCcPjs9Mm1vraf01I1w2KkBWkGylZN2FlGOHJvdxdeeIBj4r_BJhrUDzO421-N4gfTvRjWDrCHsLdy68cw",
      server.passthrough
    );
  });

  test("Clicking NFT button connects to wallet and fetches NFTs", async function (assert) {
    window.getEthereum = () => mockEthereumService(OWNER_OF_MANY);
    await visit("/u/eviltrout/preferences/");
    await click("#edit-avatar");
    assert.ok(exists("#nft-avatar-uploader"), "it shows upload NFT button");
    await click("#nft-avatar-uploader .btn");
    assert.ok(exists(".nft-gallery"), "it shows NFT gallery");
    await waitUntil(() => query(".nft-gallery .nft"));
    assert.equal(
      queryAll(".nft-gallery .nft").length,
      ASSETS_LIMIT,
      "it shows 20 NFTs"
    );
    assert.equal(
      queryAll("datalist#collections option").length,
      3,
      "it shows 3 collections in a dropdown"
    );

    await fillIn("#collection-input", "satoshi-island-citizenship-nfts");
    await click(".nft-gallery"); // click outside

    assert.equal(
      queryAll(".nft-gallery .nft").length,
      4,
      "it shows 4 Stoner Cats"
    );
  });

  test("Show message if user doesn't own any NFTs", async function (assert) {
    window.getEthereum = () => mockEthereumService(OWNER_OF_NONE);
    await visit("/u/eviltrout/preferences/");
    await click("#edit-avatar");
    await click("#nft-avatar-uploader .btn");
    await waitUntil(() => query(".nft-gallery .alert"));
    assert.equal(queryAll(".nft-gallery .nft").length, 0, "it shows 0 NFTs");
    assert.equal(
      query(".nft-gallery .alert").textContent.trim(),
      "You don't own any NFTs",
      I18n.t("nft_avatar.trouble_at_sea")
    );
  });
});

acceptance("NFT avatar uploader works - Wallet support", function (needs) {
  needs.user({ can_upload_avatar: true });

  needs.hooks.beforeEach(function () {
    window.getEthereum = () => undefined;
  });

  test("Show message if MetaMask is not installed", async function (assert) {
    await visit("/u/eviltrout/preferences/");
    await click("#edit-avatar");
    await click("#nft-avatar-uploader .btn");
    assert.equal(
      query(".alert.alert-error").textContent.trim(),
      I18n.t("nft_avatar.no_wallet"),
      "it shows an error message"
    );
  });
});

acceptance("NFT avatar verification works", function (needs) {
  needs.user({ can_upload_avatar: true });

  test("Show message if NFT avatar can't be verified", async function (assert) {
    updateCurrentUser({
      custom_fields: {
        nft_contract_address: "0x506bac140906af4f85ff9bef70c8e42de6e5d45c",
        nft_token_id: "335",
        nft_verified: false,
        nft_wallet_address: FAKE_OWNER,
      },
    });

    await visit("/");
    assert.ok(exists(".verify-nft-notice"));
    assert.equal(
      query(".verify-nft-notice").textContent.replace(/\s+/g, " ").trim(),
      `${I18n.t("nft_avatar.verify_notice")} preferences.`,
      "it shows NFT unverified notice"
    );
  });
});
