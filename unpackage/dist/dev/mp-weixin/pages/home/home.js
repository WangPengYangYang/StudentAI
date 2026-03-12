"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {}
    };
  },
  onLoad() {
    this.loadUserInfo();
  },
  methods: {
    loadUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = userInfo;
      } else {
        common_vendor.index.redirectTo({
          url: "/pages/index/index"
        });
      }
    },
    navigateToUserInfo() {
      common_vendor.index.navigateTo({
        url: "/pages/user-info/user-info"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatarUrl || "/static/logo.png",
    b: common_vendor.t($data.userInfo.nickName || "用户"),
    c: common_vendor.o((...args) => $options.navigateToUserInfo && $options.navigateToUserInfo(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
