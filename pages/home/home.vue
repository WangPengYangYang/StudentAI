<template>
  <view class="home-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="app-brand">
        <view class="brand-logo"></view>
        <text class="brand-name">学者·策展人</text>
      </view>
      <view class="user-avatar">
        <image class="avatar-image" src="/static/logo.jpeg" mode="aspectFill"></image>
      </view>
    </view>

    <scroll-view class="home-content" scroll-y="true">
      <!-- 用户进度卡片 -->
      <view class="progress-card">
        <view class="progress-header">
          <text class="progress-label">Status</text>
          <text class="progress-value">{{ profileCompletion.completion_rate }}%</text>
        </view>
        <text class="progress-title">个人资料完成度 {{ profileCompletion.completion_rate }}%</text>
        <view class="progress-bar">
          <view class="progress-track">
            <view class="progress-fill" :style="{width: profileCompletion.completion_rate + '%'}"></view>
          </view>
        </view>
        <text class="progress-desc">完善您的背景信息，AI 导师将能提供更精准的院校匹配建议。</text>
        <view class="progress-button" @click="navigateTo('create-profile')">
          <text>{{ profileCompletion.completion_rate === 100 ? '查看完整资料' : '继续完善资料' }}</text>
        </view>
      </view>

      <!-- AI智能选校入口 -->
      <view class="ai-section">
        <view class="ai-background">
          <view class="ai-overlay"></view>
          <view class="ai-content">
            <view class="ai-badge">
              <text>AI Powered Selection</text>
            </view>
            <text class="ai-title">AI 智能选校\n精准定位名校</text>
            <text class="ai-desc">基于 50,000+ 真实录取案例，为您量身定制留学方案。</text>
            <view class="ai-button" @click="navigateTo('chat')">
              <text>开始测评</text>
              <view class="ai-button-icon">→</view>
            </view>
          </view>
        </view>
      </view>

      <!-- 热门留学国家网格 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">热门留学国家</text>
          <text class="section-more" @click="toggleCountries">
            {{ showAll.countries ? '收起' : '查看全部' }}
          </text>
        </view>
        <view class="countries-grid">
          <view class="country-item" v-for="country in displayedCountries" :key="country.code" @click="selectCountry(country)">
            <view class="country-icon">{{ country.icon }}</view>
            <text class="country-name">{{ country.name }}</text>
          </view>
        </view>
      </view>

      <!-- 全球名校速递 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">全球名校速递</text>
          <text class="section-tag">QS 2024</text>
        </view>
        <view class="universities-list">
          <view class="university-card" v-for="uni in displayedUniversities" :key="uni.id" @click="viewUniversity(uni)">
            <view class="uni-image-container">
              <image class="uni-image" :src="uni.image" mode="aspectFill"></image>
              <view class="uni-rank">
                <text>{{ uni.rank }}</text>
              </view>
            </view>
            <view class="uni-info">
              <text class="uni-name">{{ uni.name }}</text>
              <text class="uni-location">{{ uni.location }}</text>
              <view class="uni-tags">
                <view class="uni-tag" v-for="tag in uni.tags" :key="tag">{{ tag }}</view>
              </view>
            </view>
          </view>
        </view>
        <view class="show-more" v-if="universities.length > 3" @click="toggleUniversities">
          <text>{{ showAll.universities ? '收起' : '查看更多名校' }}</text>
          <view class="show-more-icon" :class="{ 'rotate-180': showAll.universities }">
            {{ showAll.universities ? '↑' : '↓' }}
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { profileAPI, schoolAPI, countryAPI } from '../../api/index.js'

