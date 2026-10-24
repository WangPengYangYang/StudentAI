<template>
  <view class="chat-container">
    <!-- 动态背景 -->
    <view class="chat-background">
      <view class="bg-gradient"></view>
      <view class="bg-particles">
        <view class="particle particle-1"></view>
        <view class="particle particle-2"></view>
        <view class="particle particle-3"></view>
        <view class="particle particle-4"></view>
        <view class="particle particle-5"></view>
      </view>
      <view class="bg-glow bg-glow-1"></view>
      <view class="bg-glow bg-glow-2"></view>
    </view>

    <!-- 顶部导航栏 -->
    <chat-nav-bar @show-history="showConversationList" />


    <!-- 会话列表抽屉 -->
    <conversation-drawer
      :visible="showConversationModal"
      :current-conversation-id="currentConversationId"
      @close="hideConversationModal"
      @select="selectConversation"
      @delete-current="handleDeleteCurrent"
      @new="createNewConversation"
    />

    <!-- 对话内容区域 -->
    <view class="message-list-wrapper">
      <message-list
        :messages="messages"
        :is-loading="isLoading"
        :show-date-indicator="showDateIndicator"
        :scroll-to-view="scrollToView"
      />
    </view>

    <!-- 底部操作区域 -->
    <chat-input
      :show-quick-replies="showQuickReplies"
      :quick-replies="quickReplies"
      :is-loading="isLoading"
      :is-focus="isInputFocus"
      @send="handleSendMessage"
      @quick-reply="handleQuickReply"
      @attachment="showAttachmentMenu"
    />
  </view>
</template>

<script>
import { chatAPI } from '@/api/index.js'
import ChatNavBar from './components/ChatNavBar.vue'
import ConversationDrawer from './components/ConversationDrawer.vue'
import MessageList from './components/MessageList.vue'
import ChatInput from './components/ChatInput.vue'

export default {
  components: {
    ChatNavBar,
    ConversationDrawer,
    MessageList,
    ChatInput
  },
  data() {
    return {
      messages: [],
      currentConversationId: null,
      isLoading: false,
      showQuickReplies: false,
      showDateIndicator: true,
      showConversationModal: false,
      isInputFocus: false,
      scrollToView: '',
      quickReplies: [
        '我想申请美国的CS硕士',
        '推荐几所英国大学',
        '我的背景适合什么专业',
        '申请时间规划'
      ]
    }
  },

  mounted() {
    this.scrollToBottom()
    this.showWelcomeMessage()
  },

  onShow() {
    this.checkQuickMessage()
  },

  methods: {
    // 显示欢迎消息
    showWelcomeMessage() {
      const welcomeMessage = {
        type: 'ai',
        content: '你好！我是你的留学申请顾问，请告诉我你的留学需求和背景，我会为你提供专业的选校建议。',
        time: this.getCurrentTime()
      }
      this.messages.push(welcomeMessage)
      this.scrollToBottom()
    },

    // 处理发送消息
    async handleSendMessage(messageContent) {
      if (!messageContent.trim()) return

      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: messageContent,
        time: this.getCurrentTime()
      }
      this.messages.push(userMessage)
      this.isInputFocus = false

      // 调用AI接口（同步JSON响应）
      this.isLoading = true

      // 添加AI消息占位符
      const aiMessageIndex = this.messages.length
      const aiMessage = {
        type: 'ai',
        content: '',
        time: this.getCurrentTime()
      }
      this.messages.push(aiMessage)
      this.scrollToBottom()

      try {
        const response = await chatAPI.sendMessage(this.currentConversationId, messageContent)
        const result = response?.data || {}

        if (result.conversation_id) {
          this.currentConversationId = result.conversation_id
        }

        this.messages[aiMessageIndex].content = result.content || '抱歉，暂时没有获取到回复内容。'
      } catch (error) {
        console.error('发送消息失败:', error)
        this.messages[aiMessageIndex].content = '抱歉，网络连接出现问题。请检查网络后重试。'
      } finally {
        this.isLoading = false
        this.scrollToBottom()
      }
    },

    // 处理快捷回复
    handleQuickReply(reply) {
      this.handleSendMessage(reply)
    },

    // 创建带标题的新会话
    async createNewConversationWithTitle(userMessage) {
      try {
        const title = userMessage.length > 20 ? userMessage.substring(0, 20) + '...' : userMessage
        const response = await chatAPI.createConversation(title)
        this.currentConversationId = response.data.id
        console.log('创建新会话成功，ID:', this.currentConversationId, '标题:', title)
      } catch (error) {
        console.error('创建新会话失败:', error)
        uni.showToast({
          title: '创建会话失败',
          icon: 'none'
        })
      }
    },

    // 加载历史消息
    async loadHistory(conversationId) {
      try {
        const response = await chatAPI.getHistory(conversationId, 1, 50)
        // 消息可能是倒序返回的（最新的在前），需要反转为正序（最早的在前）
        const messages = response.data.messages || []
        this.messages = messages.map(msg => ({
          type: msg.role === 'user' ? 'user' : 'ai',
          content: msg.content,
          time: this.formatTime(msg.created_at)
        })).reverse()
        this.scrollToBottom()
      } catch (error) {
        console.error('获取历史消息失败:', error)
      }
    },

    // 显示会话列表
    showConversationList() {
      this.showConversationModal = true
    },

    // 隐藏会话列表
    hideConversationModal() {
      this.showConversationModal = false
    },

    // 选择会话
    selectConversation(conversation) {
      this.currentConversationId = conversation.id
      this.loadHistory(conversation.id)
      this.showConversationModal = false
    },

    // 创建新会话
    async createNewConversation() {
      try {
        const response = await chatAPI.createConversation('新对话')
        this.currentConversationId = response.data.id
        this.messages = []
        this.showConversationModal = false

        const welcomeMessage = {
          type: 'ai',
          content: '你好！我是你的留学申请顾问，请告诉我你的留学需求和背景，我会为你提供专业的选校建议。',
          time: this.getCurrentTime()
        }
        this.messages.push(welcomeMessage)
      } catch (error) {
        console.error('创建新会话失败:', error)
        uni.showToast({
          title: '创建失败',
          icon: 'none'
        })
      }
    },

    // 删除当前会话后的处理（创建新会话）
    handleDeleteCurrent() {
      this.createNewConversation()
    },

    // 显示附件菜单
    showAttachmentMenu() {
      uni.showActionSheet({
        itemList: ['图片', '文件', '位置'],
        success: (res) => {
          console.log('选择了：' + res.tapIndex)
        }
      })
    },

    // 获取当前时间
    getCurrentTime() {
      const now = new Date()
      return now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },

    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },

    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        const lastIndex = this.messages.length - 1
        if (lastIndex >= 0) {
          this.scrollToView = `message-${lastIndex}`
        }
      })
    },

    // 检查并发送快捷消息
    checkQuickMessage() {
      const quickMessage = uni.getStorageSync('quickMessage')
      if (quickMessage) {
        uni.removeStorageSync('quickMessage')
        setTimeout(() => {
          this.handleSendMessage(quickMessage)
        }, 1000)
      }
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  overflow: hidden;
}


