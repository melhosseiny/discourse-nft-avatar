import Component from "@ember/component";
import { warn } from "@ember/debug";
import { isBlank } from "@ember/utils";
import { tagName } from "@ember-decorators/component";
import UppyUploadMixin from "discourse/mixins/uppy-upload";
import discourseComputed from "discourse-common/utils/decorators";
import I18n from "discourse-i18n";

const AUTH_EXTS = {
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".webp": "image/webp",
};

const addExtIfMissing = (name, blobType) => {
  if (!Object.keys(AUTH_EXTS).some((ext) => name.endsWith(ext))) {
    const typeExtMap = new Map(
      Object.entries(AUTH_EXTS).map((entry) => entry.reverse())
    );
    name += typeExtMap.get(blobType);
  }
  return name;
};

@tagName("span")
export default class AvatarUploader extends Component.extend(UppyUploadMixin) {
  type = "avatar";
  imageIsNotASquare = false;

  @discourseComputed("uploading", "uploadedAvatarId")
  customAvatarUploaded() {
    return !this.uploading && !isBlank(this.uploadedAvatarId);
  }

  validateUploadedFilesOptions() {
    return { imagesOnly: true };
  }

  uploadDone(upload) {
    this.setProperties({
      imageIsNotASquare: upload.width !== upload.height,
      uploadedAvatarTemplate: upload.url,
      uploadedAvatarId: upload.id,
    });

    this.done();
  }

  // only upload if selected NFT changes
  didReceiveAttrs() {
    super.didReceiveAttrs();
    if (this.get("nft") !== null && this.get("nft") !== this.get("prev_nft")) {
      this.uploadNFT(this.get("nft"));
    }
    this.set("prev_nft", this.get("nft"));
  }

  async uploadNFT(src) {
    const url = new URL(src);
    let name = url.pathname.split("/").pop();
    const response = await fetch(url.href);
    const blob = await response.blob();
    name = addExtIfMissing(name, blob.type);

    try {
      this._uppyInstance.addFile({
        source: `${this.id} file input`,
        name,
        type: blob.type,
        data: blob,
      });
    } catch (err) {
      warn(`error adding files to uppy: ${err}`, {
        id: "discourse.upload.uppy-add-files-error",
      });
    }
  }

  @discourseComputed("user_id")
  data(user_id) {
    return { user_id };
  }

  @discourseComputed("uploading", "uploadProgress")
  uploadLabel() {
    return this.uploading
      ? `${I18n.t("uploading")} ${this.uploadProgress}%`
      : I18n.t("upload");
  }
}
