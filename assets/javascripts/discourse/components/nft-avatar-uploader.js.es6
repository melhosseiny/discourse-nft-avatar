import Component from "@ember/component";
import UppyUploadMixin from "discourse/mixins/uppy-upload";
import discourseComputed from "discourse-common/utils/decorators";
import { observer } from "@ember/object";
import { warn } from "@ember/debug";

export default Component.extend(UppyUploadMixin, {
  type: "avatar",
  tagName: "span",
  imageIsNotASquare: false,

  validateUploadedFilesOptions() {
    return { imagesOnly: true };
  },

  uploadDone(upload) {
    this.setProperties({
      imageIsNotASquare: upload.width !== upload.height,
      uploadedAvatarTemplate: upload.url,
      uploadedAvatarId: upload.id,
    });

    this.done();
  },

  didReceiveAttrs() {
    console.log("got nft");
    console.log(this.get("prev_nft"));
    console.log(this.get("nft"));
    if (this.get("nft") !== this.get("prev_nft")) {
      this.uploadNFT(this.get("nft"));
    }
    this.set("prev_nft", this.get("nft"));
  },

  async uploadNFT(src) {
    const url = new URL(src);
    const name = url.pathname.split('/').pop();
    const response = await fetch(url.href)
    const blob = await response.blob();
    console.log(blob);
    try {
      this._uppyInstance.addFile({
        source: `${this.id} file input`,
        name: name,
        type: blob.type,
        data: blob,
      });
    } catch (err) {
      warn(`error adding files to uppy: ${err}`, {
        id: "discourse.upload.uppy-add-files-error",
      });
    }
  },

  @discourseComputed("user_id")
  data(user_id) {
    return { user_id };
  },
});
