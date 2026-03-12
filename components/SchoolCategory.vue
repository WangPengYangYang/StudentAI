<template>
  <view class="school-category">
    <view class="category-header">
      <view :class="['category-badge', type]">
        <text class="badge-text">{{ title }}</text>
      </view>
      <text class="category-desc">{{ description }}</text>
    </view>
    <view class="school-list">
      <view
        v-for="school in schools"
        :key="school.school_id"
        class="school-card"
      >
        <view class="school-header">
          <text class="school-name">{{ school.school_name }}</text>
          <view :class="['school-type', school.match_type]">
            {{ getTypeText(school.match_type) }}
          </view>
        </view>
        <view class="school-info">
          <view class="info-item">
            <text class="info-label">匹配分数：</text>
            <text class="info-value">{{ formatMatchScore(school.match_score) }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">推荐理由：</text>
            <text class="info-value">{{ school.reason_brief }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">国家：</text>
            <text class="info-value">{{ getCountryName(school.country) }}</text>
          </view>
        </view>
        <view class="school-actions" @click="$emit('view-detail', school.school_id)">
          <text>详情</text>
          <text class="btn-icon">→</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'SchoolCategory',
  props: {
    schools: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      required: true,
      validator: (value) => ['reach', 'match', 'safe'].includes(value)
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  methods: {
    getTypeText(type) {
      const typeMap = {
        'reach': '冲刺',
        'match': '稳妥',
        'safe': '保底'
      };
      return typeMap[type] || type;
    },
    getCountryName(code) {
      const countryMap = {
        'US': '美国',
        'UK': '英国',
        'CA': '加拿大',
        'AU': '澳大利亚',
        'DE': '德国',
        'FR': '法国'
      };
      return countryMap[code] || code;
    },
    formatMatchScore(score) {
      return (score * 100).toFixed(0) + '%';
    }
  }
}
</script>

<style scoped>
.school-category {
  margin-bottom: 32rpx;
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.category-badge {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  margin-right: 16rpx;
}

.category-badge.reach {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
}

.category-badge.match {
  background: rgba(255, 217, 61, 0.1);
  color: #FFD93D;
}

.category-badge.safe {
  background: rgba(78, 205, 196, 0.1);
  color: #4ECDC4;
}

.badge-text {
  font-size: 24rpx;
  font-weight: 600;
}

.category-desc {
  font-size: 24rpx;
  color: #6B7280;
}

.school-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.school-card {
  background: #F8F9FA;
  border-radius: 16rpx;
  padding: 24rpx;
}

.school-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.school-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #191C1E;
}

.school-type {
  font-size: 24rpx;
  font-weight: 600;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.school-type.reach {
  background: rgba(255, 107, 107, 0.1);
  color: #FF6B6B;
}

.school-type.match {
  background: rgba(255, 217, 61, 0.1);
  color: #FFD93D;
}

.school-type.safe {
  background: rgba(78, 205, 196, 0.1);
  color: #4ECDC4;
}

.school-info {
  margin-bottom: 16rpx;
}

.info-item {
  display: flex;
  margin-bottom: 8rpx;
}

.info-label {
  font-size: 24rpx;
  color: #6B7280;
  min-width: 120rpx;
}

.info-value {
  font-size: 24rpx;
  color: #374151;
  flex: 1;
}

.school-actions {
  display: flex;
  justify-content: flex-start;
  gap: 16rpx;
  color: #00BFA5;
  font-size: 24rpx;
  cursor: pointer;
}
</style>