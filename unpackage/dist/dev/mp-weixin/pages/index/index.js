"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      title: "留学选校助手",
      isLogin: false,
      userInfo: {}
    };
  },
  onLoad() {
    this.checkLoginStatus();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = common_vendor.index.getStorageSync("userToken");
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (token && userInfo) {
        common_vendor.index.redirectTo({
          url: "/pages/home/home"
        });
      }
    },
    // 微信登录
    wechatLogin() {
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      common_vendor.index.login({
        provider: "weixin",
        success: (loginRes) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:48", "微信登录成功", loginRes);
          this.getUserInfo();
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:52", "微信登录失败", err);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "登录失败",
            icon: "none"
          });
        }
      });
    },
    // 获取用户信息
    getUserInfo() {
      common_vendor.index.getUserInfo({
        provider: "weixin",
        success: (infoRes) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:67", "用户信息", infoRes);
          this.loginSuccess(infoRes.userInfo);
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:71", "获取用户信息失败", err);
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({
            title: "获取用户信息失败",
            icon: "none"
          });
        }
      });
    },
    // 登录成功处理
    loginSuccess(userInfo) {
      common_vendor.index.setStorageSync("userInfo", userInfo);
      common_vendor.index.setStorageSync("userToken", "wx_token_" + Date.now());
      common_vendor.index.hideLoading();
      common_vendor.index.showToast({
        title: "登录成功"
      });
      common_vendor.index.redirectTo({
        url: "/pages/home/home"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.title),
    b: common_assets._imports_0,
    c: !$data.isLogin
  }, !$data.isLogin ? {
    d: common_vendor.o((...args) => $options.wechatLogin && $options.wechatLogin(...args))
  } : {}, {
    e: !$data.isLogin
  }, !$data.isLogin ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
