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
      <view class="user-content">
        <view class="user-avatar" @click="editAvatar">
          <image :src="userInfo.avatarUrl || '/static/logo.jpeg'" class="avatar-image"></image>
        </view>
        <view class="user-info">
          <text class="user-name" @click="editNickname">{{ userInfo.nickName || '未登录' }}</text>
          <image src="/static/edit.svg" class="edit-icon" @click="editNickname"></image>
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
        <view class="menu-item" @click="navigateTo('/pages/profile/user-profile')">
          <view class="menu-icon">👤</view>
          <text class="menu-label">用户画像</text>
          <view class="menu-arrow">›</view>
        </view>

        <view class="menu-item" @click="switchToReport()">
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
            this.userInfo = { nickName: '', avatarUrl: ''};

            uni.showToast({ title: '退出成功', icon: 'success' });
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/index/index' });
            }, 1500);
          }
        }
      });
    },

    // 编辑头像
    async editAvatar() {
      try {
        // 选择头像
        const avatarRes = await this.chooseAvatar();
        if (!avatarRes) return; // 用户取消了头像选择

        // 保存头像时带上当前昵称
        await this.saveUserInfo({
          avatar: avatarRes,
          nickname: this.userInfo.nickName
        });
      } catch (error) {
        console.error('编辑头像失败:', error);
      }
    },

    // 编辑昵称
    async editNickname() {
      try {
        // 输入昵称
        const nicknameRes = await this.inputNickname();
        if (!nicknameRes) return; // 用户取消了昵称输入

        // 保存昵称时带上当前头像
        await this.saveUserInfo({
          nickname: nicknameRes,
          avatar: this.userInfo.avatarUrl
        });
      } catch (error) {
        console.error('编辑昵称失败:', error);
      }
    },

    // 选择头像
    chooseAvatar() {
      return new Promise((resolve) => {
        uni.showActionSheet({
          itemList: ['拍照', '从相册选择'],
          success: async (res) => {
            try {
              const sourceType = res.tapIndex === 0 ? ['camera'] : ['album'];
              const imageRes = await uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: sourceType
              });

              if (imageRes.tempFilePaths && imageRes.tempFilePaths.length > 0) {
                const tempFilePath = imageRes.tempFilePaths[0];
                const base64 = await this.imageToBase64(tempFilePath);
                resolve(base64);
              } else {
                resolve(null);
              }
            } catch (error) {
              console.error('选择头像失败:', error);
              uni.showToast({
                title: '选择头像失败',
                icon: 'none'
              });
              resolve(null);
            }
          },
          fail: () => {
            resolve(null);
          }
        });
      });
    },

    // 图片转base64
    imageToBase64(tempFilePath) {
      return new Promise((resolve, reject) => {
        // 在uni-app中，可以直接使用临时路径，但为了兼容base64格式，我们使用uni API
        // 如果uni.getFileSystemManager不存在，则直接使用临时路径
        if (uni.getFileSystemManager) {
          uni.getFileSystemManager().readFile({
            filePath: tempFilePath,
            encoding: 'base64',
            success: (res) => {
              resolve('data:image/jpeg;base64,' + res.data);
            },
            fail: (error) => {
              // 如果转换失败，直接使用临时路径
              console.warn('base64转换失败，使用临时路径:', error);
              resolve(tempFilePath);
            }
          });
        } else {
          // 不支持文件系统API的环境，直接使用临时路径
          resolve(tempFilePath);
        }
      });
    },

    // 输入昵称
    inputNickname() {
      return new Promise((resolve) => {
        uni.showModal({
          title: '修改昵称',
          content: '请输入新的昵称',
          editable: true,
          placeholderText: this.userInfo.nickName || '请输入昵称',
          success: (res) => {
            if (res.confirm && res.content) {
              resolve(res.content.trim());
            } else {
              resolve(null);
            }
          }
        });
      });
    },

    // 确认保存
    confirmSave(type = '用户信息') {
      return new Promise((resolve) => {
        uni.showModal({
          title: '确认保存',
          content: `确定要保存修改的${type}吗？`,
          success: (res) => {
            resolve(res.confirm);
          }
        });
      });
    },

    // 保存用户信息
    async saveUserInfo(updateData) {
      try {
        uni.showLoading({
          title: '保存中...',
          mask: true
        });

        // 验证数据
        if (updateData.nickname && !updateData.nickname.trim()) {
          uni.hideLoading();
          uni.showToast({
            title: '请输入昵称',
            icon: 'none'
          });
          return;
        }

        // 检查是否有实际修改
        const hasChange = (updateData.nickname && updateData.nickname !== this.userInfo.nickName) ||
                         (updateData.avatar && updateData.avatar !== this.userInfo.avatarUrl);

        if (!hasChange) {
          uni.hideLoading();
          uni.showToast({
            title: '没有修改内容',
            icon: 'none'
          });
          return;
        }

        const response = await userAPI.updateUserInfo(updateData);

        if (response.code === 0) {
          uni.hideLoading();
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          });

          // 更新本地用户信息
          if (updateData.nickname) {
            this.userInfo.nickName = updateData.nickname.trim();
          }
          if (updateData.avatar) {
            this.userInfo.avatarUrl = updateData.avatar;
          }
        } else {
          throw new Error(response.message || '保存失败');
        }
      } catch (error) {
        uni.hideLoading();
        console.error('保存用户信息失败:', error);
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        });
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
  padding: 24rpx 32rpx;
  box-sizing: border-box;
}

/* 安全区域适配 */
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
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
  cursor: pointer;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 9999rpx;
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
  font-family: 'WenQuanYi Zen Hei';
  letter-spacing: 0.5rpx;
}

.edit-icon {
  width: 24rpx;
  height: 24rpx;
}

/* 主要功能卡片区域 */
.main-cards-section {
  margin: 32rpx 0;
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
  text-align: center;
  margin: 48rpx 0;
  color: #64748B;
}

</style>