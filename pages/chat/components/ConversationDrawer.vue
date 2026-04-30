<template>
  <view class="drawer-overlay" v-if="visible" @click="handleOverlayClick" :class="{ 'overlay-visible': visible }">
    <view class="conversation-drawer" @click.stop :class="{ 'drawer-open': visible }">
      <view class="drawer-header">
        <text class="drawer-title">对话历史</text>
        <view class="close-button" @click="handleClose">✕</view>
      </view>
      <scroll-view class="conversation-list" scroll-y="true">
        <view v-for="(conversation, index) in conversations" :key="conversation.id"
              class="conversation-item" :style="{ animationDelay: `${index * 0.05}s` }">
          <view class="conversation-info" @click.stop="handleSelect(conversation)">
            <text class="conversation-title">{{ conversation.title }}</text>
          </view>
          <view class="conversation-actions">
            <view class="message-count">{{ conversation.message_count }}条</view>
            <view class="delete-btn" @click.stop="handleDelete(conversation)">删除</view>
          </view>
        </view>
      </scroll-view>
      <button class="new-conversation-btn" @click="handleNew">新建对话</button>
    </view>
  </view>
</template>

<script>
import { chatAPI } from '@/api/index.js'

export default {
  name: 'ConversationDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    currentConversationId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      conversations: []
    }
  },
  watch: {
    visible(val) {
      // 打开抽屉时加载会话列表
      if (val) {
        this.loadConversations()
      }
    }
  },
  methods: {
    async loadConversations() {
      try {
        const response = await chatAPI.getConversations(1, 20)
        this.conversations = response.data.list || []
      } catch (error) {
        console.error('获取会话列表失败:', error)
      }
    },
    handleOverlayClick() {
      this.$emit('close')
    },
    handleClose() {
      this.$emit('close')
    },
    handleSelect(conversation) {
      this.$emit('select', conversation)
    },
    async handleDelete(conversation) {
      try {
        await chatAPI.deleteConversation(conversation.id)

        uni.showToast({
          title: '删除成功',
          icon: 'success'
        })

        // 刷新列表
        await this.loadConversations()

        // 如果删除的是当前会话，通知父组件
        if (this.currentConversationId === conversation.id) {
          this.$emit('delete-current')
        }
      } catch (error) {
        console.error('删除会话失败:', error)
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
    },
    handleNew() {
      this.$emit('new')
    }
  }
}
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease-in-out, background 0.3s ease-in-out;
  pointer-events: none;
}

.drawer-overlay.overlay-visible {
  opacity: 1;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.conversation-drawer {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  height: 100%;
  background: #FFFFFF;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 4rpx 0 12rpx rgba(0, 0, 0, 0.1);
  transform: translateX(-20rpx) scale(0.98);
  opacity: 0;
  padding-top: var(--status-bar-height);
}

.conversation-drawer.drawer-open {
  left: 0;
  transform: translateX(0) scale(1);
  opacity: 1;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #E0E0E0;
  background: #FFFFFF;
}

.drawer-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.close-button {
  font-size: 36rpx;
  color: #666666;
  padding: 8rpx;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #F0F0F0;
  opacity: 0;
  transform: translateX(40rpx);
  animation: slideInItem 0.4s ease-out forwards;
}

.conversation-item:active {
  background: #F8F9FA;
}

.conversation-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.conversation-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1A1A1A;
}

.message-count {
  font-size: 22rpx;
  color: #999999;
  background: #F0F0F0;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.conversation-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.delete-btn {
  font-size: 22rpx;
  color: #FF3B30;
  background: #FFF5F5;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  border: 1rpx solid #FFD1D1;
}

.delete-btn:active {
  background: #FFE5E5;
}

.new-conversation-btn {
  background: linear-gradient(162deg, #006B5C 0%, #00BFA5 100%);
  color: #FFFFFF;
  border: none;
  padding: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  margin: 24rpx;
  border-radius: 48rpx;
}

@keyframes slideInItem {
  from {
    opacity: 0;
    transform: translateX(40rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>