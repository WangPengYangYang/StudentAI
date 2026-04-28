<template>
  <view class="profile-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <text class="nav-title">个人中心</text>
    </view>

    <scroll-view class="profile-content" scroll-y :style="{paddingBottom: safeAreaBottom}">
      <!-- 用户信息 -->
      <view class="user-content">
        <view class="user-avatar" @click="editAvatar">
          <image :src="userInfo.avatarUrl || '/static/logo.jpeg'" class="avatar-image" />
        </view>
        <view class="user-info">
          <text class="user-name" @click="editNickname">{{ userInfo.nickName || '未登录' }}</text>
          <image src="/static/edit.svg" class="edit-icon" @click="editNickname" />
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="section-title">工作区</view>
      <view class="menu-section">
        <view class="menu-item" @click="navigateTo('/pages/profile/user-profile')">
          <view class="menu-icon">👤</view>
          <text class="menu-label">用户画像</text>
          <view class="menu-arrow">›</view>
        </view>
        <view class="menu-item" @click="switchToReport">
          <view class="menu-icon">📋</view>
          <text class="menu-label">我的报告</text>
          <view class="menu-arrow">›</view>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/university/favorites')">
          <view class="menu-icon">⭐</view>
          <text class="menu-label">收藏院校</text>
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
      <view class="logout-section" @click="handleLogout">退出登录</view>
    </scroll-view>
  </view>
</template>

<script>
import { userAPI } from "@/api/index.js";

export default {
  data() {
    return {
      safeAreaBottom: '120rpx',
      userInfo: {
        nickName: '',
        avatarUrl: ''
      }
    };
  },
  onLoad() {
    this.calculateSafeArea();
  },
  onShow() {
    this.getUserInfo();
  },
  methods: {
    calculateSafeArea() {
      const { safeArea, screenHeight } = uni.getSystemInfoSync();
      if (safeArea) {
        this.safeAreaBottom = (screenHeight - safeArea.bottom + 120) + 'rpx';
      }
    },

    async getUserInfo() {
      try {
        const { code, data } = await userAPI.getUserInfo();
        if (code === 0 && data) {
          this.userInfo = {
            nickName: data.nickname || '',
            avatarUrl: data.avatar || ''
          };
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
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
            this.userInfo = { nickName: '', avatarUrl: '' };
            uni.showToast({ title: '退出成功', icon: 'success' });
            setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 1500);
          }
        }
      });
    },

    async editAvatar() {
      try {
        const avatar = await this.chooseAvatar();
        if (avatar) {
          await this.saveUserInfo({ avatar, nickname: this.userInfo.nickName });
        }
      } catch (error) {
        console.error('编辑头像失败:', error);
      }
    },

    async editNickname() {
      try {
        const nickname = await this.inputNickname();
        if (nickname) {
          await this.saveUserInfo({ nickname, avatar: this.userInfo.avatarUrl });
        }
      } catch (error) {
        console.error('编辑昵称失败:', error);
      }
    },

    chooseAvatar() {
      return new Promise((resolve) => {
        uni.showActionSheet({
          itemList: ['拍照', '从相册选择'],
          success: async (res) => {
            try {
              const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
              const { tempFilePaths } = await uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType
              });
              if (tempFilePaths && tempFilePaths.length) {
                resolve(await this.imageToBase64(tempFilePaths[0]));
              } else {
                resolve(null);
              }
            } catch (error) {
              console.error('选择头像失败:', error);
              uni.showToast({ title: '选择头像失败', icon: 'none' });
              resolve(null);
            }
          },
          fail: () => resolve(null)
        });
      });
    },

    imageToBase64(tempFilePath) {
      return new Promise((resolve) => {
        if (!uni.getFileSystemManager) {
          resolve(tempFilePath);
          return;
        }
        uni.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: 'base64',
          success: (res) => resolve('data:image/jpeg;base64,' + res.data),
          fail: () => resolve(tempFilePath)
        });
      });
    },

    inputNickname() {
      return new Promise((resolve) => {
        uni.showModal({
          title: '修改昵称',
          content: '请输入新的昵称',
          editable: true,
          placeholderText: this.userInfo.nickName || '请输入昵称',
          success: (res) => resolve(res.confirm && res.content && res.content.trim() || null)
        });
      });
    },

    async saveUserInfo(updateData) {
      const { nickname, avatar } = updateData;

      // 验证数据
      if (nickname && !nickname.trim()) {
        uni.showToast({ title: '请输入昵称', icon: 'none' });
        return;
      }

      // 检查是否有修改
      if (nickname === this.userInfo.nickName || avatar === this.userInfo.avatarUrl) {
        uni.showToast({ title: '没有修改内容', icon: 'none' });
        return;
      }

      uni.showLoading({ title: '保存中...', mask: true });

      try {
        const { code, message } = await userAPI.updateUserInfo(updateData);
        if (code === 0) {
          if (nickname) this.userInfo.nickName = nickname.trim();
          if (avatar) this.userInfo.avatarUrl = avatar;
          uni.showToast({ title: '保存成功', icon: 'success' });
        } else {
          throw new Error(message || '保存失败');
        }
      } catch (error) {
        console.error('保存用户信息失败:', error);
        uni.showToast({ title: error.message || '保存失败', icon: 'none' });
      } finally {
        uni.hideLoading();
      }
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

.nav-bar {
  background: #FFFFFF;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  padding: 32rpx 48rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
}

.profile-content {
  flex: 1;
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

.user-content {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.user-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.user-info {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 800;
  color: #191C1E;
}

.edit-icon {
  width: 24rpx;
  height: 24rpx;
}

.menu-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  margin-bottom: 32rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #F1F5F9;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:active {
  background-color: #F8FAFC;
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

.menu-arrow {
  font-size: 36rpx;
  color: #94A3B8;
  font-weight: bold;
}

.section-title {
  font-size: 34rpx;
  color: #191C1E;
  font-weight: 700;
  margin: 48rpx 0 24rpx;
  padding-left: 16rpx;
  position: relative;
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

.logout-section {
  text-align: center;
  margin: 48rpx 0;
  color: #64748B;
}
</style>