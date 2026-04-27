<template>
  <view class="profile-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <text class="nav-title">个人中心</text>
      </view>
    </view>

    <scroll-view class="profile-content" scroll-y="true" :style="{paddingBottom: safeAreaBottom}">
      <!-- 用户信息卡片 - 最高层级 -->
      <view class="user-card">
        <view class="user-card-bg"></view>
        <view class="user-content">
          <view class="user-avatar">
            <image :src="userInfo.avatarUrl || '/static/logo.jpeg'" class="avatar-image"></image>
          </view>
          <view class="user-info">
            <text class="user-name">{{ userInfo.nickName || '未登录' }}</text>
            <text class="user-email">{{ userInfo.email || 'test@example.com' }}</text>
            <view class="user-progress">
              <view class="progress-bar">
                <view class="progress-fill" :style="{width: userInfo.completion_rate + '%'}"></view>
              </view>
              <text class="progress-text">个人资料完成度 {{ userInfo.completion_rate }}%</text>
              <image src="/static/edit.svg" class="edit-icon" @click="navigateTo('/pages/profile/create-profile')"></image>
            </view>
          </view>
        </view>
      </view>

      <!-- 生成选校方案按钮 -->
      <view class="school-plan-card" :class="{'disabled': userInfo.completion_rate < 100}" @click="generateSchoolPlan">
        <view class="plan-content">
          <view class="plan-icon-wrapper">
            <view class="plan-icon">🎓</view>
            <view class="plan-badge" v-if="userInfo.completion_rate === 100">READY</view>
          </view>
          <view class="plan-info">
            <text class="plan-title">生成选校方案</text>
            <text class="plan-desc" v-if="userInfo.completion_rate === 100">基于您的完整资料，为您推荐最适合的院校</text>
            <text class="plan-desc" v-else>资料完成度 {{userInfo.completion_rate}}%，完成资料后可生成个性化方案</text>
            <view class="plan-tag" v-if="userInfo.completion_rate === 100">立即生成</view>
            <view class="plan-tag disabled" v-else>资料未完成</view>
          </view>
          <view class="plan-arrow" v-if="userInfo.completion_rate === 100">›</view>
          <view class="plan-lock" v-else>🔒</view>
        </view>
      </view>

      <!-- 预约咨询功能入口 -->
<!--      <view class="consultation-card" @click="navigateTo('/pages/consultation/consultation')">-->
<!--        <view class="consultation-content">-->
<!--          <view class="consultation-icon-wrapper">-->
<!--            <view class="consultation-icon">⏰</view>-->
<!--            <view class="consultation-badge">NEW</view>-->
<!--          </view>-->
<!--          <view class="consultation-info">-->
<!--            <text class="consultation-title">预约 1对1 咨询</text>-->
<!--            <text class="consultation-desc">专业留学顾问为您提供个性化指导</text>-->
<!--            <view class="consultation-tag">立即预约</view>-->
<!--          </view>-->
<!--          <view class="consultation-arrow">›</view>-->
<!--        </view>-->
<!--      </view>-->

      <!-- 功能菜单 -->
      <view class="section-title">工作区</view>
      <view class="menu-section">
        <view class="menu-item" @click="switchToReport()">
          <view class="menu-icon">📋</view>
          <text class="menu-label">我的报告</text>
          <view class="menu-arrow">›</view>
        </view>

        <view class="menu-item" @click="navigateTo('/pages/report/report')">
          <view class="menu-icon">⭐</view>
          <text class="menu-label">收藏院校</text>
          <view class="menu-badge">12</view>
          <view class="menu-arrow">›</view>
        </view>
      </view>

      <!-- 帮助与支持 -->
      <view class="section-title">支持与帮助</view>
      <view class="menu-section">
        <view class="menu-item" @click="navigateTo('/pages/feedback/feedback')">
          <view class="menu-icon">💬</view>
          <text class="menu-label">意见反馈</text>
          <view class="menu-arrow">›</view>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/about/about')">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-label">关于我们</text>
          <view class="menu-arrow">›</view>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-section">
        <button class="logout-button" @click="handleLogout">退出登录</button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { profileAPI, userAPI, reportAPI } from "@/api/index.js";

