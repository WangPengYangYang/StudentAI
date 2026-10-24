<template>
  <scroll-view class="chat-content" scroll-y="true" :scroll-into-view="scrollToView">
    <!-- 日期指示器 -->
    <view class="date-indicator" v-if="showDateIndicator">
      <view class="date-badge">
        <text>{{ currentDate }}</text>
      </view>
    </view>

    <!-- 消息列表 -->
    <view v-for="(message, index) in messages" :key="index" :id="'message-' + index"
          :class="['message-row', message.type + '-message']">
      <view class="message-bubble-wrapper">
        <!-- AI 思考中：用思考气泡替换 AI 聊天框 -->
        <template v-if="message.type === 'ai' && isLoading && !message.content && index === messages.length - 1">
          <view class="message-bubble ai-bubble thinking-bubble">
            <text class="loading-text">Scholar AI 正在思考</text>
            <view class="typing-dots">
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
          </view>
        </template>
        <view v-else class="message-bubble" :class="message.type + '-bubble'">
          <!-- AI 生成内容标识（合规要求：逐条明示 AI 生成） -->
          <view v-if="message.type === 'ai' && message.content" class="ai-content-tag">
            <text>AI生成内容</text>
          </view>
          <!-- 用户消息使用普通文本渲染 -->
          <text v-if="message.type === 'user'" class="message-text user-text">{{ message.content }}</text>
          <!-- AI消息使用zero-markdown-view组件渲染 -->
          <zero-markdown-view v-else :markdown="message.content" :aiMode="true" class="ai-markdown" />
        </view>
        <view class="message-time" v-if="message.time">
          <text>{{ message.time }}</text>
        </view>
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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 32rpx 32rpx 200rpx 32rpx;
  /* 导航栏 160rpx + AI 声明条 56rpx，避免首条消息被遮挡 */
  margin-top: calc(var(--status-bar-height) + 216rpx);
}

/* 日期指示器 */
.date-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.date-badge {
  background: rgba(102, 126, 234, 0.08);
  backdrop-filter: blur(10rpx);
  padding: 12rpx 32rpx;
  border-radius: 9999rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.15);
}

.date-badge text {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
}

/* 消息行 */
.message-row {
  margin-bottom: 36rpx;
  display: flex;
  flex-direction: row;
  animation: messageSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.ai-message {
  align-items: flex-start;
  flex-direction: row;
}

.user-message {
  align-items: flex-end;
  flex-direction: row-reverse;
}

/* 消息气泡包装器 */
.message-bubble-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%;
}

/* 消息气泡 */
.message-bubble {
  padding: 24rpx 28rpx;
  border-radius: 24rpx;
  margin-bottom: 8rpx;
  word-wrap: break-word;
  position: relative;
  overflow: hidden;
}

/* AI消息气泡 - 白色玻璃态效果 */
.ai-bubble {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  border-top-left-radius: 8rpx;
  box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.08);
}

/* AI 生成内容小标签 */
.ai-content-tag {
  display: inline-flex;
  align-items: center;
  padding: 2rpx 10rpx;
  margin-bottom: 12rpx;
  background: #FFF7E6;
  border: 1rpx solid #FFD591;
  border-radius: 6rpx;
}

.ai-content-tag text {
  font-size: 20rpx;
  font-weight: 500;
  color: #FA8C16;
  line-height: 1.6;
}

.ai-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.2), transparent);
}

/* 用户消息气泡 - 渐变效果 */
.user-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #FFFFFF;
  border-top-right-radius: 8rpx;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
  position: relative;
}

.user-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.6;
}

.user-text {
  color: #FFFFFF;
}

.ai-markdown {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333333;
}

/* 消息时间 */
.message-time {
  font-size: 20rpx;
  color: #999999;
  padding: 0 8rpx;
}

.user-message .message-time {
  text-align: right;
}

/* 思考中气泡（替换空 AI 聊天框） */
.thinking-bubble {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 28rpx;
  animation: fadeInScale 0.3s ease-out;
}

.loading-text {
  font-size: 24rpx;
  color: #667eea;
  font-weight: 500;
}

.typing-dots {
  display: flex;
  gap: 8rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out;
  box-shadow: 0 0 8rpx rgba(102, 126, 234, 0.3);
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-16rpx);
    opacity: 1;
  }
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(24rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>