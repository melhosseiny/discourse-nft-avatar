import { acceptance } from "helpers/qunit-helpers";
acceptance("NFT avatar", { loggedIn: true });

test("Purple tentacle button works", assert => {
  visit("/admin/plugins/nft-avatar");

  andThen(() => {
    assert.ok(exists("#show-tentacle", "it shows purple tentacle button"));
    assert.ok(!exists(".tentacle"), "the tentacle is not shown yet");
  });

  click("#show-tentacle");

  andThen(() => {
    assert.ok(exists(".tentacle"), "the tentacle wants to rule the world!");
  });
})