export default {
  data() {
    return {
      safeAreaBottom: '120rpx',
      userInfo: {
        nickName: '',
        avatarUrl: '',
        email: '',
        completion_rate: 0
      },
      profileCompletion: {
        completed_steps: 0,
        total_steps: 4,
        completion_rate: 0
      }
    };
  },
  onLoad() {
    this.calculateSafeArea();
  },
  onShow() {
    // 页面显示时只重新获取用户信息，资料完成度在onLoad中已获取
    this.getUserInfo();
    this.getProfileCompletion();
  },
  methods: {
    calculateSafeArea() {
      const systemInfo = uni.getSystemInfoSync();
      const safeArea = systemInfo.safeArea;
      if (safeArea) {
        const bottom = systemInfo.screenHeight - safeArea.bottom;
        this.safeAreaBottom = bottom + 120 + 'rpx';
      }
    },

    async getUserInfo() {
      try {
        const response = await userAPI.getUserInfo();
        if (response.code === 0 && response.data) {
          const userData = response.data;
          this.userInfo = {
            nickName: userData.nickname || this.userInfo.nickName,
            avatarUrl: userData.avatar || this.userInfo.avatarUrl,
            email: this.userInfo.email
          };
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    },
    // 获取用户资料完成度
    async getProfileCompletion() {
  try {
    const response = await profileAPI.getCompletion();
    if (response.code === 0 && response.data) {
      this.userInfo.completion_rate = response.data.completion_rate || 0;
    } else {
      console.error('获取资料完成度失败:', response.message);
      uni.showToast({ title: '获取资料完成度失败', icon: 'none' });
    }
  } catch (error) {
    console.error('获取资料完成度异常:', error);
    uni.showToast({ title: '网络请求失败，请检查网络连接', icon: 'none' });
  }
},

    navigateTo(url) {
      uni.navigateTo({ url });
    },

    switchToReport() {
      uni.switchTab({ url: '/pages/report/report' });
    },

    handleLogout() {
      uni.showModal({
        title: '确认退出',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('userToken');
            uni.removeStorageSync('userInfo');
            this.userInfo = { nickName: '', avatarUrl: '', email: '', completion_rate: 0 };

            uni.showToast({ title: '退出成功', icon: 'success' });
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/index/index' });
            }, 1500);
          }
        }
      });
    },

    // 生成选校方案
    generateSchoolPlan() {
      // 先存储快捷消息
      uni.setStorageSync('quickMessage', '请基于我的个人背景，帮我生成一份选校方案');

      // 然后跳转到对话页面（tabbar页面需要使用switchTab）
      uni.switchTab({
        url: '/pages/chat/chat'
      });
    }
  }
}
</script>

<style scoped>
.profile-container {
  flex: 1;
  background: linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 100%);
  min-height: 100vh;
}

/* 导航栏样式 */
.nav-bar {
  background: #FFFFFF;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  padding: 32rpx 48rpx;
  backdrop-filter: blur(20rpx);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
  font-family: 'WenQuanYi Zen Hei';
}

/* 内容区域 */
.profile-content {
  flex: 1;
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

/* 安全区域适配 */
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 用户信息卡片 - 最高层级 */
.user-card {
  position: relative;
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border-radius: 32rpx;
  padding: 40rpx 32rpx;
  margin: 32rpx 0 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 107, 92, 0.18);
  border: 1rpx solid rgba(0, 191, 165, 0.3);
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 12rpx 40rpx rgba(0, 107, 92, 0.12);
}

.user-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 191, 165, 0.05) 0%, rgba(0, 107, 92, 0.05) 100%);
}

.user-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.user-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 9999rpx;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 9999rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 800;
  color: #191C1E;
  font-family: 'WenQuanYi Zen Hei';
  letter-spacing: 0.5rpx;
}

.user-email {
  font-size: 26rpx;
  color: #64748B;
  font-weight: 500;
}

.user-progress {
  margin-top: 12rpx;
}

.progress-bar {
  width: 100%;
  height: 8rpx;
  background: #F1F5F9;
  border-radius: 9999rpx;
  overflow: hidden;
  box-shadow: inset 0 1rpx 3rpx rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00BFA5 0%, #006B5C 100%);
  border-radius: 9999rpx;
  transition: width 0.3s ease;
  box-shadow: 0 0 8rpx rgba(0, 191, 165, 0.3);
}

.progress-text {
  font-size: 24rpx;
  color: #64748B;
  margin-top: 8rpx;
  font-weight: 500;
}


.edit-icon {
  margin-left: 32rpx;
  margin-top: 24rpx;
  width: 24rpx;
  height: 24rpx;
}

/* 主要功能卡片区域 */
.main-cards-section {
  margin: 32rpx 0;
}

