<template>
  <view class="nav-bar">
    <view class="nav-content">
      <view class="nav-actions">
        <image class="nav-button" src="/static/history.svg" @click="handleHistoryClick"></image>
      </view>
      <view class="agent-info">
        <view class="avatar-container">
          <image class="agent-avatar" src="/static/logo.gif"></image>
        </view>
        <view class="agent-details">
          <text class="agent-name">Scholar AI</text>
          <text class="agent-title">留学申请顾问</text>
        </view>
      </view>
      <view class="nav-placeholder"></view>
    </view>
    <view class="nav-divider"></view>
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
  background: #FFFFFF;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
  padding-top: var(--status-bar-height);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx;
  position: relative;
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
}

.agent-avatar {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 9999rpx;
}

.agent-details {
  display: flex;
  flex-direction: column;
}

.agent-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.agent-title {
  font-size: 24rpx;
  color: #666666;
}

.nav-button {
  width: 40rpx;
  height: 40rpx;
}

.nav-divider {
  height: 1rpx;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0.2;
}
</style>