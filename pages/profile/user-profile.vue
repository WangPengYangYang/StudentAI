<template>
  <view class="user-profile-container">
    <!-- 简化导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @click="goBack">‹</view>
    </view>

    <scroll-view class="profile-content" scroll-y="true" :style="{paddingBottom: safeAreaBottom}">
      <!-- 生成选校方案按钮 -->
      <view class="school-plan-card" @click="generateSchoolPlan">
        <view class="plan-content">
          <view class="plan-icon">🎓</view>
          <view class="plan-info">
            <text class="plan-title">生成选校方案</text>
            <text class="plan-desc">基于您的完整资料，为您推荐最适合的院校</text>
            <view class="plan-tag">立即生成</view>
          </view>
          <view class="plan-arrow">›</view>
        </view>
      </view>
      <!-- 基本信息卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">基本信息</text>
          <view class="edit-button" @click="navigateToEdit">编辑</view>
        </view>
        <view class="info-grid">
          <view v-for="item in basicInfo" :key="item.label" class="info-item">
            <text class="info-label">{{item.label}}</text>
            <text class="info-value">{{item.value || '未填写'}}</text>
          </view>
        </view>
      </view>

      <!-- 语言能力卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">语言能力</text>
        </view>
        <view class="language-grid">
          <view v-for="score in languageScores" :key="score.type" class="language-item">
            <text class="language-label">{{score.label}}</text>
            <text class="language-score">{{score.value}}分</text>
          </view>
          <view v-if="!languageScores.length" class="no-data">
            <text class="no-data-text">暂无语言成绩</text>
          </view>
        </view>
      </view>

      <!-- 经历卡片 -->
      <view v-if="hasExperiences" class="info-card">
        <view class="card-header">
          <text class="card-title">科研实习经历</text>
        </view>
        <view v-for="section in experienceSections" :key="section.type" class="experience-section">
          <text class="section-subtitle">{{section.title}}</text>
          <view v-for="item in section.items" :key="item.id" class="experience-item">
            <text class="experience-title">{{item.title}}</text>
            <text class="experience-duration">{{item.duration}}</text>
            <text v-if="item.description" class="experience-description">{{item.description}}</text>
          </view>
        </view>
      </view>

      <!-- 意向偏好卡片 -->
      <view class="info-card">
        <view class="card-header">
          <text class="card-title">意向偏好</text>
        </view>
        <view class="preference-grid">
          <view v-for="pref in preferences" :key="pref.label"
                :class="['preference-item', { 'full-width': pref.fullWidth }]">
            <text class="preference-label">{{pref.label}}</text>
            <view v-if="pref.tags" class="preference-values">
              <text v-for="tag in pref.tags" :key="tag" class="preference-tag">{{tag}}</text>
              <text v-if="!pref.tags.length" class="no-data-text">未选择</text>
            </view>
            <text v-else class="preference-value">{{pref.value || '未选择'}}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { profileAPI } from "@/api/index.js";

// 常量映射定义
const MAPPINGS = {
  education: { bachelor: '本科', master: '硕士', phd: '博士' },
  countries: {
    US: '美国', UK: '英国', CA: '加拿大', AU: '澳大利亚',
    SG: '新加坡', HK: '香港', JP: '日本', DE: '德国',
    FR: '法国', NL: '荷兰', CH: '瑞士'
  },
  languageTypes: {
    toefl: '托福', ielts: '雅思', gre: 'GRE', gmat: 'GMAT'
  }
};