/* 消息列表容器 */
.message-list-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 动态背景 */
.chat-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
}

/* 渐变背景 - 浅色科技风 */
.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg,
    #f8f9ff 0%,
    #f0f4ff 30%,
    #e8f0ff 60%,
    #f5f8ff 100%);
}

/* 粒子效果 */
.bg-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.particle {
  position: absolute;
  width: 6rpx;
  height: 6rpx;
  background: #667eea;
  border-radius: 50%;
  opacity: 0.4;
  animation: float 15s infinite ease-in-out;
  box-shadow: 0 0 10rpx rgba(102, 126, 234, 0.3);
}

.particle-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
  animation-duration: 18s;
}

.particle-2 {
  top: 40%;
  left: 80%;
  animation-delay: 3s;
  animation-duration: 20s;
  background: #764ba2;
  box-shadow: 0 0 10rpx rgba(118, 75, 162, 0.3);
}

.particle-3 {
  top: 60%;
  left: 30%;
  animation-delay: 6s;
  animation-duration: 16s;
  background: #f093fb;
  box-shadow: 0 0 10rpx rgba(240, 147, 251, 0.3);
}

.particle-4 {
  top: 80%;
  left: 70%;
  animation-delay: 9s;
  animation-duration: 22s;
}

.particle-5 {
  top: 30%;
  left: 50%;
  animation-delay: 12s;
  animation-duration: 19s;
  background: #764ba2;
  box-shadow: 0 0 10rpx rgba(118, 75, 162, 0.3);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-100rpx) translateX(50rpx);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-50rpx) translateX(-30rpx);
    opacity: 0.6;
  }
  75% {
    transform: translateY(-150rpx) translateX(20rpx);
    opacity: 0.4;
  }
}

/* 发光效果 */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(100rpx);
  opacity: 0.2;
  pointer-events: none;
}

.bg-glow-1 {
  top: -200rpx;
  right: -100rpx;
  width: 500rpx;
  height: 500rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  animation: glowPulse1 8s infinite ease-in-out;
}

.bg-glow-2 {
  bottom: 300rpx;
  left: -150rpx;
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, #a8b4ff, #667eea);
  animation: glowPulse2 10s infinite ease-in-out;
}

@keyframes glowPulse1 {
  0%, 100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.25;
    transform: scale(1.1);
  }
}

@keyframes glowPulse2 {
  0%, 100% {
    opacity: 0.12;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.15);
  }
}
</style>