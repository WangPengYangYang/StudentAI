<template>
  <view class="profile-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <text class="nav-title">个人中心</text>
      </view>
    </view>

    <scroll-view class="profile-content" scroll-y="true" :style="{paddingBottom: safeAreaBottom}">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-avatar">
          <image :src="userInfo.avatarUrl || '/static/logo.jpeg'" class="avatar-image"></image>
          <view class="avatar-badge">{{ userInfo.completion_rate }}%</view>
        </view>
        <view class="user-info">
          <text class="user-name">{{ userInfo.nickName || '未登录' }}</text>
          <text class="user-email">{{ userInfo.email || 'test@example.com' }}</text>
          <view class="user-progress">
            <view class="progress-bar">
              <view class="progress-fill" :style="{width: userInfo.completion_rate + '%'}"></view>
            </view>
            <text class="progress-text">个人资料完成度 {{ userInfo.completion_rate }}%</text>
          </view>
        </view>
        <view class="edit-button" @click="navigateTo('/pages/profile/create-profile')">✏️</view>
      </view>

      <!-- 预约咨询功能入口 -->
      <view class="consultation-card" @click="navigateTo('/pages/consultation/consultation')">
        <view class="consultation-content">
          <view class="menu-icon">⏰</view>
          <view class="consultation-info">
            <text class="consultation-title">预约 1对1 咨询</text>
            <text class="consultation-desc">专业留学顾问为您提供个性化指导</text>
          </view>
          <view class="consultation-arrow">›</view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="section-title">工作区</view>
      <view class="menu-section">
        <view class="menu-item" @click="navigateTo('/pages/report/report')">
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
        <view class="menu-item" @click="contactSupport">
          <view class="menu-icon">📞</view>
          <text class="menu-label">联系客服</text>
          <view class="menu-arrow">›</view>
        </view>
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
import { profileAPI, userAPI } from "@/api/index.js";

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

    contactSupport() {
      uni.makePhoneCall({ phoneNumber: '400-123-4567' });
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
    }
  }
}
</script>

<style>
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
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  padding: 32rpx 24rpx;
  box-sizing: border-box;
}

/* 安全区域适配 */
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
}

/* 用户信息卡片 */
.user-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 107, 92, 0.08);
  border: 1rpx solid rgba(0, 107, 92, 0.1);
  box-sizing: border-box;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 9999rpx;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 9999rpx;
}

.avatar-badge {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  background: linear-gradient(145deg, #00BFA5 0%, #006B5C 100%);
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: 800;
  padding: 4rpx 12rpx;
  border-radius: 9999rpx;
  border: 2rpx solid #FFFFFF;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 800;
  color: #191C1E;
  font-family: 'WenQuanYi Zen Hei';
}

.user-email {
  font-size: 24rpx;
  color: #64748B;
  font-weight: 500;
}

.user-progress {
  margin-top: 8rpx;
}

.progress-bar {
  width: 100%;
  height: 6rpx;
  background: #F1F5F9;
  border-radius: 9999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00BFA5 0%, #006B5C 100%);
  border-radius: 9999rpx;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 22rpx;
  color: #64748B;
  margin-top: 6rpx;
  font-weight: 500;
}

.edit-button {
  font-size: 28rpx;
  color: #006B5C;
  padding: 12rpx;
  background: rgba(0, 107, 92, 0.1);
  border-radius: 9999rpx;
  transition: all 0.2s ease;
}

.edit-button:active {
  background: rgba(0, 107, 92, 0.2);
  transform: scale(0.95);
}

/* 功能菜单 */
.menu-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #F1F5F9;
  transition: background-color 0.2s ease;
}

.menu-item:active {
  background-color: #F8FAFC;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  width: 40rpx;
  text-align: center;
  color: #006B5C;
}

.menu-label {
  flex: 1;
  font-size: 28rpx;
  color: #191C1E;
  font-weight: 600;
}

.menu-badge {
  background: #FF4444;
  color: #FFFFFF;
  font-size: 22rpx;
  font-weight: 700;
  padding: 4rpx 12rpx;
  border-radius: 9999rpx;
  margin-right: 12rpx;
}

.menu-arrow {
  font-size: 32rpx;
  color: #94A3B8;
  font-weight: bold;
}

.consultation-card {
  background: linear-gradient(145deg, rgba(0, 107, 92, 0.35) 0%, rgba(0, 191, 165, 0.35) 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  box-sizing: border-box;
  margin: 24rpx 0;
  box-shadow: 0 8rpx 32rpx rgba(0, 107, 92, 0.08);
  border: 1rpx solid rgba(0, 107, 92, 0.1);
  transition: all 0.3s ease;
}

.consultation-card:active {
  transform: scale(0.98);
  background: #F8FAFC;
}

.consultation-content {
  display: flex;
  align-items: center;
  gap: 20rpx;
}
.consultation-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.consultation-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #191C1E;
  font-family: 'WenQuanYi Zen Hei';
}

.consultation-desc {
  font-size: 24rpx;
  color: #64748B;
  font-weight: 500;
}

.consultation-arrow {
  font-size: 36rpx;
  color: #94A3B8;
  font-weight: bold;
}
.section-title {
  font-size: 32rpx;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 24rpx;
}

.logout-button {
  background: transparent;
  color: #64748B;
  border: 1rpx solid #E2E8F0;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 26rpx;
  font-weight: 500;
  text-align: center;
  width: 100%;
  transition: all 0.2s ease;
}

.logout-button:active {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

</style>