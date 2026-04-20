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

      <!-- 联系方式 -->
      <view class="section">
        <text class="section-title">联系我们</text>
        <view class="contact-list">
          <view class="contact-item" @click="makePhoneCall">
            <text class="contact-icon">📞</text>
            <text class="contact-text">客服热线: 400-123-4567</text>
          </view>
          <view class="contact-item" @click="sendEmail">
            <text class="contact-icon">📧</text>
            <text class="contact-text">邮箱: support@studentassistant.com</text>
          </view>
          <view class="contact-item" @click="openWebsite">
            <text class="contact-icon">🌐</text>
            <text class="contact-text">官网: www.studentassistant.com</text>
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

    sendEmail() {
      uni.showModal({
        title: '发送邮件',
        content: '是否要发送邮件到 support@studentassistant.com？',
        success: (res) => {
          if (res.confirm) {
            // 这里可以集成邮件发送功能
            uni.showToast({
              title: '邮件功能开发中',
              icon: 'none'
            });
          }
        }
      });
    },

    openWebsite() {
      uni.showModal({
        title: '访问官网',
        content: '是否要访问我们的官方网站？',
        success: (res) => {
          if (res.confirm) {
            // 这里可以打开网页
            uni.showToast({
              title: '网页功能开发中',
              icon: 'none'
            });
          }
        }
      });
    }
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

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F1F5F9;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item:active {
  background-color: #F8FAFC;
  border-radius: 12rpx;
}

.contact-icon {
  font-size: 28rpx;
  width: 40rpx;
}

.contact-text {
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