export default {
  data() {
    return {
      safeAreaBottom: '40rpx',
      profileData: {}
    };
  },
  computed: {
    // 基本信息计算
    basicInfo() {
      const { profileData } = this;
      return [
        { label: '学历', value: MAPPINGS.education[profileData.education_level] },
        { label: '毕业院校', value: profileData.school_name },
        { label: '专业', value: profileData.major },
        {
          label: 'GPA',
          value: profileData.gpa ? `${profileData.gpa} (${profileData.gpa_scale})` : null
        }
      ];
    },

    // 语言成绩计算
    languageScores() {
      const { profileData } = this;
      return Object.entries(MAPPINGS.languageTypes)
        .filter(([key]) => profileData[key])
        .map(([key, label]) => ({
          type: key,
          label,
          value: profileData[key]
        }));
    },

    // 经历数据计算
    experienceSections() {
      const { profileData } = this;
      const sections = [];

      if (profileData.internships?.length) {
        sections.push({
          type: 'internships',
          title: '实习经历',
          items: profileData.internships.map((item, index) => ({
            id: `internship-${index}`,
            title: `${item.company} - ${item.position}`,
            duration: `${item.duration_months}个月`,
            description: item.description
          }))
        });
      }

      if (profileData.research?.length) {
        sections.push({
          type: 'research',
          title: '科研经历',
          items: profileData.research.map((item, index) => ({
            id: `research-${index}`,
            title: `${item.title} - ${item.role}`,
            duration: `${item.duration_months}个月`,
            description: item.description
          }))
        });
      }

      if (profileData.awards?.length) {
        sections.push({
          type: 'awards',
          title: '获奖经历',
          items: profileData.awards.map((item, index) => ({
            id: `award-${index}`,
            title: item.name,
            duration: `${item.level} - ${item.year}年`
          }))
        });
      }

      return sections;
    },

    // 偏好数据计算
    preferences() {
      const { profileData } = this;
      return [
        {
          label: '目标国家',
          tags: profileData.target_countries?.map(code => MAPPINGS.countries[code] || code) || [],
          value: null
        },
        {
          label: '目标专业',
          tags: profileData.target_majors || [],
          value: null
        },
        {
          label: '目标学位',
          value: MAPPINGS.education[profileData.target_degree]
        },
        {
          label: '预算范围',
          value: profileData.budget_range
        },
        {
          label: '职业目标',
          value: profileData.career_goal,
          fullWidth: true
        }
      ].filter(pref => pref.tags?.length || pref.value);
    },

    // 是否有经历数据
    hasExperiences() {
      const { profileData } = this;
      return ['internships', 'research', 'awards'].some(
        key => profileData[key]?.length > 0
      );
    }
  },
  onLoad() {
    this.calculateSafeArea();
    this.loadProfileData();
  },
  onShow() {
    this.loadProfileData();
  },
  methods: {
    calculateSafeArea() {
      const systemInfo = uni.getSystemInfoSync();
      const safeArea = systemInfo.safeArea;
      if (safeArea) {
        const bottom = systemInfo.screenHeight - safeArea.bottom;
        this.safeAreaBottom = bottom + 40 + 'rpx';
      }
    },

    goBack() {
      uni.navigateBack();
    },

    navigateToEdit() {
      uni.navigateTo({ url: '/pages/profile/create-profile' });
    },

    generateSchoolPlan() {
      uni.setStorageSync('quickMessage', '请基于我的个人背景，帮我生成一份选校方案');
      uni.switchTab({ url: '/pages/chat/chat' });
    },

    async loadProfileData() {
      try {
        const [profileResponse] = await Promise.all([profileAPI.getProfile()]);

        if (profileResponse.code === 0 && profileResponse.data) {
          this.profileData = profileResponse.data.profile || {};
        }
      } catch (error) {
        console.error('加载用户画像数据失败:', error);
        uni.showToast({ title: '加载数据失败', icon: 'none' });
      }
    }
  }
}
</script>

<style scoped>

.user-profile-container {
  flex: 1;
  background: linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 100%);
  min-height: 100vh;
}

/* 简化导航栏 */
.nav-bar {
  background-color: #fff;
  padding: 32rpx 48rpx;
  padding-top: calc(var(--status-bar-height) + 32rpx);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
}

.nav-back, .nav-edit {
  font-size: 40rpx;
  color: #006B5C;
  font-weight: bold;
  padding: 8rpx;
  transition: transform 0.2s ease;
}

.nav-back:active, .nav-edit:active {
  transform: scale(0.9);
}

.nav-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
}

/* 内容区域 */
.profile-content {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
}

/* 通用卡片样式 */
.info-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #191C1E;
}

