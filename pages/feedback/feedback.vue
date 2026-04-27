<template>
  <view class="feedback-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <text class="nav-title">{{ helpData.title || '帮助与反馈' }}</text>
      </view>
    </view>

    <scroll-view class="feedback-content" scroll-y="true">
      <!-- 帮助与联系信息 -->
      <view class="section" v-if="helpData.description || helpData.contact_email">
        <text class="section-title">帮助与联系</text>
        <view class="help-content">
          <view class="description-content" v-if="helpData.description">
            <text class="description-text">{{ helpData.description }}</text>
          </view>
          <view class="contact-info" v-if="helpData.contact_email">
            <text class="contact-label">联系邮箱：</text>
            <text class="contact-email">{{ helpData.contact_email }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      helpData: {
        title: '',
        description: '',
        contact_email: ''
      }
    };
  },
  onLoad() {
    this.fetchHelpData();
  },
  methods: {
    // 获取帮助与反馈数据
    async fetchHelpData() {
      try {
        uni.showLoading({
          title: '加载中...'
        });

        // 调用获取帮助与反馈接口
        const response = await this.$request({
          url: '/api/v1/user/help',
          method: 'GET'
        });

        if (response.code === 0) {
          this.helpData = response.data;
        } else {
          // 如果接口调用失败，使用默认数据
          this.helpData = {
            title: '帮助与反馈',
            description: '感谢您使用留学选校助手！如有任何建议或意见，欢迎通过邮件联系我们，我们将认真倾听每一位用户的声音。',
            contact_email: 'yaoxinyu199823@163.com'
          };
        }
      } catch (error) {
        console.error('获取帮助数据失败:', error);
        // 使用默认数据
        this.helpData = {
          title: '帮助与反馈',
          description: '感谢您使用留学选校助手！如有任何建议或意见，欢迎通过邮件联系我们，我们将认真倾听每一位用户的声音。',
          contact_email: 'yaoxinyu199823@163.com'
        };
      } finally {
        uni.hideLoading();
      }
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


.description-content {
  padding: 0;
}

.description-text {
  font-size: 26rpx;
  color: #475569;
  line-height: 1.6;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 0;
}

.contact-label {
  font-size: 26rpx;
  color: #475569;
  font-weight: 600;
}

.contact-email {
  font-size: 26rpx;
  color: #00BFA5;
  font-weight: 500;
}

</style>