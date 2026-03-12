<template>
  <view class="report-detail-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="back-button" @click="goBack">
        <text class="back-icon">←</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text class="error-text">{{ error }}</text>
      <view class="retry-button" @click="loadReportDetail">
        <text>重试</text>
      </view>
    </view>

    <!-- 报告内容 -->
    <scroll-view v-else class="report-content" scroll-y="true">
      <!-- 报告头部 -->
      <view class="report-header">
        <text class="report-title">{{ report.title }}</text>
        <text class="report-date">生成时间：{{ formatDate(report.generated_at) }}</text>
        <text class="report-desc">{{ report.description }}</text>
      </view>

      <!-- 报告统计 -->
      <view class="report-stats">
        <view class="stat-card">
          <text class="stat-number">{{ report.reach_count || 0 }}</text>
          <text class="stat-label">冲刺院校</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ report.match_count || 0 }}</text>
          <text class="stat-label">稳妥院校</text>
        </view>
        <view class="stat-card">
          <text class="stat-number">{{ report.safe_count || 0 }}</text>
          <text class="stat-label">保底院校</text>
        </view>
      </view>

      <!-- 院校列表 -->
      <view class="school-section">
        <text class="section-title">推荐院校列表</text>

        <!-- 使用动态组件减少重复代码 -->
        <SchoolCategory
          v-if="reachSchools.length > 0"
          :schools="reachSchools"
          type="reach"
          title="冲刺"
          description="高挑战性院校"
          @view-detail="viewSchoolDetail"
        />

        <SchoolCategory
          v-if="matchSchools.length > 0"
          :schools="matchSchools"
          type="match"
          title="稳妥"
          description="高录取概率院校"
          @view-detail="viewSchoolDetail"
        />

        <SchoolCategory
          v-if="safeSchools.length > 0"
          :schools="safeSchools"
          type="safe"
          title="保底"
          description="极高录取概率院校"
          @view-detail="viewSchoolDetail"
        />

        <!-- 空状态 -->
        <view v-if="!hasSchools" class="empty-container">
          <text class="empty-text">暂无推荐院校</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { reportAPI } from '@/api/index.js'
import SchoolCategory from '@/components/SchoolCategory.vue'

export default {
  components: {
    SchoolCategory
  },
  data() {
    return {
      reportId: 0,
      report: {
        title: '',
        description: '',
        generated_at: '',
        reach_count: 0,
        match_count: 0,
        safe_count: 0,
        schools: []
      },
      loading: false,
      error: ''
    }
  },
  computed: {
    reachSchools() {
      return this.report.schools.filter(school => school.match_type === 'reach');
    },
    matchSchools() {
      return this.report.schools.filter(school => school.match_type === 'match');
    },
    safeSchools() {
      return this.report.schools.filter(school => school.match_type === 'safe');
    },
    hasSchools() {
      return this.report.schools && this.report.schools.length > 0;
    }
  },
  onLoad(options) {
    this.reportId = parseInt(options.reportId);
    this.loadReportDetail();
  },
  onPullDownRefresh() {
    this.loadReportDetail().finally(() => {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    async loadReportDetail() {
      if (!this.reportId) {
        this.error = '报告ID无效';
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        const response = await reportAPI.getReportList(1, 100);
        if (response.code === 0) {
          const foundReport = response.data.list.find(report => report.report_id === this.reportId);
          if (foundReport) {
            this.report = foundReport;
          } else {
            this.error = '报告不存在';
          }
        } else {
          this.error = response.message || '获取报告详情失败';
        }
      } catch (error) {
        console.error('获取报告详情失败:', error);
        this.error = '获取报告详情失败，请重试';
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
      try {
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
      } catch {
        return dateString;
      }
    },
    viewSchoolDetail(schoolId) {
      uni.navigateTo({
        url: `/pages/university/detail?id=${schoolId}`
      });
    }
  }
}
</script>

<style scoped>
.report-detail-container {
  flex: 1;
  background: #F7F9FC;
  min-height: 100vh;
}

/* 导航栏 */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  background: #FFFFFF;
  border-bottom: 1rpx solid #E5E7EB;
}

.back-button {
  padding: 8rpx;
}

.back-icon {
  font-size: 32rpx;
  color: #374151;
}

/* 报告内容 */
.report-content {
  flex: 1;
  padding: 24rpx;
  box-sizing:  border-box;
}

.report-header {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
}

.report-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 16rpx;
}

.report-date {
  font-size: 24rpx;
  color: #6B7280;
  margin-bottom: 16rpx;
}

.report-desc {
  font-size: 26rpx;
  color: #374151;
  line-height: 1.6;
}

/* 报告统计 */
.report-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.stat-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx;
  margin: 0 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
}

.stat-number {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6B7280;
}

/* 院校部分 */
.school-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #191C1E;
  margin-bottom: 24rpx;
}
</style>