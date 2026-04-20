<template>
  <view class="login-container">
    <!-- 浮动背景装饰 -->
    <view class="floating-bg-decor"></view>
    <view class="overlay-blur"></view>

    <view class="content">
      <!-- Logo区域 -->
      <view class="logo-section">
        <image class="logo" src="/static/logo.jpeg"></image>
        <view class="logo-divider"></view>
        <view class="brand-name">Scholar AI</view>
        <view class="logo-divider"></view>
      </view>

      <!-- 标题区域 -->
      <view class="typography-section">
        <view class="heading">
          <text>预见你的</text>
          <text>全球名校之旅</text>
        </view>
        <view class="subtitle">
          <text>基于 AI 深度匹配</text>
          <text>精准定位你的学术未来</text>
        </view>
      </view>

      <!-- 特性网格 -->
      <view class="features-grid">
        <view class="feature-card">
          <view class="feature-icon">🌍</view>
          <text class="feature-text">全球资源</text>
        </view>
        <view class="feature-card">
          <view class="feature-icon">🔒</view>
          <text class="feature-text">安全保障</text>
        </view>
      </view>

      <!-- 用户协议 -->
      <view class="agreement-section">
        <label class="agreement-checkbox">
          <checkbox value="agree" checked />
          <text class="agreement-text">我已阅读并同意 用户协议 和 隐私政策</text>
        </label>
      </view>

      <!-- 登录按钮区域 -->
      <view class="action-section">
        <button class="login-btn wechat-btn" @click="wechatLogin">
          <text>微信一键登录</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
	import api from '../../api/index.js'

	export default {
		data() {
			return {
				isLogin: false,
				userInfo: {}
			}
		},
		onLoad() {
      uni.reLaunch({
        url: '/pages/home/home'
      });
		//	this.checkLoginStatus();
		},
		methods: {
			// 检查登录状态
			checkLoginStatus() {
				const token = uni.getStorageSync('access_token');
				const userInfo = uni.getStorageSync('userInfo');
				if (token && userInfo) {
					this.isLogin = true;
					// 如果已登录，直接跳转到主页
					uni.redirectTo({
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
					// 微信登录授权获取code
					const loginRes = await new Promise((resolve, reject) => {
						uni.login({
							provider: 'weixin',
							success: resolve,
							fail: reject
						});
					});
					console.log('微信登录code获取成功', loginRes.code);
          // 获取用户信息
          uni.getUserProfile({
            provider: 'weixin',
            success: (userRes) => {
              console.log(userRes);
              uni.hideLoading();

              // 保存用户信息
              const userInfo = {
                nickName: userRes.userInfo.nickName,
                avatarUrl: userRes.userInfo.avatarUrl,
                email: userRes.userInfo.email || 'user@scholarai.com'
              };
              // 存储到本地
              uni.setStorageSync('userInfo', userInfo);
            },
            fail: (err) => {
              console.log(err);
              }
          });

					// 调用后端微信登录接口
					const result = await api.auth.wechatLogin(loginRes.code);
					console.log('后端授权成功', result);

					// 登录成功处理
					this.loginSuccess(result.data);

				} catch (error) {
					console.log('微信登录失败', error);
					uni.hideLoading();
					uni.showToast({
						title: api.utils.getErrorMessage(error),
						icon: 'none'
					});
				}
			},

			// 登录成功处理
			loginSuccess(authData) {
				// 存储认证信息
				uni.setStorageSync('access_token', authData.access_token);
				uni.setStorageSync('refresh_token', authData.refresh_token || '');
				uni.setStorageSync('userInfo', authData.user || {});

				// 如果是匿名登录，存储session_id
				if (authData.session_id) {
					uni.setStorageSync('session_id', authData.session_id);
				}

				uni.hideLoading();
				uni.showToast({
					title: '登录成功'
				});

				// 跳转到首页
				uni.reLaunch({
					url: '/pages/home/home'
				});
			}
		}
	}
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.floating-bg-decor {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 400rpx;
  height: 400rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999rpx;
  backdrop-filter: blur(10px);
}

.overlay-blur {
  position: absolute;
  bottom: -200rpx;
  left: -200rpx;
  width: 600rpx;
  height: 600rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 9999rpx;
  backdrop-filter: blur(15px);
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 48rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  margin-bottom: 32rpx;
}

.logo-divider {
  width: 40rpx;
  height: 2rpx;
  background: rgba(255, 255, 255, 0.3);
  margin: 16rpx 0;
}

.brand-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 1rpx;
}

.typography-section {
  text-align: center;
  margin-bottom: 60rpx;
}

.heading {
  margin-bottom: 24rpx;
}

.heading text {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.4;
}

.subtitle {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.subtitle text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
}

.features-grid {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin-bottom: 48rpx;
  width: 100%;
}

.feature-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  min-width: 200rpx;
}

.feature-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

.agreement-section {
  margin-bottom: 60rpx;
  width: 100%;
}

.agreement-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.agreement-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 16rpx;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
}

.login-btn {
  height: 96rpx;
  border-radius: 24rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.login-btn:active {
  transform: translateY(2rpx);
}

.wechat-btn {
  background: linear-gradient(135deg, #07C160 0%, #05A150 100%);
  color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
}

/* 响应式设计 */
@media (min-width: 768px) {
  .content {
    padding: 160rpx 96rpx;
  }

  .features-grid {
    gap: 32rpx;
  }

  .feature-card {
    min-width: 240rpx;
    padding: 40rpx;
  }
}

/* 安全区域适配 */
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>