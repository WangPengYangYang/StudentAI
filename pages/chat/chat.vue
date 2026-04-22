<template>
  <view class="chat-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <view class="agent-info">
          <view class="avatar-container">
            <image class="agent-avatar" src="/static/logo.gif"></image>
          </view>
          <view class="agent-details">
            <text class="agent-name">Scholar AI</text>
            <text class="agent-title">留学申请顾问</text>
          </view>
        </view>
        <view class="nav-actions">
          <image class="nav-button" src="/static/history.svg" @click="showConversationList"></image>
        </view>
      </view>
      <view class="nav-divider"></view>
    </view>

    <!-- 会话列表弹窗 -->
    <view class="modal-overlay" v-if="showConversationModal" @click="hideConversationModal">
      <view class="conversation-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">对话历史</text>
          <view class="close-button" @click="hideConversationModal">✕</view>
        </view>
        <scroll-view class="conversation-list" scroll-y="true">
          <view v-for="conversation in conversations" :key="conversation.id"
                class="conversation-item" @click="selectConversation(conversation)">
            <view class="conversation-info">
              <text class="conversation-title">{{ conversation.title }}</text>
              <text class="conversation-preview">{{ conversation.last_message }}</text>
              <text class="conversation-time">{{ formatTime(conversation.last_updated_at) }}</text>
            </view>
            <view class="message-count">{{ conversation.message_count }}条</view>
          </view>
        </scroll-view>
        <button class="new-conversation-btn" @click="createNewConversation">新建对话</button>
      </view>
    </view>

    <!-- 对话内容区域 -->
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

      <!-- 院校信息卡片 -->
      <view class="university-card" v-if="showUniversityCard">
        <view class="card-header">
          <view class="university-badge">{{ universityInfo.ranking }}</view>
          <text class="university-name">{{ universityInfo.name }}</text>
        </view>

        <view class="card-stats">
          <view class="stat-item">
            <text class="stat-label">年度学费</text>
            <text class="stat-value">{{ universityInfo.tuition }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">世界排名</text>
            <text class="stat-value">{{ universityInfo.worldRanking }}</text>
          </view>
        </view>

        <view class="card-quote">
          "{{ universityInfo.quote }}"
        </view>

        <view class="card-features">
          <view class="feature-tag" v-for="(feature, fIndex) in universityInfo.features" :key="fIndex">
            <text>{{ feature }}</text>
          </view>
        </view>

        <button class="detail-btn" @click="showUniversityDetails">查看完整课程详情</button>
      </view>

      <!-- 加载状态 -->
      <view class="loading-indicator" v-if="isLoading">
        <text>Scholar AI 正在思考...</text>
        <view class="typing-dots">
          <view class="dot"></view>
          <view class="dot"></view>
          <view class="dot"></view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作区域 -->
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
          <view class="input-button" @click="showAttachmentMenu">➕</view>
          <input class="chat-input" v-model="inputText" placeholder="输入您的问题..."
                 @confirm="sendMessage" :focus="isInputFocus" :disabled="isLoading" />
          <view class="send-button" @click="sendMessage" :class="{ disabled: !inputText.trim() || isLoading }">➤</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js'

export default {
  data() {
    return {
      messages: [],
      conversations: [],
      currentConversationId: null,
      inputText: '',
      isLoading: false,
      showUniversityCard: false,
      showQuickReplies: true,
      showDateIndicator: true,
      showConversationModal: false,
      currentTab: 'chat',
      isInputFocus: false,
      scrollToView: '',
      universityInfo: {
        name: '',
        ranking: '',
        tuition: '',
        worldRanking: '',
        quote: '',
        features: []
      },
      quickReplies: [
        '我想申请美国的CS硕士',
        '推荐几所英国大学',
        '我的背景适合什么专业',
        '申请时间规划'
      ],
      sseClient: null
    }
  },
  computed: {
    currentDate() {
      const now = new Date()
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return now.toLocaleDateString('zh-CN', options)
    }
  },

  mounted() {
    this.scrollToBottom()
    // 页面加载时创建新会话
    if (!this.currentConversationId) {
      this.createNewConversation()
    }
  },
  methods: {
    async sendMessage() {
      if (!this.inputText.trim()) return

      // 添加用户消息
      const userMessage = {
        type: 'user',
        content: this.inputText,
        time: this.getCurrentTime()
      }
      this.messages.push(userMessage)
      const messageContent = this.inputText
      this.inputText = ''
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
        await request.sse('/chat/send', {
          conversation_id: this.currentConversationId,
          message: messageContent
        },
        // onMessage 回调（流式更新）
        (content) => {
          // 更新AI消息内容，使用接口返回的真实数据
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
          // 更新会话ID（如果是新会话）
          if (!this.currentConversationId && data.conversation_id) {
            this.currentConversationId = data.conversation_id
          }

          // 处理结构化数据
          if (data.structured_output && data.structured_output.recommendations) {
            this.showUniversityCard = true
            this.updateUniversityInfo(data.structured_output.recommendations[0])
          }

          this.isLoading = false
          this.scrollToBottom()
        })

      } catch (error) {
        console.error('发送消息失败:', error)
        this.messages[aiMessageIndex].content = '抱歉，网络连接出现问题。请检查网络后重试。'
        this.isLoading = false
        this.scrollToBottom()
      }
    },

    async loadConversations() {
      try {
        const response = await request.get('/chat/conversations', {
          page: 1,
          size: 20
        })
        this.conversations = response.data.list || []
      } catch (error) {
        console.error('获取会话列表失败:', error)
      }
    },

    async loadHistory(conversationId) {
      try {
        const response = await request.get(`/chat/history/${conversationId}`, {
          page: 1,
          size: 50
        })

        // 转换消息格式
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

    async createNewConversation() {
      try {
        const response = await request.post('/chat/conversations', {
          title: '新对话'
        })

        this.currentConversationId = response.data.id
        this.messages = []
        this.showConversationModal = false

        // 发送欢迎消息
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

    showConversationList() {
      this.loadConversations()
      this.showConversationModal = true
    },

    hideConversationModal() {
      this.showConversationModal = false
    },

    selectConversation(conversation) {
      this.currentConversationId = conversation.id
      this.loadHistory(conversation.id)
      this.showConversationModal = false
    },

    handleQuickReply(reply) {
      this.inputText = reply
      this.sendMessage()
    },

    getCurrentTime() {
      const now = new Date()
      return now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const lastIndex = this.messages.length - 1
        if (lastIndex >= 0) {
          this.scrollToView = `message-${lastIndex}`
        }
      })
    },

    updateUniversityInfo(schoolInfo) {
      if (schoolInfo) {
        this.universityInfo = {
          name: schoolInfo.school_name_cn || schoolInfo.school_name,
          ranking: schoolInfo.tier === 'reach' ? '冲刺校' :
                  schoolInfo.tier === 'match' ? '稳妥校' : '保底校',
          tuition: schoolInfo.tuition_yearly ? `£${schoolInfo.tuition_yearly}/年` : '待查询',
          worldRanking: schoolInfo.qs_ranking ? `QS #${schoolInfo.qs_ranking}` : '未排名',
          quote: schoolInfo.reasons ? schoolInfo.reasons.join('，') : '该校在相关领域具有优势',
          features: schoolInfo.reasons || []
        }
      }
    },

    showUniversityDetails() {
      uni.showModal({
        title: this.universityInfo.name + '详情',
        content: `学校类型：${this.universityInfo.ranking}\n世界排名：${this.universityInfo.worldRanking}\n年度学费：${this.universityInfo.tuition}\n\n${this.universityInfo.quote}`,
        showCancel: false,
        confirmText: '了解'
      })
    },

    showAttachmentMenu() {
      uni.showActionSheet({
        itemList: ['图片', '文件', '位置'],
        success: (res) => {
          console.log('选择了：' + res.tapIndex)
        }
      })
    },

    switchTab(tab) {
      this.currentTab = tab
      if (tab !== 'chat') {
        uni.switchTab({
          url: `/pages/${tab}/${tab}`
        })
      }
    }
  },

}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #F8F9FA;
}

/* 会话列表弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.conversation-modal {
  background: #FFFFFF;
  border-radius: 24rpx;
  width: 80%;
  max-height: 70%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #E0E0E0;
}

.modal-title {
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
  max-height: 400rpx;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #F0F0F0;
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

.conversation-preview {
  font-size: 24rpx;
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-time {
  font-size: 22rpx;
  color: #999999;
}

.message-count {
  font-size: 22rpx;
  color: #999999;
  background: #F0F0F0;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
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

/* 导航栏样式 */
.nav-bar {
  background: #FFFFFF;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx;
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
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

.nav-actions {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.nav-button {
  width: 40rpx;
  height: 40rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 9999rpx;
}

.nav-divider {
  height: 1rpx;
  background: rgba(0, 0, 0, 0.1);
  opacity: 0.2;
}

/* 对话内容区域 */
.chat-content {
  box-sizing: border-box;
  flex: 1;
  overflow-y: auto;
  padding: 32rpx 32rpx; /* 减小左右内边距，从48rpx改为32rpx */
  padding-bottom: 320rpx; /* 增加底部内边距，避免内容被底部操作区域遮挡 */
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
}

.ai-message {
  align-items: flex-start;
}

.user-message {
  align-items: flex-end;
  padding-right: 0; /* 移除右侧内边距，避免溢出 */
}

.message-bubble {
  max-width: 75%; /* 减小最大宽度，避免右侧溢出 */
  padding: 24rpx 32rpx;
  border-radius: 24rpx;
  margin-bottom: 12rpx;
  word-wrap: break-word; /* 确保长文本换行 */
}

.ai-message .message-bubble {
  background: #FFFFFF;
  border: 1rpx solid #E0E0E0;
  border-bottom-left-radius: 0;
  margin-left: 0; /* 确保左侧消息从左边开始 */
}

.user-message .message-bubble {
  background: #007AFF;
  color: #FFFFFF;
  border-bottom-right-radius: 0;
  margin-right: 0; /* 确保右侧消息右边距为0 */
  word-break: break-word; /* 确保长单词也能正确换行 */
}

.message-time {
  font-size: 22rpx;
  color: #999999;
}

/* 院校卡片样式 */
.university-card {
  background: #FFFFFF;
  border: 1rpx solid #E0E0E0;
  border-radius: 24rpx;
  padding: 24rpx;
  margin: 24rpx 0;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 24rpx;
}

.university-badge {
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%);
  color: #FFFFFF;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: inline-block;
}

.university-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.card-stats {
  display: flex;
  gap: 32rpx;
  margin-bottom: 24rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666666;
}

.stat-value {
  font-size: 28rpx;
  font-weight: 500;
  color: #1A1A1A;
}

.card-quote {
  background: #F8F9FA;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #666666;
  font-style: italic;
  margin-bottom: 24rpx;
}

.card-features {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.feature-tag {
  background: #E3F2FD;
  padding: 12rpx 20rpx;
  border-radius: 9999rpx;
  font-size: 22rpx;
  color: #1976D2;
}

.detail-btn {
  background: #1976D2;
  color: #FFFFFF;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 500;
  text-align: center;
  border: none;
}

/* 底部操作区域 */
.bottom-actions {
  position: fixed;
  bottom: 80rpx; /* 固定在底部导航栏上方 */
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

.input-placeholder {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: #999999;
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

.tab-item.active .tab-label {
  color: #007AFF;
  font-weight: 500;
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

/* 输入框样式 */
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

.send-button.disabled {
  background: #CCCCCC !important;
  cursor: not-allowed;
}

/* 消息动画 */
.message-row {
  animation: fadeInUp 0.3s ease-out;
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