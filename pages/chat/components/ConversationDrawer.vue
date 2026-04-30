<template>
  <view class="drawer-overlay" v-if="visible" @click="handleOverlayClick" :class="{ 'overlay-visible': visible }">
    <view class="conversation-drawer" @click.stop :class="{ 'drawer-open': visible }">
      <!-- 背景装饰 -->
      <view class="drawer-bg-pattern"></view>
      <view class="drawer-glow-top"></view>

      <view class="drawer-header">
        <view class="header-left">
          <view class="title-wrapper">
            <text class="drawer-title">对话历史</text>
            <view class="title-badge" v-if="conversations.length > 0">
              <text>{{ conversations.length }}</text>
            </view>
          </view>
        </view>
        <view class="close-button" @click="handleClose">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <scroll-view class="conversation-list" scroll-y="true">
        <!-- 空状态 -->
        <view class="empty-state" v-if="conversations.length === 0">
          <view class="empty-icon">
            <text class="empty-emoji">💬</text>
          </view>
          <text class="empty-text">暂无对话记录</text>
          <text class="empty-hint">开始新对话吧</text>
        </view>

        <!-- 会话列表 -->
        <view v-for="(conversation, index) in conversations" :key="conversation.id"
              class="conversation-item"
              :style="{ animationDelay: `${index * 0.05}s` }"
              :class="{ 'current': currentConversationId === conversation.id }">
          <view class="conversation-info" @click.stop="handleSelect(conversation)">
            <view class="conversation-icon">
              <text class="icon-text">💬</text>
            </view>
            <view class="conversation-content">
              <text class="conversation-title">{{ conversation.title }}</text>
              <view class="conversation-meta">
                <view class="message-count">
                  <text class="count-text">{{ conversation.message_count }}条消息</text>
                </view>
              </view>
            </view>
          </view>
          <view class="conversation-actions">
            <view class="delete-btn" @click.stop="handleDelete(conversation)">
              <image class="delete-icon" src="/static/delete.png" mode="aspectFit"></image>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="drawer-footer">
        <button class="new-conversation-btn" @click="handleNew">
          <text class="btn-icon">+</text>
          <text class="btn-text">新建对话</text>
        </button>
      </view>
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
        await this.loadConversations()
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
  transition: all 0.4s ease-in-out;
  pointer-events: none;
}

.drawer-overlay.overlay-visible {
  opacity: 1;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: auto;
}

.conversation-drawer {
  position: fixed;
  top: 0;
  left: -100%;
  width: 82%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateX(-20rpx) scale(0.95);
  opacity: 0;
  padding-top: var(--status-bar-height);
}

.conversation-drawer.drawer-open {
  left: 0;
  transform: translateX(0) scale(1);
  opacity: 1;
}

.drawer-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%);
  z-index: 0;
}

.drawer-glow-top {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 500rpx;
  height: 300rpx;
  background: radial-gradient(ellipse, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  position: relative;
  z-index: 1;
  border-bottom: 1rpx solid rgba(102, 126, 234, 0.1);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.drawer-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333333;
}

.title-badge {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}

.title-badge text {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 600;
}

.close-button {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 50%;
  border: 1rpx solid rgba(102, 126, 234, 0.15);
  transition: all 0.3s ease;
}

.close-button:active {
  transform: scale(0.9);
  background: rgba(102, 126, 234, 0.15);
}

.close-icon {
  font-size: 28rpx;
  color: #667eea;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  position: relative;
  z-index: 1;
  padding: 16rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
}

.empty-icon {
  width: 120rpx;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 50%;
  border: 2rpx solid rgba(102, 126, 234, 0.15);
  margin-bottom: 24rpx;
}

.empty-emoji {
  font-size: 56rpx;
  opacity: 0.8;
}

.empty-text {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #999999;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  border-radius: 20rpx;
  margin-bottom: 12rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  border: 1rpx solid rgba(102, 126, 234, 0.08);
  opacity: 0;
  transform: translateX(-40rpx);
  animation: slideInItem 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.05);
}

.conversation-item.current {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.2);
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.1);
}

.conversation-item:active {
  transform: scale(0.98);
  background: rgba(102, 126, 234, 0.12);
}

.conversation-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.conversation-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15));
  border-radius: 16rpx;
  flex-shrink: 0;
}

.icon-text {
  font-size: 28rpx;
}

.conversation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  overflow: hidden;
}

.conversation-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.message-count {
  background: rgba(102, 126, 234, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.count-text {
  font-size: 20rpx;
  color: #667eea;
}

.conversation-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.delete-btn {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.delete-btn:active {
  opacity: 0.6;
}

.delete-icon {
  width: 36rpx;
  height: 36rpx;
  opacity: 0.5;
}

.drawer-footer {
  padding: 20rpx 32rpx;
  position: relative;
  z-index: 1;
}

.new-conversation-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.new-conversation-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
  border-radius: 24rpx;
  pointer-events: none;
}

.new-conversation-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: 300;
}

.btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
}

@keyframes slideInItem {
  from {
    opacity: 0;
    transform: translateX(-40rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>