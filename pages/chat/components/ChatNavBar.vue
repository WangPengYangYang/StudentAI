<template>
  <view class="nav-bar">
    <!-- 背景渐变效果 -->
    <view class="nav-bg"></view>
    <view class="nav-glow"></view>

    <view class="nav-content">
      <view class="nav-actions">
        <view class="nav-button-wrapper" @click="handleHistoryClick">
          <image class="nav-button" src="/static/history.svg"></image>
        </view>
      </view>
      <view class="agent-info">
        <view class="avatar-container">
          <view class="avatar-glow"></view>
          <image class="agent-avatar" src="/static/logo.gif"></image>
        </view>
        <view class="agent-details">
          <text class="agent-name">Scholar AI</text>
        </view>
      </view>
      <view class="nav-placeholder"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ChatNavBar',
  methods: {
    handleHistoryClick() {
      this.$emit('show-history')
    }
  }
}
</script>

<style scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding-top: calc(var(--status-bar-height) + 24rpx);
  overflow: hidden;
}

/* 渐变背景 - 浅色科技风 */
.nav-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 50%, #f0f4ff 100%);
}

/* 发光效果 */
.nav-glow {
  position: absolute;
  top: -100rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 400rpx;
  height: 200rpx;
  background: radial-gradient(ellipse, rgba(102, 126, 234, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  position: relative;
  z-index: 1;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
  min-width: 80rpx;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.nav-placeholder {
  min-width: 80rpx;
}

.avatar-container {
  position: relative;
  width: 80rpx;
  height: 80rpx;
}

/* 头像发光效果 */
.avatar-glow {
  position: absolute;
  top: -8rpx;
  left: -8rpx;
  right: -8rpx;
  bottom: -8rpx;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
  border-radius: 9999rpx;
  opacity: 0.8;
  animation: rotateGlow 3s linear infinite;
  z-index: -1;
}

@keyframes rotateGlow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.agent-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 9999rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
}

.agent-details {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.agent-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #333333;
  text-shadow: 0 2rpx 8rpx rgba(102, 126, 234, 0.2);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(102, 126, 234, 0.1);
  padding: 4rpx 16rpx 4rpx 8rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.2);
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  background: #00c853;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 12rpx rgba(0, 200, 83, 0.5);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
}

.agent-title {
  font-size: 22rpx;
  color: #667eea;
}

.nav-button-wrapper {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 16rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.15);
  transition: all 0.3s ease;
}

.nav-button-wrapper:active {
  transform: scale(0.95);
  background: rgba(102, 126, 234, 0.15);
}

.nav-button {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.7;
}
</style>