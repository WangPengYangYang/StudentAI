<template>
  <view>
    <!-- 顶部导航栏 -->
    <view class="page-header">
      <view class="page-header__content">
        <view class="page-header__left"></view>
        <view class="page-header__center">
          <text class="page-header__title">首页</text>
        </view>
        <view class="page-header__right"></view>
      </view>
    </view>

    <scroll-view class="home-content page-content" scroll-y>
      <!-- 用户进度卡片 -->
      <view class="progress-card">
        <view class="progress-header">
          <text class="progress-label">Status</text>
          <text class="progress-value">{{ completionRate }}%</text>
        </view>
        <text class="progress-title">个人资料完成度 {{ completionRate }}%</text>
        <view class="progress-bar">
          <view class="progress-track">
            <view class="progress-fill" :style="{width: completionRate + '%'}"></view>
          </view>
        </view>
        <text class="progress-desc">完善您的背景信息，AI 导师将能提供更精准的院校匹配建议。</text>
        <view class="progress-button" @click="navigateTo('create-profile')">
          <text>{{ completionRate === 100 ? '查看完整资料' : '继续完善资料' }}</text>
        </view>
      </view>

      <!-- AI智能选校入口 -->
      <view class="ai-section">
        <view class="ai-background">
          <view class="ai-overlay"></view>
          <view class="ai-content">
            <view class="ai-badge"><text>AI Powered Selection</text></view>
            <text class="ai-title">AI 智能选校\n精准定位名校</text>
            <text class="ai-desc">基于 50,000+ 真实录取案例，为您量身定制留学方案。</text>
            <view class="ai-button" @click="navigateTo('chat')">
              <text>开始测评</text>
              <text class="ai-button-icon">→</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 热门留学国家 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">热门留学国家</text>
          <text class="section-more" @click="showAll.countries = !showAll.countries">
            {{ showAll.countries ? '收起' : '查看全部' }}
          </text>
        </view>
        <view class="countries-grid">
          <view class="country-item" v-for="item in displayedCountries" :key="item.code" @click="selectCountry(item)">
            <image class="country-icon" :src="item.icon" mode="aspectFit"></image>
            <text class="country-name">{{ item.name }}</text>
          </view>
        </view>
      </view>

      <!-- 全球名校速递 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">全球名校速递</text>
          <text class="section-tag">QS {{ qsYear }}</text>
        </view>
        <view class="universities-list">
          <view class="university-card" v-for="item in displayedUniversities" :key="item.id" @click="viewUniversity(item)">
            <view class="uni-image-container">
              <image class="uni-image" :src="item.image" mode="aspectFill"></image>
              <view class="uni-rank"><text>{{ item.rank }}</text></view>
            </view>
            <view class="uni-info">
              <text class="uni-name">{{ item.name }}</text>
              <text class="uni-location">{{ item.location }}</text>
              <view class="uni-tags">
                <view class="uni-tag" v-for="tag in item.tags" :key="tag">{{ tag }}</view>
              </view>
            </view>
          </view>
        </view>
        <view class="show-more" v-if="universities.length > 3" @click="showAll.universities = !showAll.universities">
          <text>{{ showAll.universities ? '收起' : '查看更多名校' }}</text>
          <text class="show-more-icon" :class="{ 'rotate-180': showAll.universities }">
            {{ showAll.universities ? '↑' : '↓' }}
          </text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { profileAPI, schoolAPI, countryAPI } from '../../api/index.js'

// 常量配置
const ROUTES = {
  chat: '/pages/chat/chat',
  report: '/pages/report/report',
  profile: '/pages/profile/mine',
  'create-profile': '/pages/profile/create-profile'
}

export default {
  data() {
    return {
      completionRate: 0,
      countries: [],
      universities: [],
      qsYear: '2026',
      showAll: { countries: false, universities: false }
    }
  },
  computed: {
    displayedCountries() {
      return this.showAll.countries ? this.countries : this.countries.slice(0, 4)
    },
    displayedUniversities() {
      return this.showAll.universities ? this.universities : this.universities.slice(0, 3)
    }
  },
  onLoad() {
    this.init()
  },
  onShow() {
    this.getProfileCompletion()
  },
  methods: {
    async init() {
      await Promise.all([
        this.getProfileCompletion(),
        this.getPopularCountries(),
        this.getTrendingSchools()
      ])
    },

    async getProfileCompletion() {
      const res = await this.safeApiCall(profileAPI.getCompletion.bind(profileAPI))
      if (res?.data) {
        this.completionRate = res.data.completion_rate || 0
      }
    },

    async getPopularCountries() {
      const res = await this.safeApiCall(countryAPI.getPopularCountries.bind(countryAPI))
      if (res?.data?.list) {
        this.countries = res.data.list.map(c => ({
          code: c.code,
          name: c.name,
          icon: c.icon
        }))
      }
    },

    async getTrendingSchools() {
      const res = await this.safeApiCall(schoolAPI.getTrendingSchools.bind(schoolAPI), 10)
      if (res?.data?.list) {
        if (res.data.year) {
          this.qsYear = res.data.year
        }
        this.universities = res.data.list.map(s => ({
          id: s.id,
          name: s.name_cn || s.name_en,
          location: `${s.country_name || s.country} · ${s.city}`,
          rank: this.formatRank(s),
          image: s.cover_image || '/static/logo.jpeg',
          tags: this.getSchoolTags(s)
        }))
      }
    },

    formatRank(school) {
      if (school.qs_rank_raw) return `QS ${school.qs_rank_raw}`
      if (school.qs_rank > 0) return `QS #${school.qs_rank}`
      if (school.the_rank_raw) return `THE ${school.the_rank_raw}`
      if (school.the_rank > 0) return `THE #${school.the_rank}`
      return '未排名'
    },

    getSchoolTags(school) {
      const tags = []
      const rank = school.qs_rank
      if (rank <= 10) tags.push('世界顶尖')
      else if (rank <= 50) tags.push('全球前50')
      else if (rank <= 100) tags.push('全球前100')

      if (school.country_name) tags.push(school.country_name + '名校')

      return tags.length ? tags : ['知名院校']
    },

    async safeApiCall(fn, ...args) {
      try {
        const res = await fn(...args)
        return res?.code === 0 ? res : null
      } catch (e) {
        this.showError('网络请求失败')
        return null
      }
    },

    showError(msg) {
      uni.showToast({ title: msg, icon: 'none', duration: 2000 })
    },

    navigateTo(page) {
      const url = ROUTES[page]
      if (!url) return

      page === 'chat'
        ? uni.switchTab({ url })
        : uni.navigateTo({ url })
    },

    selectCountry(country) {
      uni.navigateTo({
        url: `/pages/university/university?country=${country.code}&countryName=${country.name}`
      })
    },

    viewUniversity(school) {
      uni.navigateTo({ url: `/pages/university/detail?id=${school.id}` })
    }
  }
}
</script>
<style scoped>
.home-content {
  flex: 1;
  padding: 32rpx 24rpx 120rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 用户进度卡片 */
.progress-card {
  background: #FFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.progress-label, .progress-value {
  font-size: 24rpx;
  font-weight: 700;
  color: #006B5C;
}

.progress-label { letter-spacing: 0.1em; text-transform: uppercase; }

.progress-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 32rpx;
  display: block;
}

