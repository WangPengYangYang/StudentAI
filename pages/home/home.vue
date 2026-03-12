<template>
	<view class="home-container">
		<view class="header">
			<image class="user-avatar" :src="userInfo.avatarUrl || '/static/logo.png'"></image>
			<text class="user-name">{{userInfo.nickName || '用户'}}</text>
			<text class="welcome-text">欢迎使用学生助手</text>
		</view>

		<view class="main-content">
			<view class="feature-card" @click="navigateToUserInfo">
				<text class="feature-title">留学信息统计</text>
				<text class="feature-desc">完善留学申请信息</text>
			</view>

			<view class="feature-card">
				<text class="feature-title">课程表</text>
				<text class="feature-desc">查看本周课程安排</text>
			</view>

			<view class="feature-card">
				<text class="feature-title">作业提醒</text>
				<text class="feature-desc">及时完成作业任务</text>
			</view>

			<view class="feature-card">
				<text class="feature-title">成绩查询</text>
				<text class="feature-desc">查看学习成绩</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				userInfo: {}
			}
		},
		onLoad() {
			this.loadUserInfo();
		},
		methods: {
			loadUserInfo() {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					this.userInfo = userInfo;
				} else {
					// 如果没有用户信息，跳回登录页
					uni.redirectTo({
						url: '/pages/index/index'
					});
				}
			},

			navigateToUserInfo() {
				uni.navigateTo({
					url: '/pages/user-info/user-info'
				});
			}
		}
	}
</script>

<style>
	.home-container {
		padding: 40rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		min-height: 100vh;
	}

	.header {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 60rpx;
	}

	.user-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 4rpx solid #fff;
		margin-bottom: 20rpx;
	}

	.user-name {
		font-size: 36rpx;
		color: #fff;
		font-weight: bold;
		margin-bottom: 10rpx;
	}

	.welcome-text {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.main-content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 30rpx;
	}

	.feature-card {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 20rpx;
		padding: 40rpx 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		border: 1rpx solid rgba(255, 255, 255, 0.2);
	}

	.feature-title {
		font-size: 32rpx;
		color: #fff;
		font-weight: bold;
		margin-bottom: 15rpx;
	}

	.feature-desc {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.7);
		text-align: center;
	}
</style>