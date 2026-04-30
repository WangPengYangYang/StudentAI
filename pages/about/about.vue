<template>
  <view class="about-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <text class="nav-title">关于我们</text>
      </view>
    </view>

    <scroll-view class="about-content" scroll-y="true">
      <!-- 应用信息 -->
      <view class="app-info">
        <image src="/static/logo.gif" class="app-logo"></image>
        <text class="app-name">学生助手</text>
        <text class="app-version">版本 1.0.0</text>
      </view>

      <!-- 功能介绍 -->
      <view class="section">
        <text class="section-title">应用介绍</text>
        <view class="feature-list">
          <view class="feature-item">
            <text class="feature-icon">🎓</text>
            <text class="feature-text">专业的留学咨询服务</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">📊</text>
            <text class="feature-text">个性化院校推荐</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">📝</text>
            <text class="feature-text">申请进度管理</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">💼</text>
            <text class="feature-text">职业发展规划</text>
          </view>
        </view>
      </view>

      <!-- 版权信息 -->
      <view class="copyright">
        <text class="copyright-text">© 2025 学生助手 版权所有</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  methods: {
    makePhoneCall() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567'
      });
    },
  }
}
</script>

<style scoped>
.about-container {
  flex: 1;
  background: #F7F9FC;
  min-height: 100vh;
}

.nav-bar {
  background: #FFFFFF;
  padding: 32rpx 48rpx;
  padding-top: calc(var(--status-bar-height) + 32rpx);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.nav-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
}

.about-content {
  flex: 1;
  padding: 32rpx 24rpx;
  box-sizing: border-box;
}

.app-info {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  text-align: center;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.app-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  margin-bottom: 20rpx;
}

.app-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 8rpx;
}

.app-version {
  font-size: 24rpx;
  color: #64748B;
}

.section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 24rpx;
  display: block;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.feature-icon {
  font-size: 28rpx;
  width: 40rpx;
}

.feature-text {
  font-size: 26rpx;
  color: #475569;
}

.copyright {
  text-align: center;
  padding: 40rpx 0;
}

.copyright-text {
  font-size: 24rpx;
  color: #94A3B8;
}
</style>