.progress-track {
  height: 8rpx;
  background: #F2F4F7;
  border-radius: 4rpx;
  overflow: hidden;
  margin-bottom: 32rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #006B5C, #00BFA5);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-desc {
  font-size: 28rpx;
  color: #3C4A46;
  line-height: 1.625;
  margin-bottom: 32rpx;
  display: block;
}

.progress-button {
  background: #F2F4F7;
  border-radius: 24rpx;
  padding: 32rpx 0;
  text-align: center;
}

.progress-button text {
  font-size: 32rpx;
  font-weight: 700;
  color: #006B5C;
}

/* AI智能选校入口 */
.ai-section { margin-bottom: 48rpx; }

.ai-background {
  background: linear-gradient(145deg, #006B5C, #00BFA5);
  border-radius: 32rpx;
  padding: 32rpx 24rpx;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.ai-overlay {
  position: absolute;
  top: -96rpx;
  right: -256rpx;
  width: 512rpx;
  height: 512rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(128rpx);
}

.ai-content {
  position: relative;
  z-index: 2;
  width: 100%;
}

.ai-badge {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(24rpx);
  border-radius: 999rpx;
  padding: 12rpx 32rpx;
  margin-bottom: 30rpx;
  display: inline-block;
}

.ai-badge text {
  font-size: 20rpx;
  font-weight: 700;
  color: #FFF;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.ai-title {
  font-size: 56rpx;
  font-weight: 800;
  color: #FFF;
  line-height: 1.2;
  margin-bottom: 24rpx;
  display: block;
  white-space: pre-line;
}

.ai-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.375;
  margin-bottom: 48rpx;
  display: block;
}

.ai-button {
  background: #FFF;
  border-radius: 999rpx;
  padding: 24rpx 48rpx;
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
}

.ai-button text {
  font-size: 32rpx;
  font-weight: 700;
  color: #006B5C;
}

.ai-button-icon {
  font-size: 24rpx;
  color: #006B5C;
}

/* 通用区块样式 */
.section { margin-bottom: 48rpx; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 48rpx;
}

.section-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #191C1E;
}

.section-more {
  font-size: 24rpx;
  font-weight: 700;
  color: #94A3B8;
}

.section-tag {
  font-size: 24rpx;
  font-weight: 700;
  color: #94A3B8;
  background: rgba(148, 163, 184, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
}

/* 国家网格 */
.countries-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  width: 100%;
}

.country-item {
  background: #F2F4F7;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: 0;
}

.country-icon {
  width: 64rpx;
  height: 64rpx;
  margin-bottom: 12rpx;
}

.country-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #3C4A46;
  text-align: center;
}

/* 大学列表 */
.universities-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
}

.university-card {
  background: #FFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
}

.uni-image-container {
  position: relative;
  height: 320rpx;
  width: 100%;
}

.uni-image {
  width: 100%;
  height: 100%;
}

.uni-rank {
  position: absolute;
  top: 32rpx;
  left: 32rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16rpx);
  border-radius: 999rpx;
  padding: 8rpx 16rpx;
}

.uni-rank text {
  font-size: 20rpx;
  font-weight: 700;
  color: #191C1E;
}

.uni-info { padding: 32rpx; }

.uni-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 8rpx;
  display: block;
}

.uni-location {
  font-size: 24rpx;
  color: #3C4A46;
  margin-bottom: 24rpx;
  display: block;
}

.uni-tags {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.uni-tag {
  background: rgba(0, 107, 92, 0.05);
  border-radius: 12rpx;
  padding: 8rpx 16rpx;
  font-size: 20rpx;
  font-weight: 700;
  color: #006B5C;
}

/* 查看更多 */
.show-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx;
  background: #F8FAFC;
  border-radius: 16rpx;
  margin-top: 16rpx;
}

.show-more text {
  font-size: 28rpx;
  font-weight: 600;
  color: #006B5C;
}

.show-more-icon {
  font-size: 20rpx;
  color: #006B5C;
  transition: transform 0.3s ease;
}

.rotate-180 { transform: rotate(180deg); }
</style>
