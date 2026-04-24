<template>
  <view class="feedback-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <text class="nav-title">意见反馈</text>
      </view>
    </view>

    <scroll-view class="feedback-content" scroll-y="true">
      <!-- 反馈表单 -->
      <view class="section">
        <text class="section-title">反馈内容</text>
        <view class="feedback-form">
          <textarea
            class="feedback-input"
            placeholder="请输入您的宝贵意见或建议..."
            maxlength="500"
            v-model="feedbackContent"
            :style="{height: textareaHeight + 'rpx'}"
            @focus="adjustTextareaHeight"
            @blur="resetTextareaHeight"
          ></textarea>
          <view class="char-count">{{ feedbackContent.length }}/500</view>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="section">
        <text class="section-title">联系我们</text>
        <view class="contact-list">
          <view class="contact-item" @click="makePhoneCall">
            <text class="contact-icon">📞</text>
            <text class="contact-text">客服热线: 400-123-4567</text>
          </view>
          <view class="contact-item" @click="sendEmail">
            <text class="contact-icon">📧</text>
            <text class="contact-text">邮箱: support@studentassistant.com</text>
          </view>
          <view class="contact-item" @click="openWebsite">
            <text class="contact-icon">🌐</text>
            <text class="contact-text">官网: www.studentassistant.com</text>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button class="submit-button" @click="submitFeedback" :disabled="!feedbackContent.trim()">
          {{ feedbackContent.trim() ? '提交反馈' : '请输入反馈内容' }}
        </button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      feedbackContent: '',
      textareaHeight: 200
    };
  },
  methods: {
    adjustTextareaHeight() {
      this.textareaHeight = 300;
    },

    resetTextareaHeight() {
      this.textareaHeight = 200;
    },

    submitFeedback() {
      if (!this.feedbackContent.trim()) {
        uni.showToast({
          title: '请输入反馈内容',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({
        title: '提交中...'
      });

      // 模拟提交反馈
      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: '反馈提交成功',
          icon: 'success'
        });

        // 清空内容
        this.feedbackContent = '';

        // 返回上一页
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }, 2000);
    },

    makePhoneCall() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567'
      });
    },

    sendEmail() {
      uni.showModal({
        title: '发送邮件',
        content: '是否要发送邮件到 support@studentassistant.com？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '邮件功能开发中',
              icon: 'none'
            });
          }
        }
      });
    },

    openWebsite() {
      uni.showModal({
        title: '访问官网',
        content: '是否要访问我们的官方网站？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '网页功能开发中',
              icon: 'none'
            });
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.feedback-container {
  flex: 1;
  background: #F7F9FC;
  min-height: 100vh;
}

.nav-bar {
  background: #FFFFFF;
  padding: 32rpx 48rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.nav-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
}

.feedback-content {
  flex: 1;
  padding: 32rpx 24rpx;
  box-sizing: border-box;
}

.section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 24rpx;
  display: block;
}

.feedback-form {
  position: relative;
}

.feedback-input {
  width: 100%;
  background: #F8FAFC;
  border: 1rpx solid #E2E8F0;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 26rpx;
  color: #191C1E;
  box-sizing: border-box;
  resize: none;
  transition: all 0.2s ease;
}

.feedback-input:focus {
  border-color: #00BFA5;
  background: #FFFFFF;
  box-shadow: 0 0 0 2rpx rgba(0, 191, 165, 0.1);
}

.char-count {
  text-align: right;
  font-size: 22rpx;
  color: #94A3B8;
  margin-top: 12rpx;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #F1F5F9;
  transition: all 0.2s ease;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item:active {
  background-color: #F8FAFC;
  border-radius: 12rpx;
}

.contact-icon {
  font-size: 28rpx;
  width: 40rpx;
}

.contact-text {
  font-size: 26rpx;
  color: #475569;
}

.submit-section {
  margin: 32rpx 0;
}

.submit-button {
  background: linear-gradient(135deg, #00BFA5 0%, #006B5C 100%);
  color: #FFFFFF;
  border: none;
  padding: 28rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
  width: 100%;
  transition: all 0.2s ease;
  box-shadow: 0 4rpx 16rpx rgba(0, 191, 165, 0.3);
}

.submit-button:active {
  transform: translateY(1rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 191, 165, 0.2);
}

.submit-button:disabled {
  background: #CBD5E1;
  color: #64748B;
  box-shadow: none;
  transform: none;
}
</style>