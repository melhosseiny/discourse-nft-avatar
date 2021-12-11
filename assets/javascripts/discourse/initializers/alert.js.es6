import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "alert",
  initialize() {
    withPluginApi("1.0.0", api => {
      api.modifyClass("controller:avatar-selector", {
        pluginId: "discourse-nft-avatar",
          actions: {
            setSelected(type) {
              this.setSelected(type);
            }
          }
      });
    });
  }
}
