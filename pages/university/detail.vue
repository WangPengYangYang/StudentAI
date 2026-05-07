<template>
  <view class="detail-container">
    <!-- 顶部导航栏 -->
    <view class="page-header">
      <view class="page-header__content">
        <view class="page-header__left" @click="goBack">
          <image class="page-header__back-icon" src="/static/left.png" mode="aspectFit"></image>
        </view>
        <view class="page-header__center">
          <text class="page-header__title">院校详情</text>
        </view>
        <view class="page-header__right"></view>
      </view>
    </view>

    <!-- 状态显示 -->
    <view v-if="loading" class="state-container">
      <text>加载中...</text>
    </view>
    <view v-else-if="error" class="state-container error">
      <text>{{ error }}</text>
      <button class="retry-btn" @click="loadSchoolDetail">重试</button>
    </view>
    <view v-else-if="!schoolInfo" class="state-container">
      <text>暂无学校数据</text>
    </view>

    <!-- 院校详情内容 -->
    <view v-else class="detail-content page-content">
      <!-- 院校头部信息 -->
      <view class="university-header">
        <view class="university-image-large">
          <image v-if="schoolInfo.coverImage" class="uni-cover-image" :src="schoolInfo.coverImage" mode="aspectFill"></image>
          <view v-else class="uni-placeholder-large">{{ schoolInfo.nameCn }}</view>
        </view>
        <view class="header-info">
          <text class="uni-name-large">{{ schoolInfo.nameCn }}</text>
          <text class="uni-location">{{ getLocationText(schoolInfo) }}</text>
          <view class="ranking-info" v-if="rankDisplay">
            <text class="ranking-label">排名</text>
            <text class="ranking-value">{{ rankDisplay }}</text>
          </view>
        </view>
      </view>

      <!-- 学校简介 -->
      <view class="section-card" v-if="schoolInfo.overview">
        <view class="section-header">
          <text class="section-title">学校简介</text>
        </view>
        <text class="description">{{ schoolInfo.overview }}</text>
      </view>

      <!-- 专业信息 -->
      <view class="section-card" v-if="hasMajors">
        <view class="section-header">
          <text class="section-title">热门专业</text>
        </view>
        <view class="majors-list">
          <view class="major-item" v-for="major in schoolInfo.majors" :key="major.id">
            <text class="major-name">{{ major.nameCn }}</text>
            <text class="major-category">{{ major.category }}</text>
          </view>
        </view>
      </view>

      <!-- 项目信息 -->
      <view class="section-card" v-if="hasPrograms">
        <view class="section-header">
          <text class="section-title">项目信息</text>
        </view>
        <view class="programs-list">
          <view class="program-item" v-for="program in schoolInfo.programs" :key="program.id">
            <text class="program-name">{{ program.nameCn || program.name }}</text>
            <view class="program-details">
              <text class="program-degree">{{ program.degree }}</text>
              <text class="program-duration" v-if="program.duration">{{ program.duration }}</text>
            </view>
            <view class="program-requirements" v-if="hasRequirements(program)">
              <text class="req-item" v-if="program.gpaMin">GPA: {{ program.gpaMin }}/{{ program.gpaScale || 4.0 }}</text>
              <text class="req-item" v-if="program.toeflMin">托福: {{ program.toeflMin }}+</text>
              <text class="req-item" v-if="program.ieltsMin">雅思: {{ program.ieltsMin }}+</text>
              <text class="req-item" v-if="program.greMin">GRE: {{ program.greMin }}+</text>
            </view>
            <text class="program-tuition" v-if="program.tuitionYearly">
              年学费: ${{ program.tuitionYearly.toLocaleString() }}
            </text>
          </view>
        </view>
      </view>

      <!-- 官网链接 -->
      <view class="section-card" v-if="schoolInfo.officialUrl">
        <view class="section-header">
          <text class="section-title">官方网站</text>
        </view>
        <view class="official-link">
          <text class="link-text" @click="openOfficialUrl">{{ schoolInfo.officialUrl }}</text>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="action-buttons">
        <button class="favorite-btn" @click="toggleFavorite">
          <text>{{ isFavorite ? '❤️ 已收藏' : '🤍 收藏' }}</text>
        </button>
        <button class="apply-btn" @click="consultAI">
          <text>咨询AI助手</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { schoolAPI } from '../../api/index.js'

const countryMap = {
  'US': '美国', 'UK': '英国', 'CA': '加拿大', 'AU': '澳大利亚',
  'HK': '中国香港', 'SG': '新加坡', 'DE': '德国', 'FR': '法国', 'LT': '立陶宛'
}

