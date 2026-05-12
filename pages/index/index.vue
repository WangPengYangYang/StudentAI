<template>
  <view class="login-container">
    <view class="content">
      <!-- Logo和品牌 -->
      <view class="logo-section">
        <image class="logo" src="/static/logo.jpeg"></image>
        <text class="brand-name">Scholar AI</text>
        <text class="brand-slogan">智能选校助手</text>
      </view>

      <!-- 用户协议 -->
      <view class="agreement-section">
        <label class="agreement-checkbox">
          <checkbox value="agree" checked />
          <text class="agreement-text">登录即表示同意<text class="link">用户协议</text>和<text class="link">隐私政策</text></text>
        </label>
      </view>

      <!-- 登录按钮 -->
      <button class="login-btn" @click="wechatLogin">
        <text>微信一键登录</text>
      </button>
    </view>
  </view>
</template>

<script>
import {apiUtils, authAPI} from '../../api/index.js'

export default {
  data() {
    return {
      isLogin: false,
      userInfo: {}
    }
  },
  onLoad() {
    this.checkLoginStatus();
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = uni.getStorageSync('access_token');
      if (token) {
        this.isLogin = true;
        uni.reLaunch({
          url: '/pages/home/home'
        });
      }
    },

    // 微信登录
    async wechatLogin() {
      uni.showLoading({
        title: '登录中...'
      });

      try {
        const loginRes = await new Promise((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: resolve,
            fail: reject
          });
        });
        console.log('微信登录code获取成功', loginRes.code);

        const result = await authAPI.wechatLogin(loginRes.code);
        console.log('后端授权成功', result);

        this.loginSuccess(result.data);

      } catch (error) {
        console.log('微信登录失败', error);
        uni.hideLoading();
        uni.showToast({
          title: apiUtils.getErrorMessage(error),
          icon: 'none'
        });
      }
    },

    // 登录成功处理
    loginSuccess(authData) {
      uni.setStorageSync('access_token', authData.access_token);
      uni.setStorageSync('refresh_token', authData.refresh_token || '');
      uni.setStorageSync('userInfo', authData.user || {});

      uni.hideLoading();
      uni.showToast({
        title: '登录成功'
      });

      uni.reLaunch({
        url: '/pages/home/home'
      });
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64rpx 48rpx;
  width: 100%;
  max-width: 600rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.brand-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12rpx;
  letter-spacing: 2rpx;
}

.brand-slogan {
  font-size: 28rpx;
  color: #64748b;
  font-weight: 400;
}

.agreement-section {
  margin-bottom: 40rpx;
  width: 100%;
}

.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.agreement-text {
  font-size: 24rpx;
  color: #94a3b8;
  margin-left: 12rpx;
  line-height: 1.5;
}

.link {
  color: #64748b;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  background: #07C160;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.25);
}

.login-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}

/* 安全区域适配 */
.login-container {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>