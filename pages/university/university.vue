<template>
  <view class="university-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">{{ countryName }}院校</text>
      <view class="nav-placeholder"></view>
    </view>

    <scroll-view class="content" scroll-y="true">
      <!-- 国家信息卡片 -->
      <view class="country-card">
        <view class="country-header">
          <text class="country-flag">{{ getCountryFlag(countryCode) }}</text>
          <text class="country-name">{{ countryName }}</text>
        </view>
        <view class="country-stats">
          <view class="stat-item">
            <text class="stat-value">{{ universities.length }}</text>
            <text class="stat-label">所院校</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ popularMajors.length }}</text>
            <text class="stat-label">热门专业</text>
          </view>
        </view>
      </view>


      <!-- 院校列表 -->
      <view class="universities-list">
        <view
          class="university-item"
          v-for="uni in universities"
          :key="uni.id"
          @click="viewUniversityDetail(uni)"
        >
          <view class="uni-image-container">
            <image class="uni-image" :src="uni.image" mode="aspectFill"></image>
            <view class="uni-rank" v-if="uni.rank">
              <text>{{ uni.rank }}</text>
            </view>
          </view>
          <view class="uni-info">
            <text class="uni-name">{{ uni.name }}</text>
            <text class="uni-location">{{ uni.location }}</text>
            <view class="uni-tags">
              <view class="uni-tag" v-for="tag in uni.tags" :key="tag">
                <text>{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading">
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else-if="universities.length === 0">
        <text>暂无院校数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { countryAPI } from '../../api/index.js'

export default {
  data() {
    return {
      // 路由参数
      countryCode: '',
      countryName: '',
      // 院校数据
      universities: [],
      // 热门专业
      popularMajors: [],
      // 加载状态
      loading: false
    }
  },
  onLoad(options) {
    // 获取路由参数
    this.countryCode = options.country || ''
    this.countryName = options.countryName || ''

    // 加载院校数据
    this.getUniversitiesByCountry()
  },
  methods: {
    // 获取指定国家的院校列表
    async getUniversitiesByCountry() {
      this.loading = true
      try {
        const response = await countryAPI.getCountrySchools(this.countryCode)
        if (response.code === 0 && response.data && response.data.list) {
          this.universities = response.data.list.map(school => ({
            id: school.id,
            name: school.name_cn || school.name_en,
            name_en: school.name_en,
            location: `${this.getCountryName(school.country)} · ${school.city}`,
            rank: this.getRankDisplay(school),
            image: '/static/logo.jpeg',
            tags: this.getSchoolTags(school),
            qsRank: school.qsRank
          }))

          // 提取热门专业
          this.popularMajors = this.extractPopularMajors(response.data.list)
        } else {
          console.error('获取院校列表失败:', response.message)
          this.showError('获取院校列表失败')
        }
      } catch (error) {
        console.error('获取院校列表异常:', error)
        this.showError('网络请求失败，请检查网络连接')
      } finally {
        this.loading = false
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
        'FR': '🇫🇷',
        'LT': '🇱🇹'
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
        'FR': '法国',
        'LT': '立陶宛'
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
        'AU': '澳洲名校',
        'LT': '立陶宛名校'
      }
      if (countryTags[school.country]) {
        tags.push(countryTags[school.country])
      }

      return tags.length > 0 ? tags : ['知名院校']
    },

    // 提取热门专业
    extractPopularMajors(universities) {
      const majorCount = {}
      universities.forEach(uni => {
        if (uni.popular_majors && Array.isArray(uni.popular_majors)) {
          uni.popular_majors.forEach(major => {
            majorCount[major] = (majorCount[major] || 0) + 1
          })
        }
      })

      // 按出现次数排序，取前5个
      return Object.entries(majorCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([major]) => major)
    },

    // 查看院校详情
    viewUniversityDetail(uni) {
      uni.navigateTo({
        url: `/pages/university/detail?id=${uni.id}`
      })
    },

    // 返回上一页
    goBack() {
      uni.navigateBack()
    },

    // 显示错误提示
    showError(message) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    }
  }
}
</script>

<style scoped>
.university-container {
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
  padding-top: calc(var(--status-bar-height) + 32rpx);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.nav-back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-icon {
  font-size: 32rpx;
  font-weight: 700;
  color: #1A1A1A;
}

.header-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #1A1A1A;
  letter-spacing: -0.025em;
}

.nav-placeholder {
  width: 64rpx;
}

.content {
  flex: 1;
  padding: 32rpx 24rpx 120rpx;
  width: 100%;
  box-sizing: border-box;
}

/* 国家信息卡片 */
.country-card {
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.country-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.country-flag {
  font-size: 48rpx;
}

.country-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
}

.country-stats {
  display: flex;
  gap: 48rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 800;
  color: #006B5C;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #3C4A46;
}

/* 院校列表 */
.universities-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.university-item {
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.uni-image-container {
  position: relative;
  height: 240rpx;
  width: 100%;
}

.uni-image {
  width: 100%;
  height: 100%;
}

.uni-rank {
  position: absolute;
  top: 24rpx;
  left: 24rpx;
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

.uni-info {
  padding: 24rpx;
}

.uni-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 8rpx;
  display: block;
}

.uni-location {
  font-size: 24rpx;
  color: #3C4A46;
  margin-bottom: 16rpx;
  display: block;
}

.uni-tags {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
}

.uni-tag {
  background: rgba(0, 107, 92, 0.05);
  border-radius: 12rpx;
  padding: 6rpx 12rpx;
}

.uni-tag text {
  font-size: 20rpx;
  font-weight: 700;
  color: #006B5C;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48rpx;
  color: #94A3B8;
}
</style>