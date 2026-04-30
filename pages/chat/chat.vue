<template>
  <view class="chat-container">
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
    <message-list
      :messages="messages"
      :is-loading="isLoading"
      :show-date-indicator="showDateIndicator"
      :scroll-to-view="scrollToView"
    />

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

      // 如果是第一次发送消息，先创建新会话
      if (!this.currentConversationId) {
        await this.createNewConversationWithTitle(messageContent)
      }

      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: messageContent,
        time: this.getCurrentTime()
      }
      this.messages.push(userMessage)
      this.isInputFocus = false

      // 调用AI接口（使用流式请求）
      this.isLoading = true

      // 添加AI消息占位符
      const aiMessageIndex = this.messages.length
      const aiMessage = {
        type: 'ai',
        content: '',
        time: this.getCurrentTime()
      }
      this.messages.push(aiMessage)

      try {
        await chatAPI.sendMessage(
          this.currentConversationId,
          messageContent,
          // onMessage 回调（流式更新）
          (content) => {
            this.messages[aiMessageIndex].content = content
            this.scrollToBottom()
          },
          // onError 回调
          (error) => {
            console.error('流式请求错误:', error)
            this.messages[aiMessageIndex].content = '抱歉，网络连接出现问题。请检查网络后重试。'
            this.isLoading = false
            this.scrollToBottom()
          },
          // onComplete 回调
          (data) => {
            this.isLoading = false
            this.scrollToBottom()
          }
        )
      } catch (error) {
        console.error('发送消息失败:', error)
        this.messages[aiMessageIndex].content = '抱歉，网络连接出现问题。请检查网络后重试。'
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
        this.messages = (response.data.messages || []).map(msg => ({
          type: msg.role === 'user' ? 'user' : 'ai',
          content: msg.content,
          time: this.formatTime(msg.created_at)
        }))
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
  background: #F8F9FA;
}
</style>