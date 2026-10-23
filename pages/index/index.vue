<template>
  <view class="login-container">
    <view class="content">
      <!-- Logo和品牌 -->
      <view class="logo-section">
        <view class="logo-container">
          <view class="logo-glow"></view>
          <image class="logo" src="/static/logo.gif"></image>
        </view>
        <text class="brand-name">Scholar AI</text>
        <text class="brand-slogan">智能选校助手</text>
      </view>

      <!-- 用户协议与隐私政策 -->
      <view class="agreement-section">
        <view class="agreement-inner">
          <view
            class="agreement-checkbox"
            :class="{ 'agreement-checkbox--checked': agreed }"
            @click="toggleAgree"
          >
            <text v-if="agreed" class="agreement-checkbox__tick">✓</text>
          </view>
          <view class="agreement-lines" @click="toggleAgree">
            <text class="agreement-text">我已阅读并同意</text>
            <view class="agreement-links">
              <text class="link" @click.stop="openDoc('user')">《用户协议》</text>
              <text class="agreement-text">和</text>
              <text class="link" @click.stop="openDoc('privacy')">《隐私政策》</text>
            </view>
          </view>
        </view>
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
      userInfo: {},
      // 是否已勾选同意协议。默认 false——用户必须主动勾选，
      // 不得默认勾选或"登录即视为同意"（违反微信"不得强制授权才能进入"规则）
      agreed: false
    }
  },
  onLoad() {
    this.checkLoginStatus();
  },
  methods: {
    // 切换协议勾选状态
    toggleAgree() {
      this.agreed = !this.agreed;
    },

    // 打开协议页面
    openDoc(type) {
      uni.navigateTo({
        url: `/pages/agreement/agreement?type=${type}`
      });
    },

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
      // 未勾选协议时不允许登录
      if (!this.agreed) {
        uni.showToast({
          title: '请先阅读并同意用户协议和隐私政策',
          icon: 'none'
        });
        return;
      }

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

.logo-container {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 旋转渐变发光环 */
.logo-glow {
  position: absolute;
  top: -12rpx;
  left: -12rpx;
  right: -12rpx;
  bottom: -12rpx;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
  border-radius: 9999rpx;
  opacity: 0.85;
  animation: rotateGlow 3s linear infinite;
  z-index: 0;
  filter: blur(2rpx);
}

/* 外层柔光呼吸 */
.logo-container::after {
  content: '';
  position: absolute;
  top: -40rpx;
  left: -40rpx;
  right: -40rpx;
  bottom: -40rpx;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.35) 0%, transparent 70%);
  border-radius: 50%;
  z-index: -1;
  animation: breathGlow 2.4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes rotateGlow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes breathGlow {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.08); }
}

.logo {
  position: relative;
  z-index: 1;
  width: 160rpx;
  height: 160rpx;
  border-radius: 9999rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.35);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

/* 勾选框与文字左右排列，文字区自身换行，避免五个元素挤在一行 */
.agreement-inner {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  padding: 0 20rpx;
}

/* 自绘勾选框：默认未选中，用户点击后才打勾 */
.agreement-checkbox {
  width: 30rpx;
  height: 30rpx;
  flex-shrink: 0;
  margin-right: 10rpx;
  margin-top: 6rpx;
  border: 2rpx solid #cbd5e1;
  border-radius: 6rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.agreement-checkbox--checked {
  background-color: #07C160;
  border-color: #07C160;
}

.agreement-checkbox__tick {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: bold;
  line-height: 1;
}

/* 文字区：纵向排列，第二行放两份协议 */
.agreement-lines {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.agreement-text {
  font-size: 24rpx;
  color: #94a3b8;
  line-height: 1.6;
}

.agreement-links {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.link {
  font-size: 24rpx;
  color: #07C160;
  line-height: 1.6;
  margin: 0 2rpx;
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