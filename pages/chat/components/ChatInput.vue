<template>
  <view class="bottom-actions">
    <!-- 快速回复 -->
    <view class="quick-replies" v-if="showQuickReplies">
      <view v-for="(reply, index) in quickReplies" :key="index"
            class="quick-reply-btn" @click="handleQuickReply(reply)">
        {{ reply }}
      </view>
    </view>

    <!-- 输入框 -->
    <view class="input-container">
      <view class="input-field">
        <view class="input-button" @click="handleAttachment">➕</view>
        <input class="chat-input" v-model="inputText" placeholder="输入您的问题..."
               @confirm="handleSend" :focus="isFocus" :disabled="isLoading" />
        <view class="send-button" @click="handleSend" :class="{ disabled: !inputText.trim() || isLoading }">➤</view>
      </view>
    </view>
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
  background: #FFFFFF;
  padding: 24rpx 32rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.quick-replies {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
  flex-wrap: wrap;
}

.quick-reply-btn {
  background: #E3F2FD;
  padding: 16rpx 24rpx;
  border-radius: 9999rpx;
  font-size: 24rpx;
  color: #1976D2;
  border: 1rpx solid #BBDEFB;
}

.input-container {
  background: #FFFFFF;
  border: 1rpx solid #E0E0E0;
  border-radius: 40rpx;
  padding: 16rpx 20rpx;
}

.input-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.input-button, .send-button {
  font-size: 28rpx;
  color: #666666;
}

.send-button {
  background: #007AFF;
  color: #FFFFFF;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button.disabled {
  background: #CCCCCC !important;
  cursor: not-allowed;
}

.chat-input {
  flex: 1;
  height: 60rpx;
  font-size: 26rpx;
  color: #333333;
  background: transparent;
  border: none;
  outline: none;
  padding: 0 20rpx;
}

.chat-input::placeholder {
  color: #999999;
}

.chat-input:disabled {
  background: #F5F5F5;
  color: #999999;
  cursor: not-allowed;
}
</style>