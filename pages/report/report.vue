<template>
  <view class="report-page">
    <!-- 固定顶部栏 -->
    <view v-if="!loading && reports.length" class="report-page__header">
      <text class="header__title">我的选校报告</text>
      <text class="header__count">共{{ reports.length }}份报告</text>
    </view>

    <!-- 页面主体 -->
    <view class="report-page__body">
      <!-- 加载状态 -->
      <view v-if="loading" class="report-page__loading">
        <text class="loading__text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!reports.length" class="report-page__empty">
        <text class="empty__title">暂无报告</text>
        <text class="empty__desc">您还没有生成任何选校报告</text>
        <button class="empty__btn" @click="generateReport">生成我的选校报告</button>
      </view>

      <!-- 报告列表 -->
      <template v-else>
        <!-- 报告卡片列表 -->
        <scroll-view class="report-page__list" scroll-y>
          <view
            v-for="report in reports"
            :key="report.report_id"
            class="report-card"
          >
            <!-- 卡片头部：标题与分享 -->
            <view class="report-card__header">
              <view class="report-card__info">
                <text class="report-card__title">{{ report.title }}</text>
                <text class="report-card__date">{{ formatDate(report.generated_at) }}</text>
              </view>
              <view class="report-card__share" @click="shareReport(report.share_code)">
                <image class="share-icon" src="/static/share.svg" mode="aspectFit" />
              </view>
            </view>

            <!-- 卡片内容 -->
            <view class="report-card__body">
              <!-- 描述 -->
              <text class="report-card__desc">{{ report.description }}</text>

              <!-- 统计数据 -->
              <view class="stat-grid">
                <view
                  v-for="stat in statsConfig"
                  :key="stat.key"
                  class="stat-grid__item"
                >
                  <text class="stat-grid__value">{{ report[stat.key] || 0 }}</text>
                  <text class="stat-grid__label">{{ stat.label }}</text>
                </view>
              </view>

              <!-- 推荐院校 -->
              <view class="school-list">
                <text class="school-list__title">推荐院校</text>
                <view class="school-list__items">
                  <view
                    v-for="school in report.schools.slice(0, 3)"
                    :key="school.school_id"
                    class="school-list__item"
                  >
                    <text class="school-list__name">{{ school.school_name }}</text>
                    <text :class="['school-list__type', `school-list__type--${school.match_type}`]">
                      {{ getTypeText(school.match_type) }}
                    </text>
                  </view>
                  <view v-if="report.schools.length > 3" class="school-list__more">
                    <text>+{{ report.schools.length - 3 }} 所更多院校</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 卡片底部：操作按钮 -->
            <view class="report-card__footer" @click="viewReportDetails(report.report_id)">
              <text class="footer__text">详情</text>
              <text class="footer__arrow">→</text>
            </view>
          </view>
        </scroll-view>
      </template>
    </view>

    <!-- AI助手悬浮按钮 -->
    <view class="fab-btn" @click="openChat">
      <text class="fab-btn__icon">💬</text>
      <text class="fab-btn__text">和 AI 助手聊聊</text>
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
/* ==================== 页面容器 ==================== */
.report-page {
  flex: 1;
  background: #F7F9FC;
  min-height: 100vh;
}

.report-page__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ==================== 加载状态 ==================== */
.report-page__loading {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100rpx 0;
}

.loading__text {
  font-size: 28rpx;
  color: #6B7280;
}

/* ==================== 空状态 ==================== */
.report-page__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 200rpx 48rpx;
}

.empty__title {
  font-size: 32rpx;
  font-weight: 600;
  color: #191C1E;
  margin-bottom: 16rpx;
}

.empty__desc {
  font-size: 26rpx;
  color: #6B7280;
  text-align: center;
  margin-bottom: 48rpx;
  line-height: 1.6;
}

.empty__btn {
  background: linear-gradient(162deg, #006B5C 0%, #00BFA5 100%);
  color: #FFFFFF;
  padding: 24rpx 48rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 6rpx rgba(0, 107, 92, 0.2);
}

/* ==================== 列表头部 ==================== */
.report-page__header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--status-bar-height) + 32rpx) 48rpx 32rpx 48rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.header__title {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
}

.header__count {
  font-size: 24rpx;
  color: #6B7280;
}

/* ==================== 报告列表 ==================== */
.report-page__list {
  flex: 1;
  padding: 0 24rpx;
  padding-top: 32rpx;
  /* 为固定头部留出空间：状态栏高度 + 上padding + 下padding + 内容高度 */
  margin-top: calc(var(--status-bar-height) + 32rpx + 32rpx + 36rpx);
  box-sizing: border-box;
}

/* ==================== 报告卡片 ==================== */
.report-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
  border: 1rpx solid rgba(0, 0, 0, 0.1);
}

/* 卡片头部 */
.report-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.report-card__info {
  flex: 1;
}

.report-card__title {
  font-size: 32rpx;
  font-weight: 600;
  color: #191C1E;
  margin-bottom: 8rpx;
  display: block;
}

.report-card__date {
  font-size: 24rpx;
  color: #94A3B8;
}

.report-card__share {
  margin-left: 24rpx;
  padding: 8rpx;
}

.share-icon {
  width: 30rpx;
  height: 30rpx;
}

/* 卡片内容 */
.report-card__body {
  margin-bottom: 24rpx;
}

.report-card__desc {
  font-size: 26rpx;
  color: #6B7280;
  line-height: 1.6;
  margin-bottom: 24rpx;
  display: block;
}

/* 卡片底部 */
.report-card__footer {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #00BFA5;
  font-size: 24rpx;
}

.footer__arrow {
  font-size: 24rpx;
}

/* ==================== 统计网格 ==================== */
.stat-grid {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.stat-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx;
  background: #F8F9FA;
  border-radius: 16rpx;
  flex: 1;
  margin: 0 4rpx;
}

.stat-grid__value {
  font-size: 28rpx;
  font-weight: 600;
  color: #191C1E;
  margin-bottom: 4rpx;
}

.stat-grid__label {
  font-size: 22rpx;
  color: #6B7280;
}

/* ==================== 学校列表 ==================== */
.school-list {
  margin-top: 24rpx;
}

.school-list__title {
  font-size: 28rpx;
  font-weight: 600;
  color: #191C1E;
  margin-bottom: 16rpx;
  display: block;
}

.school-list__items {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.school-list__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: #F8F9FA;
  border-radius: 16rpx;
}

.school-list__name {
  font-size: 26rpx;
  color: #374151;
  flex: 1;
}

.school-list__type {
  font-size: 24rpx;
  font-weight: 600;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.school-list__type--reach {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
}

.school-list__type--match {
  background: rgba(0, 191, 165, 0.1);
  color: #00BFA5;
}

.school-list__type--safe {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.school-list__more {
  text-align: center;
  padding: 16rpx;
  font-size: 24rpx;
  color: #6B7280;
}

/* ==================== 悬浮按钮 ==================== */
.fab-btn {
  position: fixed;
  bottom: 80rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background: linear-gradient(162deg, #006B5C 0%, #00BFA5 100%);
  padding: 16rpx 24rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 107, 92, 0.3);
}

.fab-btn__icon {
  font-size: 28rpx;
}

.fab-btn__text {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
}
</style>