export default {
  data() {
    return {
      schoolId: '',
      schoolInfo: null,
      isFavorite: false,
      loading: false,
      error: ''
    }
  },
  computed: {
    rankDisplay() {
      const { schoolInfo } = this
      if (!schoolInfo) return ''
      if (schoolInfo.qsRankRaw) return `QS ${schoolInfo.qsRankRaw}`
      if (schoolInfo.qsRank > 0) return `QS #${schoolInfo.qsRank}`
      if (schoolInfo.theRankRaw) return `THE ${schoolInfo.theRankRaw}`
      if (schoolInfo.theRank > 0) return `THE #${schoolInfo.theRank}`
      return ''
    },
    hasMajors() {
      return this.schoolInfo?.majors?.length > 0
    },
    hasPrograms() {
      return this.schoolInfo?.programs?.length > 0
    }
  },
  onLoad(options) {
    if (options.id) {
      this.schoolId = options.id
      this.loadSchoolDetail()
    } else {
      this.error = '缺少学校ID参数'
    }
  },
  methods: {
    async loadSchoolDetail() {
      this.loading = true
      this.error = ''
      try {
        const response = await schoolAPI.getSchoolDetail(this.schoolId)
        if (response.code === 0 && response.data) {
          this.schoolInfo = response.data
          this.isFavorite = response.data.is_favorited || false
        } else {
          this.error = response.message || '获取学校详情失败'
        }
      } catch (error) {
        console.error('获取学校详情异常:', error)
        this.error = '网络请求失败，请检查网络连接'
      } finally {
        this.loading = false
      }
    },

    getLocationText(school) {
      const country = countryMap[school.country] || school.country
      return `${country} · ${school.city}`
    },

    hasRequirements(program) {
      return program.gpaMin || program.toeflMin || program.ieltsMin || program.greMin
    },

    openOfficialUrl() {
      if (this.schoolInfo.officialUrl) {
        uni.setClipboardData({
          data: this.schoolInfo.officialUrl,
          success: () => {
            uni.showToast({ title: '官网链接已复制到剪贴板', icon: 'none' })
          }
        })
      }
    },

    async toggleFavorite() {
      try {
        const apiCall = this.isFavorite ? schoolAPI.unfavoriteSchool : schoolAPI.favoriteSchool
        await apiCall(this.schoolId)
        this.isFavorite = !this.isFavorite
        uni.showToast({
          title: this.isFavorite ? '已收藏' : '已取消收藏',
          icon: 'none'
        })
      } catch (error) {
        console.error('收藏操作失败:', error)
        uni.showToast({ title: '操作失败，请重试', icon: 'none' })
      }
    },

    consultAI() {
      uni.switchTab({ url: '/pages/chat/chat' })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.detail-container {
  min-height: 100vh;
  background: #F7F9FC;
  padding-bottom: 120rpx;
}

.university-header {
  background: linear-gradient(135deg, #006B5C 0%, #00BFA5 100%);
  padding: 48rpx 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.university-image-large {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2);
}

.uni-cover-image {
  width: 100%;
  height: 100%;
}

.uni-placeholder-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 600;
}

.header-info { flex: 1; }

.uni-name-large {
  font-size: 36rpx;
  font-weight: 700;
  color: #FFFFFF;
  display: block;
  margin-bottom: 8rpx;
}

.uni-location {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: 16rpx;
}

.ranking-info {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

.ranking-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

.ranking-value {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.section-card {
  background: #FFFFFF;
  margin: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-header { margin-bottom: 20rpx; }

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #191C1E;
}

.state-container {
  text-align: center;
  padding: 48rpx;
  color: #94A3B8;
}

.state-container.error { color: #FF6B6B; }

.retry-btn {
  margin-top: 24rpx;
  background: #006B5C;
  color: #FFFFFF;
  padding: 16rpx 32rpx;
  border-radius: 8rpx;
  border: none;
}

.description {
  font-size: 26rpx;
  color: #333333;
  line-height: 1.8;
}

.majors-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.major-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.major-item:last-child { border-bottom: none; }

.major-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #006B5C;
}

.major-category {
  font-size: 22rpx;
  color: #94A3B8;
  background: #F8FAFC;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.programs-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.program-item {
  padding: 20rpx;
  background: #F8FAFC;
  border-radius: 12rpx;
}

.program-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #191C1E;
  display: block;
  margin-bottom: 8rpx;
}

.program-details {
  display: flex;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.program-degree {
  font-size: 22rpx;
  color: #006B5C;
  background: rgba(0, 107, 92, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.program-duration {
  font-size: 22rpx;
  color: #94A3B8;
}

.program-requirements {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.req-item {
  font-size: 20rpx;
  color: #666666;
  background: #FFFFFF;
  padding: 4rpx 8rpx;
  border-radius: 4rpx;
  border: 1rpx solid #E2E8F0;
}

.program-tuition {
  font-size: 22rpx;
  color: #006B5C;
  font-weight: 600;
}

.official-link { padding: 16rpx 0; }

.link-text {
  font-size: 26rpx;
  color: #006B5C;
  text-decoration: underline;
  cursor: pointer;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 24rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.favorite-btn {
  flex: 1;
  background: #FFFFFF;
  border: 2rpx solid #006B5C;
  color: #006B5C;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.apply-btn {
  flex: 1;
  background: linear-gradient(135deg, #006B5C 0%, #00BFA5 100%);
  color: #FFFFFF;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}
</style>