export default {
  data() {
    return {
      // 用户资料完成度数据
      profileCompletion: {
        completed_steps: 0,
        total_steps: 4,
        completion_rate: 0
      },
      // 热门国家数据
      countries: [],
      // 热门院校数据
      universities: [],
      // 加载状态
      loading: {
        countries: false,
        universities: false
      },
      // 显示数量控制
      displayLimit: {
        countries: 4, // 首页显示4个国家
        universities: 3 // 首页显示3所学校
      },
      // 是否显示全部内容
      showAll: {
        countries: false,
        universities: false
      }
    }
  },
  computed: {
    // 显示的国家列表（受数量限制）
    displayedCountries() {
      const limit = this.showAll.countries ? this.countries.length : this.displayLimit.countries
      return this.countries.slice(0, limit)
    },
    // 显示的学校列表（受数量限制）
    displayedUniversities() {
      const limit = this.showAll.universities ? this.universities.length : this.displayLimit.universities
      return this.universities.slice(0, limit)
    }
  },
  onLoad() {
    // 页面加载时获取用户资料完成度和接口数据
    this.getProfileCompletion()
    this.getPopularCountries()
    this.getTrendingSchools()
  },
  onShow() {
    // 页面显示时重新获取用户资料完成度（可能在其他页面修改了资料）
    this.getProfileCompletion()
  },
  methods: {
    // 获取用户资料完成度
    async getProfileCompletion() {
      try {
        const response = await profileAPI.getCompletion()
        if (response.code === 0 && response.data) {
          this.profileCompletion = {
            completed_steps: response.data.completed_steps || 0,
            total_steps: response.data.total_steps || 4,
            completion_rate: response.data.completion_rate || 0
          }
        } else {
          console.error('获取资料完成度失败:', response.message)
          this.showError('获取资料完成度失败')
        }
      } catch (error) {
        console.error('获取资料完成度异常:', error)
        this.showError('网络请求失败，请检查网络连接')
      }
    },

    // 获取热门国家列表
    async getPopularCountries() {
      this.loading.countries = true
      try {
        const response = await countryAPI.getPopularCountries()
        if (response.code === 0 && response.data && response.data.list) {
          this.countries = response.data.list.map(country => ({
            code: country.code,
            name: country.name,
            name_en: country.name_en,
            icon: country.icon || this.getCountryFlag(country.code),
            school_count: country.school_count,
            popular_majors: country.popular_majors || []
          }))
        } else {
          console.error('获取热门国家失败:', response.message)
          this.showError('获取热门国家失败')
        }
      } catch (error) {
        console.error('获取热门国家异常:', error)
        this.showError('网络请求失败，请检查网络连接')
      } finally {
        this.loading.countries = false
      }
    },

    // 获取热门院校列表
    async getTrendingSchools() {
      this.loading.universities = true
      try {
        const response = await schoolAPI.getTrendingSchools(10)
        if (response.code === 0 && response.data && response.data.list) {
          this.universities = response.data.list.map(school => ({
            id: school.id,
            name: school.name_cn || school.name_en,
            name_en: school.name_en,
            location: `${this.getCountryName(school.country)} · ${school.city}`,
            rank: this.getRankDisplay(school),
            image: '/static/logo.jpeg', // 暂时使用默认图片
            tags: this.getSchoolTags(school),
            is_favorited: school.is_favorited || false
          }))
        } else {
          console.error('获取热门院校失败:', response.message)
          this.showError('获取热门院校失败')
        }
      } catch (error) {
        console.error('获取热门院校异常:', error)
        this.showError('网络请求失败，请检查网络连接')
      } finally {
        this.loading.universities = false
      }
    },

    // 根据国家代码获取国旗emoji
    getCountryFlag(countryCode) {
      const flagMap = {
        'US': '🇺🇸',
        'UK': '🇬🇧',
        'CA': '🇨🇦',
        'AU': '🇦🇺',
        'HK': '🇭🇰',
        'SG': '🇸🇬',
        'DE': '🇩🇪',
        'FR': '🇫🇷'
      }
      return flagMap[countryCode] || '🏳️'
    },

    // 根据国家代码获取国家名称
    getCountryName(countryCode) {
      const nameMap = {
        'US': '美国',
        'UK': '英国',
        'CA': '加拿大',
        'AU': '澳大利亚',
        'HK': '中国香港',
        'SG': '新加坡',
        'DE': '德国',
        'FR': '法国'
      }
      return nameMap[countryCode] || countryCode
    },

    // 获取学校排名显示
    getRankDisplay(school) {
      if (school.qsRankRaw) {
        return `QS ${school.qsRankRaw}`
      } else if (school.qsRank && school.qsRank > 0) {
        return `QS #${school.qsRank}`
      } else if (school.theRankRaw) {
        return `THE ${school.theRankRaw}`
      } else if (school.theRank && school.theRank > 0) {
        return `THE #${school.theRank}`
      }
      return '未排名'
    },

    // 获取学校标签
    getSchoolTags(school) {
      const tags = []
      if (school.qsRank && school.qsRank <= 10) {
        tags.push('世界顶尖')
      } else if (school.qsRank && school.qsRank <= 50) {
        tags.push('全球前50')
      } else if (school.qsRank && school.qsRank <= 100) {
        tags.push('全球前100')
      }

      // 根据国家添加标签
      const countryTags = {
        'US': '美国名校',
        'UK': '英国名校',
        'CA': '加拿大名校',
        'AU': '澳洲名校'
      }
      if (countryTags[school.country]) {
        tags.push(countryTags[school.country])
      }

      return tags.length > 0 ? tags : ['知名院校']
    },

    // 显示错误提示
    showError(message) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    },
    navigateTo(page) {
      const routes = {
        'chat': '/pages/chat/chat',
        'report': '/pages/report/report',
        'profile': '/pages/profile/profile',
        'create-profile': '/pages/profile/create-profile'
      };

      if (routes[page]) {
        if (page === 'chat') {
          // 对话页面是tabbar页面，需要使用switchTab
          uni.switchTab({
            url: routes[page]
          });
        } else {
          uni.navigateTo({
            url: routes[page]
          });
        }
      }
    },
    selectCountry(country) {
      // 跳转到国家详情页或学校列表页
      uni.navigateTo({
        url: `/pages/university/university?country=${country.code}&countryName=${country.name}`
      });
    },
    viewUniversity(university) {
      // 跳转到学校详情页
      uni.navigateTo({
        url: `/pages/university/detail?id=${university.id}`
      });
    },

    // 切换国家显示状态
    toggleCountries() {
      this.showAll.countries = !this.showAll.countries
    },

    // 切换学校显示状态
    toggleUniversities() {
      this.showAll.universities = !this.showAll.universities
    }
  }
}
</script>

