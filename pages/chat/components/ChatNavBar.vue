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

    <!-- AI 生成内容声明：作为导航栏的一部分固定显示，
         随 nav-bar 一起定位，不依赖状态栏高度计算 -->
    <view class="ai-disclaimer">
      <text class="ai-disclaimer__badge">AI生成</text>
      <text class="ai-disclaimer__text">本页面包含人工智能生成内容，仅供参考</text>
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
  width: 50rpx;
  height:50rpx;
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
  width: 50rpx;
  height: 50rpx;
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

/* AI 生成内容声明条
   位于 nav-bar 内部，随 nav-bar 一起 fixed 定位，
   无需计算状态栏高度，避免不同机型错位。 */
.ai-disclaimer {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  padding: 10rpx 32rpx 14rpx;
  background: #FFF7E6;
  border-top: 1rpx solid #FFE7BA;
}

.ai-disclaimer__badge {
  font-size: 20rpx;
  font-weight: 600;
  color: #FA8C16;
  background: #FFEDD5;
  border: 1rpx solid #FFD591;
  border-radius: 6rpx;
  padding: 2rpx 10rpx;
  margin-right: 12rpx;
  line-height: 1.6;
}

.ai-disclaimer__text {
  font-size: 22rpx;
  color: #AD6800;
  line-height: 1.6;
}
</style>