/* 生成选校方案卡片 - 中等层级 */
.school-plan-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border-radius: 28rpx;
  padding: 36rpx;
  box-sizing: border-box;
  margin: 0 0 24rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 191, 165, 0.12);
  border: 1rpx solid rgba(0, 191, 165, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.school-plan-card:not(.disabled):active {
  transform: translateY(2rpx);
  box-shadow: 0 6rpx 24rpx rgba(0, 191, 165, 0.15);
}

/* 禁用状态样式 */
.school-plan-card.disabled {
  background: linear-gradient(135deg, #F8F9FA 0%, #F1F3F4 100%);
  border: 1rpx solid rgba(158, 158, 158, 0.2);
  box-shadow: 0 8rpx 32rpx rgba(158, 158, 158, 0.08);
  opacity: 0.7;
}

.school-plan-card.disabled .plan-title {
  color: #9E9E9E;
}

.school-plan-card.disabled .plan-desc {
  color: #BDBDBD;
}

.school-plan-card.disabled .plan-arrow,
.school-plan-card.disabled .plan-lock {
  color: #9E9E9E;
}

.plan-content {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.plan-icon {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #00BFA5 0%, #006B5C 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #FFFFFF;
  box-shadow: 0 6rpx 16rpx rgba(0, 191, 165, 0.4);
}

.plan-icon-wrapper {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
}

.plan-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  background: #00BFA5;
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: 800;
  padding: 4rpx 12rpx;
  border-radius: 9999rpx;
  line-height: 1;
  transform: scale(0.9);
  border: 2rpx solid #FFFFFF;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
}

.plan-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.plan-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #191C1E;
  font-family: 'WenQuanYi Zen Hei';
  letter-spacing: 0.5rpx;
}

.plan-desc {
  font-size: 26rpx;
  color: #64748B;
  font-weight: 500;
  line-height: 1.4;
}

.plan-tag {
  background: linear-gradient(135deg, rgba(0, 191, 165, 0.1) 0%, rgba(0, 107, 92, 0.1) 100%);
  color: #00BFA5;
  font-size: 22rpx;
  font-weight: 700;
  padding: 6rpx 16rpx;
  border-radius: 9999rpx;
  align-self: flex-start;
  margin-top: 6rpx;
  border: 1rpx solid rgba(0, 191, 165, 0.2);
}

.plan-tag.disabled {
  background: rgba(158, 158, 158, 0.1);
  color: #9E9E9E;
  border: 1rpx solid rgba(158, 158, 158, 0.2);
}

.plan-arrow {
  font-size: 40rpx;
  color: #00BFA5;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.school-plan-card:not(.disabled):active .plan-arrow {
  transform: translateX(4rpx);
}

/* 预约咨询卡片 - 中等层级 */
.consultation-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border-radius: 28rpx;
  padding: 36rpx;
  box-sizing: border-box;
  margin: 0 0 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 107, 92, 0.12);
  border: 1rpx solid rgba(0, 191, 165, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.consultation-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 6rpx 24rpx rgba(0, 107, 92, 0.15);
}

.consultation-content {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.consultation-icon-wrapper {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  flex-shrink: 0;
}

.consultation-icon {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #00BFA5 0%, #006B5C 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #FFFFFF;
  box-shadow: 0 6rpx 16rpx rgba(0, 191, 165, 0.4);
}

.consultation-badge {
  position: absolute;
  top: -6rpx;
  right: -6rpx;
  background: #FF4444;
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: 800;
  padding: 4rpx 12rpx;
  border-radius: 9999rpx;
  line-height: 1;
  transform: scale(0.9);
  border: 2rpx solid #FFFFFF;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
}

.consultation-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.consultation-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #191C1E;
  font-family: 'WenQuanYi Zen Hei';
  letter-spacing: 0.5rpx;
}

.consultation-desc {
  font-size: 26rpx;
  color: #64748B;
  font-weight: 500;
  line-height: 1.4;
}

.consultation-tag {
  background: linear-gradient(135deg, rgba(0, 191, 165, 0.1) 0%, rgba(0, 107, 92, 0.1) 100%);
  color: #00BFA5;
  font-size: 22rpx;
  font-weight: 700;
  padding: 6rpx 16rpx;
  border-radius: 9999rpx;
  align-self: flex-start;
  margin-top: 6rpx;
  border: 1rpx solid rgba(0, 191, 165, 0.2);
}

.consultation-arrow {
  font-size: 40rpx;
  color: #00BFA5;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.consultation-card:active .consultation-arrow {
  transform: translateX(4rpx);
}

/* 功能菜单区域 */
.menu-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #F1F5F9;
  transition: background-color 0.2s ease;
  position: relative;
}

.menu-item:active {
  background-color: #F8FAFC;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
  width: 44rpx;
  text-align: center;
  color: #006B5C;
}

.menu-label {
  flex: 1;
  font-size: 30rpx;
  color: #191C1E;
  font-weight: 600;
}

.menu-badge {
  background: #FF4444;
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 700;
  padding: 6rpx 14rpx;
  border-radius: 9999rpx;
  margin-right: 16rpx;
  border: 2rpx solid #FFFFFF;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
}

.menu-arrow {
  font-size: 36rpx;
  color: #94A3B8;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.menu-item:active .menu-arrow {
  transform: translateX(4rpx);
}

/* 区域标题 */
.section-title {
  font-size: 34rpx;
  color: #191C1E;
  font-weight: 700;
  margin: 48rpx 0 24rpx;
  font-family: 'WenQuanYi Zen Hei';
  letter-spacing: 0.5rpx;
  position: relative;
  padding-left: 16rpx;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6rpx;
  height: 24rpx;
  background: linear-gradient(135deg, #00BFA5 0%, #006B5C 100%);
  border-radius: 9999rpx;
}

/* 退出登录区域 */
.logout-section {
  margin: 48rpx 0;
}

.logout-button {
  background: transparent;
  color: #64748B;
  border: 1rpx solid #E2E8F0;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  text-align: center;
  width: 100%;
  transition: all 0.2s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.logout-button:active {
  background: #F8FAFC;
  border-color: #CBD5E1;
  transform: translateY(1rpx);
}

</style>