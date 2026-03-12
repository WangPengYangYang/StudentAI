<template>
  <view class="content">
    <view class="title">{{title}}</view>
    <view class="sub-title">AI为你匹配最合适的院校</view>
    <image class="logo" src="/static/logo.gif"></image>
    <button v-if="!isLogin" class="login-btn" type="primary" @click="wechatLogin">微信一键登录</button>
    <view v-if="!isLogin" class="login-tips">
      <text>我们将获取你的昵称与头像，用于方案多端同步与跨设备使用</text>
    </view>
  </view>
</template>

<script>
	export default {
		data() {
			return {
				title: '留学选校助手',
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
				const token = uni.getStorageSync('userToken');
				const userInfo = uni.getStorageSync('userInfo');
				if (token && userInfo) {
					// 如果已登录，直接跳转到主页
					uni.redirectTo({
						url: '/pages/home/home'
					});
				}
			},

			// 微信登录
			wechatLogin() {
				uni.showLoading({
					title: '登录中...'
				});

				// 微信登录授权
				uni.login({
					provider: 'weixin',
					success: (loginRes) => {
						console.log('微信登录成功', loginRes);
						this.getUserInfo();
					},
					fail: (err) => {
						console.log('微信登录失败', err);
						uni.hideLoading();
						uni.showToast({
							title: '登录失败',
							icon: 'none'
						});
					}
				});
			},

			// 获取用户信息
			getUserInfo() {
				uni.getUserInfo({
					provider: 'weixin',
					success: (infoRes) => {
						console.log('用户信息', infoRes);
						this.loginSuccess(infoRes.userInfo);
					},
					fail: (err) => {
						console.log('获取用户信息失败', err);
						uni.hideLoading();
						uni.showToast({
							title: '获取用户信息失败',
							icon: 'none'
						});
					}
				});
			},

			// 登录成功处理
			loginSuccess(userInfo) {
				// 存储用户信息
				uni.setStorageSync('userInfo', userInfo);
				uni.setStorageSync('userToken', 'wx_token_' + Date.now());

				uni.hideLoading();
				uni.showToast({
					title: '登录成功'
				});

				// 跳转到主页
				uni.redirectTo({
					url: '/pages/home/home'
				});
			}
		}
	}
</script>

<style>
  .login-container {
    position: relative;
  }
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
    padding-top: 40%;
    width: 100%;
	}

	.logo {
		height: 200rpx;
    width: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 100rpx;
    border-radius: 20rpx;
	}
	.title {
		font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 24rpx;
	}
  .sub-title{
    font-size: 28rpx;
    color: #999;
    margin-bottom: 80rpx;
  }

	.login-btn {
		width: 300rpx;
	}

	.login-tips {
		margin-top: 20rpx;
		text-align: center;
	}

	.login-tips text {
		font-size: 24rpx;
		color: #999;
		line-height: 1.5;
	}
</style>