<style scoped>
.home-container {
  flex: 1;
  background: #F7F9FC;
  min-height: 100vh;
}

/* 顶部导航栏 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 48rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.brand-logo {
  width: 32rpx;
  height: 32rpx;
  background: #00BFA5;
  border-radius: 50%;
}

.brand-name {
  font-size: 32rpx;
  font-weight: 800;
  color: #1A1A1A;
  letter-spacing: -0.025em;
}

.user-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 2rpx solid rgba(187, 202, 196, 0.2);
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.home-content {
  flex: 1;
  padding: 32rpx 24rpx 120rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 用户进度卡片 */
.progress-card {
  background: #FFFFFF;
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

.progress-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #006B5C;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.progress-value {
  font-size: 24rpx;
  font-weight: 800;
  color: #006B5C;
}

.progress-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 32rpx;
  display: block;
}

.progress-bar {
  margin-bottom: 32rpx;
}

.progress-track {
  height: 8rpx;
  background: #F2F4F7;
  border-radius: 4rpx;
  overflow: hidden;
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
  cursor: pointer;
}

.progress-button text {
  font-size: 32rpx;
  font-weight: 700;
  color: #006B5C;
}

/* AI智能选校入口 */
.ai-section {
  margin-bottom: 48rpx;
}

.ai-background {
  background: linear-gradient(145deg, #006B5C 0%, #00BFA5 100%);
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
  color: #FFFFFF;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.ai-title {
  font-size: 56rpx;
  font-weight: 800;
  color: #FFFFFF;
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
  background: #FFFFFF;
  border-radius: 999rpx;
  padding: 24rpx 48rpx;
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  cursor: pointer;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  width: auto;
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
.section {
  margin-bottom: 48rpx;
}

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
  text-align: center;
  cursor: pointer;
  box-sizing: border-box;
  min-width: 0; /* 防止内容溢出 */
}

.country-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
}

.country-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #3C4A46;
}

/* 大学列表 */
.universities-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
}

.university-card {
  background: #FFFFFF;
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
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.uni-rank text {
  font-size: 20rpx;
  font-weight: 700;
  color: #191C1E;
}

.uni-info {
  padding: 32rpx;
}

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
}

.uni-tag text {
  font-size: 20rpx;
  font-weight: 700;
  color: #006B5C;
}

/* 查看更多样式 */
.show-more {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx;
  background: #F8FAFC;
  border-radius: 16rpx;
  margin-top: 16rpx;
  cursor: pointer;
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

.rotate-180 {
  transform: rotate(180deg);
}

/* 安全区域适配 */
.safe-area {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>