.edit-button {
  font-size: 26rpx;
  color: #006B5C;
  background: rgba(0, 107, 92, 0.1);
  padding: 12rpx 24rpx;
  border-radius: 12rpx;
  font-weight: 600;
  transition: all 0.2s ease;
}

.edit-button:active {
  background: rgba(0, 107, 92, 0.2);
  transform: scale(0.95);
}

/* 网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.language-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
  gap: 16rpx;
}

.preference-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 通用项目样式 */
.info-item, .preference-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-item {
  align-items: flex-start;
}

.preference-item {
  align-items: flex-start;
  gap: 16rpx;
}

.preference-item.full-width {
  flex-direction: column;
  gap: 12rpx;
}

/* 标签和文本样式 */
.info-label, .preference-label {
  font-size: 26rpx;
  color: #64748B;
  font-weight: 600;
}

.preference-label {
  min-width: 120rpx;
}

.info-value, .preference-value {
  font-size: 28rpx;
  color: #191C1E;
  font-weight: 700;
  line-height: 1.4;
}

.preference-value {
  font-size: 26rpx;
  flex: 1;
}

/* 标签样式 */
.language-item, .preference-tag {
  background: linear-gradient(135deg, rgba(0, 191, 165, 0.1) 0%, rgba(0, 107, 92, 0.1) 100%);
  border: 1rpx solid rgba(0, 191, 165, 0.2);
  color: #006B5C;
  border-radius: 16rpx;
  padding: 24rpx;
  text-align: center;
}

.language-item {
  font-size: 28rpx;
  font-weight: 800;
}

.preference-tag {
  font-size: 22rpx;
  font-weight: 600;
  padding: 8rpx 16rpx;
  border-radius: 9999rpx;
}

.language-label {
  font-size: 24rpx;
  color: #64748B;
  font-weight: 600;
  display: block;
  margin-bottom: 8rpx;
}

.preference-values {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

/* 经历部分 */
.experience-section {
  margin-bottom: 24rpx;
}

.section-subtitle {
  font-size: 28rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 16rpx;
  display: block;
}

.experience-item {
  background: #F8FAFC;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  border: 1rpx solid #E2E8F0;
}

.experience-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 8rpx;
  display: block;
}

.experience-duration, .experience-description {
  font-size: 24rpx;
  color: #64748B;
  margin-bottom: 12rpx;
  display: block;
}

.experience-description {
  line-height: 1.5;
}

/* 无数据状态 */
.no-data {
  text-align: center;
  padding: 40rpx;
}

.no-data-text {
  font-size: 26rpx;
  color: #94A3B8;
  font-style: italic;
}

/* 生成选校方案卡片 */
.school-plan-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%);
  border-radius: 28rpx;
  padding: 36rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 191, 165, 0.12);
  border: 1rpx solid rgba(0, 191, 165, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 24rpx;
}

.school-plan-card:active {
  transform: translateY(2rpx);
  box-shadow: 0 6rpx 24rpx rgba(0, 191, 165, 0.15);
}

.plan-content {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.plan-icon {
  width: 72rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #00BFA5 0%, #006B5C 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #FFFFFF;
  box-shadow: 0 6rpx 16rpx rgba(0, 191, 165, 0.4);
}

.plan-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.plan-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #191C1E;
  letter-spacing: 0.5rpx;
}

.plan-desc {
  font-size: 26rpx;
  color: #64748B;
  font-weight: 500;
  line-height: 1.4;
}

.plan-tag {
  background: linear-gradient(135deg, rgba(0, 191, 165, 0.1) 0%, rgba(0, 107, 92, 0.1) 100%);
  color: #00BFA5;
  font-size: 22rpx;
  font-weight: 700;
  padding: 6rpx 16rpx;
  border-radius: 9999rpx;
  align-self: flex-start;
  margin-top: 6rpx;
  border: 1rpx solid rgba(0, 191, 165, 0.2);
}

.plan-arrow {
  font-size: 40rpx;
  color: #00BFA5;
  font-weight: bold;
  transition: transform 0.2s ease;
}

.school-plan-card:active .plan-arrow {
  transform: translateX(4rpx);
}
</style>