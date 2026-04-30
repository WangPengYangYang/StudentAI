<template>
  <view class="container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!reports.length" class="empty">
      <text class="title">暂无报告</text>
      <text class="desc">您还没有生成任何选校报告</text>
      <button class="btn" @click="generateReport">生成我的选校报告</button>
    </view>

    <!-- 报告列表 -->
    <view v-else class="list-container">
      <view class="header">
        <text class="title">我的选校报告</text>
        <text class="count">共{{ reports.length }}份报告</text>
      </view>

      <scroll-view class="list" scroll-y>
        <view v-for="report in reports" :key="report.report_id" class="card">
          <view class="card-header">
            <view class="title-section">
              <text class="card-title">{{ report.title }}</text>
              <text class="date">{{ formatDate(report.generated_at) }}</text>
            </view>
            <view class="share" @click="shareReport(report.share_code)">
              <image class="icon" src="/static/share.svg" mode="aspectFit"></image>
            </view>
          </view>

          <view class="content">
            <view class="desc">{{ report.description }}</view>

            <view class="stats">
              <view v-for="stat in statsConfig" :key="stat.key" class="stat">
                <text class="value">{{ report[stat.key] || 0 }}</text>
                <text class="label">{{ stat.label }}</text>
              </view>
            </view>

            <view class="schools">
              <text class="title">推荐院校</text>
              <view class="list">
                <view v-for="school in report.schools.slice(0, 3)" :key="school.school_id" class="item">
                  <text class="name">{{ school.school_name }}</text>
                  <text :class="['type', school.match_type]">{{ getTypeText(school.match_type) }}</text>
                </view>
                <view v-if="report.schools.length > 3" class="more">
                  <text>+{{ report.schools.length - 3 }} 所更多院校</text>
                </view>
              </view>
            </view>
          </view>

          <view class="actions" @click="viewReportDetails(report.report_id)">
            <text>详情</text>
            <text class="icon">→</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- AI助手悬浮按钮 -->
    <view class="fab" @click="openChat">
      <view class="shadow"></view>
      <view class="content">
        <text class="icon">💬</text>
        <text class="text">和 AI 助手聊聊</text>
      </view>
    </view>
  </view>
</template>

<script>
import { reportAPI } from '@/api/index.js'

const statsConfig = [
  { key: 'reach_count', label: '冲刺' },
  { key: 'match_count', label: '稳妥' },
  { key: 'safe_count', label: '保底' },
  { key: 'view_count', label: '浏览' }
]

const typeMap = {
  'reach': '冲刺',
  'match': '稳妥',
  'safe': '保底'
}

export default {
  data() {
    return {
      reports: [],
      loading: false,
      statsConfig
    }
  },
  onLoad() {
    this.loadReports()
  },
  methods: {
    async loadReports() {
      this.loading = true
      try {
        const res = await reportAPI.getReportList(1, 10)
        res.code === 0 ? this.reports = res.data.list : this.showToast(res.message || '获取失败')
      } catch (error) {
        console.error('获取报告列表失败:', error)
        this.showToast('获取失败，请重试')
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    },
    getTypeText(type) {
      return typeMap[type] || type
    },
    generateReport() {
      this.showToast('请先创建选校方案')
      uni.switchTab({ url: '/pages/home/home' })
    },
    viewReportDetails(reportId) {
      uni.navigateTo({ url: `/pages/report/detail?reportId=${reportId}` })
    },
    shareReport(shareCode) {
      const shareUrl = `https://example.com/share/${shareCode}`
      uni.setClipboardData({
        data: shareUrl,
        success: () => this.showToast('分享链接已复制', 'success')
      })
    },
    openChat() {
      uni.switchTab({ url: '/pages/chat/chat' })
    },
    showToast(title, icon = 'none') {
      uni.showToast({ title, icon })
    }
  }
}
</script>

<style scoped>
.container {
  flex: 1;
  background: #F7F9FC;
  min-height: 100vh;
}

/* 通用样式 */
.loading, .empty {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.empty {
  flex-direction: column;
  padding: 200rpx 48rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #191C1E;
  margin-bottom: 16rpx;
}

.desc {
  font-size: 26rpx;
  color: #6B7280;
  text-align: center;
  margin-bottom: 48rpx;
  line-height: 1.6;
}

.btn {
  background: linear-gradient(162deg, #006B5C 0%, #00BFA5 100%);
  color: #FFFFFF;
  padding: 24rpx 48rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 6rpx rgba(0, 107, 92, 0.2);
}

/* 列表容器 */
.list-container {
  flex: 1;
  padding: 24rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding: 0 8rpx;
  padding-top: calc(var(--status-bar-height) + 32rpx);
}

.header .title {
  font-size: 36rpx;
  font-weight: 700;
}

.count {
  font-size: 24rpx;
  color: #6B7280;
}

.list {
  flex: 1;
}

.card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.title-section {
  flex: 1;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #191C1E;
  margin-bottom: 8rpx;
  display: block;
}

.date {
  font-size: 24rpx;
  color: #94A3B8;
}

.share {
  margin-left: 24rpx;
}

.icon {
  width: 30rpx;
  height: 30rpx;
}

.content {
  margin-bottom: 24rpx;
}

.content .desc {
  font-size: 26rpx;
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 24rpx;
  text-align: left;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  background: #F8F9FA;
  border-radius: 16rpx;
  flex: 1;
  margin: 0 4rpx;
}

.value {
  font-size: 28rpx;
  font-weight: 600;
  color: #191C1E;
  margin-bottom: 4rpx;
}

.label {
  font-size: 22rpx;
  color: #6B7280;
}

.schools {
  margin-top: 24rpx;
}

.schools .title {
  font-size: 28rpx;
  margin-bottom: 16rpx;
}

.schools .list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: #F8F9FA;
  border-radius: 16rpx;
}

.name {
  font-size: 26rpx;
  color: #374151;
  flex: 1;
}

.type {
  font-size: 24rpx;
  font-weight: 600;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.type.reach {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
}

.more {
  text-align: center;
  padding: 16rpx;
  font-size: 24rpx;
  color: #6B7280;
}

.actions {
  display: flex;
  justify-content: flex-start;
  gap: 16rpx;
  color: #00BFA5;
  font-size: 24rpx;
}

.actions .icon {
  font-size: 24rpx;
}

/* 悬浮按钮 */
.fab {
  position: fixed;
  bottom: 200rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.shadow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0);
  border-radius: 24rpx;
}

.fab .content {
  background: linear-gradient(162deg, #006B5C 0%, #00BFA5 100%);
  padding: 16rpx 24rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  position: relative;
  z-index: 2;
}

.fab .icon {
  font-size: 28rpx;
}

.fab .text {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
  font-family: 'WenQuanYi Zen Hei';
}
</style>