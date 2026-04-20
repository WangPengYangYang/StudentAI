<template>
  <view class="detail-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <view class="back-button" @click="goBack">
          <text class="back-icon">←</text>
          <text class="back-text">返回</text>
        </view>
        <text class="nav-title">院校详情</text>
        <view class="nav-right"></view>
      </view>
    </view>

    <!-- 院校头部信息 -->
    <view class="university-header">
      <view class="university-image-large">
        <view class="uni-placeholder-large">{{ universityInfo.shortName }}</view>
      </view>
      <view class="header-info">
        <text class="uni-name-large">{{ universityInfo.name }}</text>
        <text class="uni-location">{{ universityInfo.location }}</text>
        <view class="ranking-info">
          <text class="ranking-label">QS排名</text>
          <text class="ranking-value">{{ universityInfo.ranking }}</text>
        </view>
      </view>
    </view>

    <!-- 专业信息 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">推荐专业</text>
      </view>
      <view class="major-info">
        <text class="major-name">{{ universityInfo.major }}</text>
        <text class="major-desc">{{ universityInfo.majorDesc }}</text>
      </view>
    </view>

    <!-- 匹配原因 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">匹配原因</text>
      </view>
      <view class="match-reasons">
        <view class="reason-item" v-for="(reason, index) in universityInfo.reasons" :key="index">
          <text class="reason-icon">✓</text>
          <text class="reason-text">{{ reason }}</text>
        </view>
      </view>
    </view>

    <!-- 学校简介 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">学校简介</text>
      </view>
      <text class="description">{{ universityInfo.description }}</text>
    </view>

    <!-- 申请要求 -->
    <view class="section-card">
      <view class="section-header">
        <text class="section-title">申请要求</text>
      </view>
      <view class="requirements">
        <view class="requirement-item">
          <text class="req-label">GPA要求</text>
          <text class="req-value">{{ universityInfo.gpaRequirement }}</text>
        </view>
        <view class="requirement-item">
          <text class="req-label">语言要求</text>
          <text class="req-value">{{ universityInfo.languageRequirement }}</text>
        </view>
        <view class="requirement-item">
          <text class="req-label">GRE要求</text>
          <text class="req-value">{{ universityInfo.greRequirement }}</text>
        </view>
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
</template>

