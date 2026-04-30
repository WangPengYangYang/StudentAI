<template>
  <view class="bottom-actions">
    <!-- 背景装饰 -->
    <view class="input-bg-gradient"></view>

    <!-- 快速回复 -->
    <view class="quick-replies" v-if="showQuickReplies">
      <view v-for="(reply, index) in quickReplies" :key="index"
            class="quick-reply-btn" @click="handleQuickReply(reply)"
            :style="{ animationDelay: `${index * 0.08}s` }">
        <text class="quick-reply-text">{{ reply }}</text>
      </view>
    </view>

    <!-- 输入框 -->
    <view class="input-container">
      <view class="input-glow" v-if="inputText.length > 0"></view>
      <view class="input-field">
        <view class="input-button" @click="handleAttachment">
          <text class="btn-icon">+</text>
        </view>
        <input class="chat-input"
               v-model="inputText"
               placeholder="输入您的问题..."
               placeholder-class="input-placeholder"
               @confirm="handleSend"
               :focus="isFocus"
               :disabled="isLoading" />
        <view class="send-button"
              @click="handleSend"
              :class="{ active: inputText.trim() && !isLoading, disabled: !inputText.trim() || isLoading }">
          <text class="send-icon">→</text>
          <view class="send-ripple" v-if="inputText.trim() && !isLoading"></view>
        </view>
      </view>
    </view>

    <!-- 安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script>
export default {
  name: 'ChatInput',
  props: {
    showQuickReplies: {
      type: Boolean,
      default: false
    },
    quickReplies: {
      type: Array,
      default: () => [
        '我想申请美国的CS硕士',
        '推荐几所英国大学',
        '我的背景适合什么专业',
        '申请时间规划'
      ]
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isFocus: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      inputText: ''
    }
  },
  watch: {
    value(val) {
      this.inputText = val
    }
  },
  methods: {
    handleSend() {
      if (!this.inputText.trim() || this.isLoading) return
      this.$emit('send', this.inputText)
      this.inputText = ''
    },
    handleQuickReply(reply) {
      this.$emit('quick-reply', reply)
    },
    handleAttachment() {
      this.$emit('attachment')
    }
  }
}
</script>

<style scoped>
.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 20rpx 32rpx 0;
}

/* 背景渐变 - 浅色 */
.input-bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.95) 60%,
    rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

/* 快速回复 */
.quick-replies {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.quick-reply-btn {
  background: rgba(102, 126, 234, 0.08);
  padding: 16rpx 28rpx;
  border-radius: 9999rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10rpx);
  animation: fadeSlideUp 0.4s ease-out both;
  transition: all 0.3s ease;
}

.quick-reply-btn:active {
  transform: scale(0.95);
  background: rgba(102, 126, 234, 0.15);
  box-shadow: 0 0 20rpx rgba(102, 126, 234, 0.2);
}

.quick-reply-text {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 输入容器 */
.input-container {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(102, 126, 234, 0.15);
  border-radius: 48rpx;
  padding: 12rpx 16rpx;
  backdrop-filter: blur(20rpx);
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.08);
}

.input-container:focus-within {
  border-color: rgba(102, 126, 234, 0.4);
  box-shadow: 0 4rpx 24rpx rgba(102, 126, 234, 0.15);
}

/* 输入框发光效果 */
.input-glow {
  position: absolute;
  top: -1rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 200rpx;
  height: 2rpx;
  background: linear-gradient(90deg,
    transparent,
    #667eea,
    #764ba2,
    #667eea,
    transparent);
  animation: glowSlide 2s linear infinite;
}

@keyframes glowSlide {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

.input-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

/* 左侧按钮 */
.input-button {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 50%;
  border: 1rpx solid rgba(102, 126, 234, 0.15);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.input-button:active {
  transform: scale(0.9);
  background: rgba(102, 126, 234, 0.15);
}

.btn-icon {
  font-size: 36rpx;
  color: #667eea;
  font-weight: 300;
}

/* 输入框 */
.chat-input {
  flex: 1;
  height: 64rpx;
  font-size: 28rpx;
  color: #333333;
  background: transparent;
  border: none;
  outline: none;
  padding: 0 12rpx;
}

.input-placeholder {
  color: #999999;
}

.chat-input:disabled {
  opacity: 0.6;
}

/* 发送按钮 */
.send-button {
  position: relative;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.15);
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
  overflow: hidden;
}

.send-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}

.send-button.active:active {
  transform: scale(0.9);
}

.send-button.disabled {
  background: rgba(102, 126, 234, 0.08);
  opacity: 0.5;
}

.send-icon {
  font-size: 32rpx;
  color: #667eea;
  font-weight: 600;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.send-button.active .send-icon {
  color: #FFFFFF;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

/* 发送按钮波纹效果 */
.send-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: ripple 1.5s ease-out infinite;
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.5;
  }
  100% {
    width: 120rpx;
    height: 120rpx;
    opacity: 0;
  }
}

/* 安全区域 */
.safe-area-bottom {
  height: calc(env(safe-area-inset-bottom) + 16rpx);
}
</style>