<template>
  <view class="report-page">
    <!-- 固定顶部栏 -->
    <view v-if="!loading" class="page-header">
      <view class="page-header__content">
        <view class="page-header__left"></view>
        <view class="page-header__center">
          <text class="page-header__title">我的选校报告</text>
        </view>
        <view class="page-header__right"></view>
      </view>
    </view>

    <!-- 页面主体 -->
    <view class="report-page__body page-content">
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
            <!-- 卡片头部：标题 -->
            <view class="report-card__header">
              <view class="report-card__info">
                <text class="report-card__title">{{ report.title }}</text>
                <text class="report-card__date">{{ formatDate(report.generated_at) }}</text>
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
      uni.setStorageSync('quickMessage', '请基于我的个人背景，帮我生成一份选校方案');
      uni.switchTab({ url: '/pages/chat/chat' });
    },
    viewReportDetails(reportId) {
      uni.navigateTo({ url: `/pages/report/detail?reportId=${reportId}` })
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

/* ==================== 报告列表 ==================== */
.report-page__list {
  flex: 1;
  padding: 0 24rpx;
  padding-top: 32rpx;
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