<script>
export default {
  data() {
    return {
      universityId: '',
      isFavorite: false,
      universities: {
        harvard: {
          name: '哈佛大学',
          shortName: '哈佛',
          location: '美国，马萨诸塞州，剑桥',
          ranking: '#4',
          major: '数据科学理学硕士',
          majorDesc: '这是一个跨学科项目，结合计算机科学、统计学和领域专业知识',
          reasons: [
            '顶级科研实力与您的学术背景高度匹配',
            '数据科学领域全球领先的研究资源',
            '丰富的校友网络和就业机会'
          ],
          description: '哈佛大学是美国最古老的高等学府，常春藤盟校成员。学校拥有世界顶尖的师资力量和科研设施，在数据科学、计算机科学等领域享有盛誉。',
          gpaRequirement: '3.7+',
          languageRequirement: 'TOEFL 100+ / IELTS 7.5+',
          greRequirement: '推荐提交'
        },
        stanford: {
          name: '斯坦福大学',
          shortName: '斯坦福',
          location: '美国，加利福尼亚州，斯坦福',
          ranking: '#3',
          major: '人工智能硕士',
          majorDesc: '专注于人工智能和机器学习的前沿研究与应用',
          reasons: [
            '硅谷核心地理位置，科技资源丰富',
            '卓越的创新背景与您的项目经验契合',
            'AI领域全球顶尖的研究团队'
          ],
          description: '斯坦福大学是世界著名的私立研究型大学，位于硅谷中心。学校在人工智能、计算机科学等领域处于全球领先地位，培养了众多科技企业家和创新者。',
          gpaRequirement: '3.8+',
          languageRequirement: 'TOEFL 100+ / IELTS 7.5+',
          greRequirement: '可选'
        },
        ucl: {
          name: '伦敦大学学院',
          shortName: 'UCL',
          location: '英国，伦敦',
          ranking: '#9',
          major: '商业分析理学硕士',
          majorDesc: '结合数据分析与商业策略，培养数据驱动决策能力',
          reasons: [
            '符合您的GPA成绩要求',
            '商业分析领域全英领先',
            '伦敦金融城就业优势明显'
          ],
          description: '伦敦大学学院是英国顶尖的综合性大学，G5超级精英大学成员。学校在商业分析、数据科学等领域拥有强大的研究实力和行业联系。',
          gpaRequirement: '3.5+',
          languageRequirement: 'TOEFL 92+ / IELTS 7.0+',
          greRequirement: '不要求'
        },
        toronto: {
          name: '多伦多大学',
          shortName: '多大',
          location: '加拿大，安大略省，多伦多',
          ranking: '#21',
          major: '信息硕士',
          majorDesc: '信息科学与数据管理的综合专业',
          reasons: [
            '该领域强大的校友资源网络',
            '加拿大顶尖学府，声誉卓著',
            '信息科学领域研究实力强'
          ],
          description: '多伦多大学是加拿大顶尖的研究型大学，在信息科学、人工智能等领域享有国际声誉。学校拥有多元文化的学习环境和广泛的行业合作。',
          gpaRequirement: '3.3+',
          languageRequirement: 'TOEFL 93+ / IELTS 7.0+',
          greRequirement: '不要求'
        },
        purdue: {
          name: '普渡大学',
          shortName: '普渡',
          location: '美国，印第安纳州，西拉法叶',
          ranking: '#99',
          major: '计算机科学理学硕士',
          majorDesc: '计算机科学核心理论与实践的深度结合',
          reasons: [
            '与您的背景高度契合',
            '高性价比的留学选择',
            '计算机科学领域传统强校'
          ],
          description: '普渡大学是美国著名的公立研究型大学，工程学院和计算机科学学院享誉全美。学校提供高质量的教育资源和相对合理的留学成本。',
          gpaRequirement: '3.0+',
          languageRequirement: 'TOEFL 80+ / IELTS 6.5+',
          greRequirement: '可选'
        }
      }
    }
  },
  computed: {
    universityInfo() {
      return this.universities[this.universityId] || this.universities.harvard
    }
  },
  onLoad(options) {
    if (options.name) {
      this.universityId = options.name
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    toggleFavorite() {
      this.isFavorite = !this.isFavorite
      uni.showToast({
        title: this.isFavorite ? '已收藏' : '已取消收藏',
        icon: 'none'
      })
    },
    consultAI() {
      uni.switchTab({
        url: '/pages/chat/chat'
      })
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

/* 导航栏 */
.nav-bar {
  background: #FFFFFF;
  padding: 32rpx 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.back-icon {
  font-size: 32rpx;
  color: #191C1E;
}

.back-text {
  font-size: 28rpx;
  color: #191C1E;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #191C1E;
}

.nav-right {
  width: 80rpx;
}

/* 院校头部 */
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

.header-info {
  flex: 1;
}

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

/* 区块卡片 */
.section-card {
  background: #FFFFFF;
  margin: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #191C1E;
}

/* 专业信息 */
.major-info {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.major-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #006B5C;
}

.major-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.6;
}

/* 匹配原因 */
.match-reasons {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.reason-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.reason-icon {
  color: #00BFA5;
  font-size: 28rpx;
  margin-top: 4rpx;
}

.reason-text {
  font-size: 26rpx;
  color: #333333;
  line-height: 1.6;
}

/* 描述 */
.description {
  font-size: 26rpx;
  color: #333333;
  line-height: 1.8;
}

/* 申请要求 */
.requirements {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.requirement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #F0F0F0;
}

.requirement-item:last-child {
  border-bottom: none;
}

.req-label {
  font-size: 26rpx;
  color: #666666;
}

.req-value {
  font-size: 26rpx;
  color: #191C1E;
  font-weight: 500;
}

/* 底部按钮 */
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