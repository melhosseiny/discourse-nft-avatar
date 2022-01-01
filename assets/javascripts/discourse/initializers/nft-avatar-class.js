import { withPluginApi } from "discourse/lib/plugin-api";
import { h } from "virtual-dom";
import { iconNode } from "discourse-common/lib/icon-library";
import { avatarFor } from "discourse/widgets/post";
import autoGroupFlairForUser from "discourse/lib/avatar-flair";

export default {
  name: "nft-avatar-class",
  initialize() {
    withPluginApi("1.0.0", (api) => {
      api.includePostAttributes("user_nft_verified");

      api.customUserAvatarClasses((user) =>
        user.custom_fields.nft_verified ? ["nft"] : []
      );

      api.addTopicParticipantClassesCallback((attrs) =>
        attrs.user_nft_verified ? ["nft"] : []
      );

      api.reopenWidget("post-avatar", {
        html(attrs) {
          let body;
          if (!attrs.user_id) {
            body = iconNode("far-trash-alt", { class: "deleted-user-avatar" });
          } else {
            body = avatarFor.call(this, this.settings.size, {
              template: attrs.avatar_template,
              username: attrs.username,
              name: attrs.name,
              url: attrs.usernameUrl,
              className: "main-avatar",
              hideTitle: true,
              extraClasses: attrs.user_nft_verified ? "nft" : "",
            });
          }

          const postAvatarBody = [body];

          if (attrs.flair_url || attrs.flair_bg_color) {
            postAvatarBody.push(this.attach("avatar-flair", attrs));
          } else {
            const autoFlairAttrs = autoGroupFlairForUser(this.site, attrs);

            if (autoFlairAttrs) {
              postAvatarBody.push(this.attach("avatar-flair", autoFlairAttrs));
            }
          }

          const result = [h("div.post-avatar", postAvatarBody)];

          if (this.settings.displayPosterName) {
            result.push(this.attach("post-avatar-user-info", attrs));
          }

          return result;
        },
      });
    });
  },
};
