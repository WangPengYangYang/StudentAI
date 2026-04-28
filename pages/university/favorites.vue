<template>
  <view class="favorites-container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <view class="nav-back" @click="goBack">
          <text class="back-icon">‹</text>
        </view>
        <text class="nav-title">我的收藏院校</text>
      </view>
    </view>

    <scroll-view class="favorites-content" scroll-y="true" :style="{paddingBottom: safeAreaBottom}">
      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 空状态 -->
      <view v-else-if="favorites.length === 0" class="empty-state">
        <view class="empty-icon">⭐</view>
        <text class="empty-title">暂无收藏院校</text>
        <text class="empty-desc">您还没有收藏任何院校</text>
        <button class="empty-btn" @click="browseSchools">去浏览院校</button>
      </view>

      <!-- 收藏列表 -->
      <view v-else class="favorites-list">
        <view class="list-header">
          <text class="list-title">收藏院校</text>
          <text class="list-count">共{{ favorites.length }}所院校</text>
        </view>

        <view v-for="favorite in favorites" :key="favorite.id" class="favorite-card" @click="viewSchoolDetail(favorite.school_id)">
          <view class="card-content">
            <view class="school-info">
              <text class="school-name">{{ favorite.school_name_cn || favorite.school_name }}</text>
              <text class="school-en-name">{{ favorite.name_en }}</text>
              <view class="school-meta">
                <text class="country">{{ getCountryName(favorite.country) }}</text>
                <text class="separator">•</text>
                <text class="rank" v-if="favorite.qsRank > 0">QS排名: {{ favorite.qsRank }}</text>
                <text class="rank" v-else-if="favorite.theRank > 0">THE排名: {{ favorite.theRank }}</text>
                <text class="rank" v-else>暂无排名</text>
              </view>
            </view>
            <view class="favorite-info">
              <text class="favorite-date">收藏于 {{ formatDate(favorite.favorited_at) }}</text>
              <view class="favorite-action" @click.stop="unfavoriteSchool(favorite.school_id, favorite.id)">
                <text class="unfavorite-text">取消收藏</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { schoolAPI } from '@/api/index.js'

export default {
  data() {
    return {
      safeAreaBottom: '120rpx',
      loading: false,
      favorites: []
    }
  },
  onLoad() {
    this.calculateSafeArea()
    this.loadFavorites()
  },
  onShow() {
    // 页面显示时重新加载收藏列表
    this.loadFavorites()
  },
  methods: {
    calculateSafeArea() {
      const systemInfo = uni.getSystemInfoSync()
      const safeArea = systemInfo.safeArea
      if (safeArea) {
        const bottom = systemInfo.screenHeight - safeArea.bottom
        this.safeAreaBottom = bottom + 120 + 'rpx'
      }
    },

    async loadFavorites() {
      this.loading = true
      try {
        const response = await schoolAPI.getFavorites(1, 50)
        if (response.code === 0 && response.data) {
          this.favorites = response.data.list || []
        } else {
          console.error('获取收藏列表失败:', response.message)
          uni.showToast({ title: '获取收藏列表失败', icon: 'none' })
        }
      } catch (error) {
        console.error('获取收藏列表异常:', error)
        uni.showToast({ title: '网络请求失败，请检查网络连接', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    async unfavoriteSchool(schoolId, favoriteId) {
      uni.showModal({
        title: '确认取消收藏',
        content: '确定要取消收藏该院校吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await schoolAPI.unfavoriteSchool(schoolId)
              if (response.code === 0) {
                uni.showToast({ title: '取消收藏成功', icon: 'success' })
                // 从列表中移除
                this.favorites = this.favorites.filter(fav => fav.id !== favoriteId)
              } else {
                uni.showToast({ title: response.message || '取消收藏失败', icon: 'none' })
              }
            } catch (error) {
              console.error('取消收藏异常:', error)
              uni.showToast({ title: '操作失败，请重试', icon: 'none' })
            }
          }
        }
      })
    },

    viewSchoolDetail(schoolId) {
      uni.navigateTo({
        url: `/pages/university/detail?id=${schoolId}`
      })
    },

    browseSchools() {
      uni.switchTab({
        url: '/pages/home/home'
      })
    },

    goBack() {
      uni.navigateBack()
    },

    getCountryName(countryCode) {
      const countryMap = {
        'US': '美国',
        'UK': '英国',
        'CA': '加拿大',
        'AU': '澳大利亚',
        'SG': '新加坡',
        'HK': '中国香港',
        'CN': '中国',
        'JP': '日本',
        'KR': '韩国',
        'DE': '德国',
        'FR': '法国',
        'NL': '荷兰',
        'CH': '瑞士',
        'SE': '瑞典'
      }
      return countryMap[countryCode] || countryCode
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = now.getTime() - date.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return '今天'
      } else if (diffDays === 1) {
        return '昨天'
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
      }
    }
  }
}
</script>

<style scoped>
.favorites-container {
  flex: 1;
  background: linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 100%);
  min-height: 100vh;
}

/* 导航栏样式 */
.nav-bar {
  background: #FFFFFF;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  padding: 32rpx 48rpx;
  backdrop-filter: blur(20rpx);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.nav-back {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #F1F5F9;
  transition: background-color 0.2s ease;
}

.nav-back:active {
  background: #E2E8F0;
}

.back-icon {
  font-size: 36rpx;
  color: #64748B;
  font-weight: bold;
  margin-top: -4rpx;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
  font-family: 'WenQuanYi Zen Hei';
}

/* 内容区域 */
.favorites-content {
  flex: 1;
  padding: 0 24rpx 32rpx;
  box-sizing: border-box;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #F1F5F9;
  border-top: 4rpx solid #00BFA5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #64748B;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 48rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
  opacity: 0.3;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #191C1E;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #64748B;
  margin-bottom: 48rpx;
  line-height: 1.6;
}

.empty-btn {
  background: linear-gradient(135deg, #00BFA5 0%, #006B5C 100%);
  color: #FFFFFF;
  padding: 24rpx 48rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(0, 191, 165, 0.3);
}

.empty-btn:active {
  transform: translateY(1rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 191, 165, 0.2);
}

/* 收藏列表 */
.favorites-list {
  margin-top: 32rpx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 8rpx;
}

.list-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #191C1E;
}

.list-count {
  font-size: 24rpx;
  color: #64748B;
}

/* 收藏卡片 */
.favorite-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.favorite-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.school-info {
  flex: 1;
}

.school-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #191C1E;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.school-en-name {
  font-size: 26rpx;
  color: #64748B;
  display: block;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.school-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.country {
  font-size: 24rpx;
  color: #00BFA5;
  background: rgba(0, 191, 165, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 600;
}

.separator {
  font-size: 24rpx;
  color: #CBD5E1;
}

.rank {
  font-size: 24rpx;
  color: #64748B;
  background: #F1F5F9;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.favorite-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid #F1F5F9;
}

.favorite-date {
  font-size: 22rpx;
  color: #94A3B8;
}

.favorite-action {
  padding: 8rpx 16rpx;
  background: rgba(239, 68, 68, 0.1);
  border: 1rpx solid rgba(239, 68, 68, 0.2);
  border-radius: 16rpx;
  transition: all 0.2s ease;
}

.favorite-action:active {
  background: rgba(239, 68, 68, 0.2);
}

.unfavorite-text {
  font-size: 22rpx;
  color: #EF4444;
  font-weight: 600;
}
</style>