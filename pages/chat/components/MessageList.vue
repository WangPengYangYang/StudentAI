<template>
  <scroll-view class="chat-content" scroll-y="true" :scroll-into-view="scrollToView">
    <!-- 日期指示器 -->
    <view class="date-indicator" v-if="showDateIndicator">
      <text>{{ currentDate }}</text>
    </view>

    <!-- 消息列表 -->
    <view v-for="(message, index) in messages" :key="index" :id="'message-' + index"
          :class="['message-row', message.type + '-message']">
      <view class="message-bubble">
        <!-- 用户消息使用普通文本渲染 -->
        <text v-if="message.type === 'user'">{{ message.content }}</text>
        <!-- AI消息使用zero-markdown-view组件渲染 -->
        <zero-markdown-view v-else :markdown="message.content" :aiMode="true" />
      </view>
      <view class="message-time" v-if="message.time">{{ message.time }}</view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-indicator" v-if="isLoading">
      <text>Scholar AI 正在思考</text>
      <view class="typing-dots">
        <view class="dot"></view>
        <view class="dot"></view>
        <view class="dot"></view>
      </view>
    </view>

    <!-- 插槽用于额外内容（如院校卡片） -->
    <slot></slot>
  </scroll-view>
</template>

<script>
export default {
  name: 'MessageList',
  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    showDateIndicator: {
      type: Boolean,
      default: true
    },
    scrollToView: {
      type: String,
      default: ''
    }
  },
  computed: {
    currentDate() {
      const now = new Date()
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return now.toLocaleDateString('zh-CN', options)
    }
  }
}
</script>

<style scoped>
.chat-content {
  box-sizing: border-box;
  flex: 1;
  overflow-y: auto;
  padding: 32rpx 32rpx 140rpx 32rpx;
}

.date-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.date-indicator text {
  background: rgba(0, 0, 0, 0.05);
  padding: 12rpx 24rpx;
  border-radius: 9999rpx;
  font-size: 24rpx;
  color: #666666;
}

.message-row {
  margin-bottom: 32rpx;
  display: flex;
  flex-direction: column;
  animation: fadeInUp 0.3s ease-out;
}

.ai-message {
  align-items: flex-start;
}

.user-message {
  align-items: flex-end;
  padding-right: 0;
}

.message-bubble {
  max-width: 75%;
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  margin-bottom: 12rpx;
  word-wrap: break-word;
}

.ai-message .message-bubble {
  background: #FFFFFF;
  border: 1rpx solid #E0E0E0;
  border-bottom-left-radius: 0;
  margin-left: 0;
}

.user-message .message-bubble {
  background: #007AFF;
  color: #FFFFFF;
  border-bottom-right-radius: 0;
  margin-right: 0;
  word-break: break-word;
}

.message-time {
  font-size: 22rpx;
  color: #999999;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 24rpx;
  color: #666666;
  font-size: 26rpx;
}

.typing-dots {
  display: flex;
  gap: 6rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  background: #999999;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-10rpx);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>