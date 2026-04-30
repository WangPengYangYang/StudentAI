<template>
  <view class="create-profile-container">
    <!-- 顶部导航栏 -->
    <view class="page-header page-header--sticky">
      <view class="page-header__content">
        <view class="page-header__left" @click="goBack">
          <image class="page-header__back-icon" src="/static/left.png" mode="aspectFit"></image>
        </view>
        <view class="page-header__center">
          <text class="page-header__title">完善个人信息</text>
        </view>
        <view class="page-header__right"></view>
      </view>
    </view>

    <!-- 步骤指示器 -->
    <view class="step-indicator">
      <view v-for="step in steps" :key="step.id" class="step-item" :class="{active: currentStep === step.id}">
        <view class="step-number">{{step.id}}</view>
        <text class="step-text">{{step.title}}</text>
        <view v-if="step.id < 4" class="step-line"></view>
      </view>
    </view>

    <scroll-view class="form-content" scroll-y="true" :style="{paddingBottom: safeAreaBottom}">
      <!-- 第1步：学术背景 -->
      <view v-if="currentStep === 1" class="step-content">
        <view class="form-section">
          <text class="section-title">学术背景</text>

          <!-- 学历选择 -->
          <view class="form-item">
            <text class="item-label">学历</text>
            <picker mode="selector" :range="educationLevels" @change="onEducationLevelChange" class="item-picker">
              <view class="picker-value">{{getEducationLevelDisplay() || '请选择学历'}}</view>
            </picker>
          </view>

          <!-- 毕业院校 -->
          <view class="form-item">
            <text class="item-label">毕业院校</text>
            <input class="item-input" placeholder="请输入您的毕业院校" v-model="formData.schoolName" />
            <view class="tag-group">
              <text v-for="rank in schoolRanks" :key="rank.value"
                class="tag-item"
                :class="{active: formData.schoolRank === rank.value}"
                @click="selectSchoolRank(rank.value)">
                {{rank.label}}
              </text>
            </view>
          </view>

          <!-- 专业 -->
          <view class="form-item">
            <text class="item-label">专业</text>
            <input class="item-input" placeholder="请输入您的专业" v-model="formData.major" />
          </view>

          <!-- GPA -->
          <view class="form-item">
            <text class="item-label">平均学分绩点 (GPA)</text>
            <input class="item-input" type="digit" placeholder="例如: 3.5" v-model="formData.gpa" />
          </view>

          <!-- GPA评分标准 -->
          <view class="form-item">
            <text class="item-label">GPA 评分标准</text>
            <picker mode="selector" :range="gpaScales" @change="onGpaScaleChange" class="item-picker">
              <view class="picker-value">{{formData.gpaScale || '请选择评分标准'}}</view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 第2步：语言标化考试 -->
      <view v-if="currentStep === 2" class="step-content">
        <view class="form-section">
          <text class="section-title">语言标化考试</text>

          <view v-for="exam in languageExams" :key="exam.key" class="form-item">
            <text class="item-label">{{exam.label}}</text>
            <input class="item-input" type="digit" :placeholder="exam.placeholder" v-model="formData[exam.key]" />
          </view>

          <view class="form-note">
            <text class="note-text">注：至少填写一项成绩，如未参加考试可留空</text>
          </view>
        </view>
      </view>

      <!-- 第3步：科研实习经历 -->
      <view v-if="currentStep === 3" class="step-content">
        <view class="form-section">
          <text class="section-title">科研实习经历</text>

          <view v-for="section in experienceSections" :key="section.type" class="experience-section">
            <view class="section-header">
              <text class="section-subtitle">{{section.title}}</text>
              <button class="add-button" @click="handleAddExperience(section.type)">+ 添加{{section.title}}</button>
            </view>

            <view v-for="(item, index) in formData[section.itemsKey]" :key="index" class="experience-item">
              <view class="experience-header">
                <text class="experience-title">{{section.title}} {{index + 1}}</text>
                <text class="delete-button" @click="handleDeleteExperience(section.type, index)">删除</text>
              </view>

              <view v-for="field in section.fields" :key="field.key" class="form-item">
                <text class="item-label">{{field.label}}</text>
                <textarea
                  v-if="field.type === 'textarea'"
                  class="item-input"
                  :placeholder="field.placeholder"
                  v-model="item[field.key]"
                />
                <input
                  v-else
                  class="item-input"
                  :type="field.type === 'number' ? 'number' : 'text'"
                  :placeholder="field.placeholder"
                  v-model="item[field.key]"
                />
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 第4步：意向偏好 -->
      <view v-if="currentStep === 4" class="step-content">
        <view class="form-section">
          <text class="section-title">意向偏好</text>

          <!-- 目标国家 -->
          <view class="form-item">
            <text class="item-label">目标国家/地区</text>
            <view class="chip-group">
              <view v-for="country in targetCountries" :key="country.code"
                class="chip-item"
                :class="{active: formData.targetCountries.includes(country.code)}"
                @click="toggleTargetCountry(country.code)">
                <text class="chip-text">{{country.name}}</text>
              </view>
            </view>
          </view>

          <!-- 目标专业 -->
          <view class="form-item">
            <text class="item-label">目标专业</text>
            <view class="chip-group">
              <view v-for="major in targetMajors" :key="major"
                class="chip-item"
                :class="{active: formData.targetMajors.includes(major)}"
                @click="toggleTargetMajor(major)">
                <text class="chip-text">{{major}}</text>
              </view>
            </view>
          </view>

          <!-- 目标学位 -->
          <view class="form-item">
            <text class="item-label">目标学位</text>
            <view class="radio-group">
              <view v-for="option in degreeOptions" :key="option.value"
                class="radio-option"
                :class="{active: formData.targetDegree === option.value}"
                @click="selectTargetDegree(option.value)">
                <text class="radio-text">{{option.label}}</text>
              </view>
            </view>
          </view>

          <!-- 预算范围 -->
          <view class="form-item">
            <text class="item-label">预算范围</text>
            <view class="radio-group">
              <view v-for="option in budgetOptions" :key="option.value"
                class="radio-option"
                :class="{active: formData.budgetRange === option.value}"
                @click="selectBudgetRange(option.value)">
                <text class="radio-text">{{option.label}}</text>
              </view>
            </view>
          </view>

          <!-- 职业目标 -->
          <view class="form-item">
            <text class="item-label">职业目标</text>
            <textarea class="item-textarea" placeholder="请简要描述您的职业规划和发展目标" v-model="formData.careerGoal" />
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-section">
        <view class="button-group">
          <button v-if="currentStep > 1" class="prev-button" @click="prevStep">上一步</button>
          <button v-if="currentStep < 4" class="next-button" @click="nextStep">下一步</button>
          <button v-if="currentStep === 4" class="submit-button" @click="submitProfile">完成</button>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { profileAPI } from '../../api/index.js'

export default {
  data() {
    return {
      safeAreaBottom: '40rpx',
      currentStep: 1,
      isLoading: false,
      formData: this.getInitialFormData(),
      steps: [
        { id: 1, title: '学术背景' },
        { id: 2, title: '语言能力' },
        { id: 3, title: '个人经历' },
        { id: 4, title: '意向偏好' }
      ],
      schoolRanks: [
        { value: 1, label: '985' },
        { value: 2, label: '211' },
        { value: 3, label: '双一流' }
      ],
      languageExams: [
        { key: 'toefl', label: '托福成绩', placeholder: '请输入托福总分（0-120）' },
        { key: 'ielts', label: '雅思成绩', placeholder: '请输入雅思总分（0-9）' },
        { key: 'gre', label: 'GRE成绩', placeholder: '请输入GRE总分（260-340）' },
        { key: 'gmat', label: 'GMAT成绩', placeholder: '请输入GMAT总分（200-800）' }
      ],
      experienceSections: [
        {
          type: 'internship',
          title: '实习经历',
          itemsKey: 'internships',
          fields: [
            { key: 'company', label: '公司名称', placeholder: '请输入公司名称' },
            { key: 'position', label: '职位', placeholder: '请输入您的职位' },
            { key: 'durationMonths', label: '持续时间（月）', placeholder: '请输入实习月数', type: 'number' },
            { key: 'description', label: '工作描述', placeholder: '请简要描述您的工作内容和成果', type: 'textarea' }
          ]
        },
        {
          type: 'research',
          title: '科研经历',
          itemsKey: 'research',
          fields: [
            { key: 'title', label: '项目名称', placeholder: '请输入项目名称' },
            { key: 'role', label: '担任角色', placeholder: '请输入您在项目中的角色' },
            { key: 'durationMonths', label: '持续时间（月）', placeholder: '请输入项目月数', type: 'number' },
            { key: 'description', label: '项目描述', placeholder: '请简要描述您的研究内容和成果', type: 'textarea' }
          ]
        },
        {
          type: 'award',
          title: '获奖经历',
          itemsKey: 'awards',
          fields: [
            { key: 'name', label: '奖项名称', placeholder: '请输入奖项名称' },
            { key: 'level', label: '奖项级别', placeholder: '例如：国家级、省级、校级' },
            { key: 'year', label: '获奖年份', placeholder: '请输入获奖年份', type: 'number' }
          ]
        }
      ],
      targetCountries: [
        { code: 'US', name: '美国' }, { code: 'UK', name: '英国' }, { code: 'CA', name: '加拿大' },
        { code: 'AU', name: '澳大利亚' }, { code: 'SG', name: '新加坡' }, { code: 'HK', name: '香港' },
        { code: 'JP', name: '日本' }, { code: 'DE', name: '德国' }, { code: 'FR', name: '法国' },
        { code: 'NL', name: '荷兰' }, { code: 'CH', name: '瑞士' }
      ],
      targetMajors: [
        '计算机科学', '人工智能', '数据科学', '商业分析', '金融', '市场营销',
        '工程管理', '机械工程', '电子工程', '土木工程', '生物医学', '法律',
        '教育', '心理学', '传媒', '艺术与设计'
      ],
      educationLevels: ['本科', '硕士', '博士'],
      gpaScales: ['4.0 分制', '5.0 分制', '100 分制'],
      degreeOptions: [
        { value: 'bachelor', label: '本科' },
        { value: 'master', label: '硕士' },
        { value: 'phd', label: '博士' }
      ],
      budgetOptions: [
        { value: '20w以下/year', label: '20万以下/年' },
        { value: '20-30w/year', label: '20-30万/年' },
        { value: '30-50w/year', label: '30-50万/年' },
        { value: '50w以上/year', label: '50万以上/年' }
      ]
    };
  },
  onLoad() {
    this.calculateSafeArea();
    this.loadUserData();
  },
  methods: {
    getInitialFormData() {
      return {
        educationLevel: '', schoolName: '', schoolRank: null, major: '', gpa: '', gpaScale: '',
        toefl: '', ielts: '', gre: '', gmat: '',
        internships: [], research: [], awards: [],
        targetCountries: [], targetMajors: [], targetDegree: '', budgetRange: '', careerGoal: ''
      };
    },

    calculateSafeArea() {
      const systemInfo = uni.getSystemInfoSync();
      const safeArea = systemInfo.safeArea;
      if (safeArea) {
        const bottom = systemInfo.screenHeight - safeArea.bottom;
        this.safeAreaBottom = bottom + 40 + 'rpx';
      }
    },

    goBack() {
      this.currentStep > 1 ? this.currentStep-- : uni.navigateBack();
    },

    // 表单处理方法
    onEducationLevelChange(e) {
      const levelMap = { 0: 'bachelor', 1: 'master', 2: 'phd' };
      this.formData.educationLevel = levelMap[e.detail.value];
    },

    getEducationLevelDisplay() {
      const levelMap = {
        'bachelor': '本科',
        'master': '硕士',
        'phd': '博士'
      };
      return levelMap[this.formData.educationLevel] || this.formData.educationLevel;
    },

    onGpaScaleChange(e) {
      const scaleMap = { 0: '4.0', 1: '5.0', 2: '100' };
      this.formData.gpaScale = scaleMap[e.detail.value];
    },

    selectSchoolRank(rank) {
      this.formData.schoolRank = rank;
    },

    // 经验管理通用方法
    handleAddExperience(type) {
      const experienceMap = {
        internship: { company: '', position: '', durationMonths: '', description: '' },
        research: { title: '', role: '', durationMonths: '', description: '' },
        award: { name: '', level: '', year: '' }
      };
      this.formData[`${type}s`].push(experienceMap[type]);
    },

    handleDeleteExperience(type, index) {
      this.formData[`${type}s`].splice(index, 1);
    },

    // 意向偏好方法
    toggleTargetCountry(countryCode) {
      const index = this.formData.targetCountries.indexOf(countryCode);
      index > -1 ? this.formData.targetCountries.splice(index, 1) : this.formData.targetCountries.push(countryCode);
    },

    toggleTargetMajor(major) {
      const index = this.formData.targetMajors.indexOf(major);
      index > -1 ? this.formData.targetMajors.splice(index, 1) : this.formData.targetMajors.push(major);
    },

    selectTargetDegree(degree) {
      this.formData.targetDegree = degree;
    },

    selectBudgetRange(budget) {
      this.formData.budgetRange = budget;
    },

    // 步骤导航
    nextStep() {
      if (!this.validateCurrentStep()) return;
      this.currentStep++;
    },

    prevStep() {
      this.currentStep--;
    },

    validateCurrentStep() {
      const validations = {
        1: () => !this.formData.educationLevel || !this.formData.schoolName || !this.formData.major || !this.formData.gpa || !this.formData.gpaScale,
        2: () => !this.formData.toefl && !this.formData.ielts && !this.formData.gre && !this.formData.gmat,
        4: () => this.formData.targetCountries.length === 0 || this.formData.targetMajors.length === 0 || !this.formData.targetDegree || !this.formData.budgetRange
      };

      const messages = {
        1: '请填写学历、毕业院校、专业、GPA和评分标准',
        2: '请至少填写一项语言标化成绩',
        4: '请完成所有意向偏好选择'
      };

      if (validations[this.currentStep]?.()) {
        uni.showToast({ title: messages[this.currentStep], icon: 'none' });
        return false;
      }
      return true;
    },

    // 数据加载和保存
    async loadUserData() {
      try {
        this.isLoading = true;
        const [response, localData] = await Promise.all([
          profileAPI.getProfile().catch(() => ({ code: -1 })),
          Promise.resolve(uni.getStorageSync('userProfile'))
        ]);

        if (response.code === 0 && response.data?.profile) {
          this.mergeFormData(response.data.profile);
        } else if (localData) {
          this.mergeFormData(localData);
        }
      } catch (error) {
        console.error('加载用户数据失败:', error);
        uni.showToast({ title: '加载用户数据失败', icon: 'none' });
        const localData = uni.getStorageSync('userProfile');
        if (localData) this.mergeFormData(localData);
      } finally {
        this.isLoading = false;
      }
    },

    mergeFormData(profileData) {
      const fieldMap = {
        educationLevel: 'education_level',
        schoolName: 'school_name',
        gpaScale: 'gpa_scale',
        targetCountries: 'target_countries',
        targetMajors: 'target_majors',
        targetDegree: 'target_degree',
        budgetRange: 'budget_range',
        careerGoal: 'career_goal'
      };

      Object.keys(fieldMap).forEach(key => {
        const sourceKey = fieldMap[key];
        if (profileData[sourceKey] !== undefined) {
          this.formData[key] = profileData[sourceKey];
        }
      });

      // 转换经历数据，将下划线命名转为驼峰命名
      const formatExperienceData = (data) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(item => ({
          company: item.company,
          position: item.position,
          durationMonths: item.duration_months ? item.duration_months.toString() : '',
          description: item.description
        }));
      };

      const formatResearchData = (data) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(item => ({
          title: item.title,
          role: item.role,
          durationMonths: item.duration_months ? item.duration_months.toString() : '',
          description: item.description
        }));
      };

      const formatAwardData = (data) => {
        if (!data || !Array.isArray(data)) return [];
        return data.map(item => ({
          name: item.name,
          level: item.level,
          year: item.year ? item.year.toString() : ''
        }));
      };

      // 直接映射的字段
      ['major', 'gpa', 'toefl', 'ielts', 'gre', 'gmat'].forEach(key => {
        if (profileData[key] !== undefined) {
          this.formData[key] = profileData[key];
        }
      });

      // 特殊处理经历数据
      if (profileData.internships !== undefined) {
        this.formData.internships = formatExperienceData(profileData.internships);
      }
      if (profileData.research !== undefined) {
        this.formData.research = formatResearchData(profileData.research);
      }
      if (profileData.awards !== undefined) {
        this.formData.awards = formatAwardData(profileData.awards);
      }
    },

    async submitProfile() {
      if (!this.validateCurrentStep()) return;

      try {
        this.isLoading = true;

        // 转换实习经历数据结构，将驼峰命名转为下划线命名
        const formatExperiences = (experiences) => {
          return experiences.map(exp => ({
            company: exp.company,
            position: exp.position,
            duration_months: exp.durationMonths ? parseInt(exp.durationMonths) : null,
            description: exp.description
          }));
        };

        // 转换科研经历数据结构
        const formatResearch = (research) => {
          return research.map(item => ({
            title: item.title,
            role: item.role,
            duration_months: item.durationMonths ? parseInt(item.durationMonths) : null,
            description: item.description
          }));
        };

        // 转换获奖经历数据结构
        const formatAwards = (awards) => {
          return awards.map(award => ({
            name: award.name,
            level: award.level,
            year: award.year ? parseInt(award.year) : null
          }));
        };

        const saveData = {
          education: {
            education_level: this.formData.educationLevel,
            school_name: this.formData.schoolName,
            major: this.formData.major,
            gpa: parseFloat(this.formData.gpa),
            gpa_scale: this.formData.gpaScale
          },
          language: {
            toefl: this.formData.toefl ? parseFloat(this.formData.toefl) : null,
            ielts: this.formData.ielts ? parseFloat(this.formData.ielts) : null,
            gre: this.formData.gre ? parseFloat(this.formData.gre) : null,
            gmat: this.formData.gmat ? parseFloat(this.formData.gmat) : null
          },
          experience: {
            internships: formatExperiences(this.formData.internships),
            research: formatResearch(this.formData.research),
            awards: formatAwards(this.formData.awards)
          },
          preference: {
            target_countries: this.formData.targetCountries,
            target_majors: this.formData.targetMajors,
            target_degree: this.formData.targetDegree,
            budget_range: this.formData.budgetRange,
            career_goal: this.formData.careerGoal
          }
        };

        const savePromises = Object.entries(saveData).map(([type, data]) =>
          profileAPI[`update${type.charAt(0).toUpperCase() + type.slice(1)}`](data)
        );

        await Promise.all(savePromises);
        this.saveToLocalStorage();

        uni.showToast({ title: '资料保存成功', icon: 'success' });
        setTimeout(() => uni.reLaunch({ url: '/pages/profile/mine' }), 1500);

      } catch (error) {
        console.error('保存用户资料失败:', error);
        uni.showToast({ title: '资料保存失败，请重试', icon: 'none' });
        this.saveToLocalStorage();
      } finally {
        this.isLoading = false;
      }
    },

    saveToLocalStorage() {
      uni.setStorageSync('userProfile', this.formData);
      uni.setStorageSync('userProfileMeta', {
        completionRate: 100,
        lastUpdate: new Date().toISOString()
      });
    }
  }
}
</script>

<style>
/* 基础样式 */
.create-profile-container {
  flex: 1;
  background: linear-gradient(180deg, #F7F9FC 0%, #FFFFFF 100%);
  min-height: 100vh;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 48rpx;
  background: #FFFFFF;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  position: relative;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #E2E8F0;
  color: #64748B;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.step-item.active .step-number {
  background: linear-gradient(145deg, #00BFA5 0%, #006B5C 100%);
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(0, 107, 92, 0.3);
}

.step-text {
  font-size: 24rpx;
  color: #64748B;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.step-item.active .step-text { color: #006B5C; font-weight: 700; }

.step-line {
  position: absolute;
  top: 24rpx;
  left: 50%;
  right: -50%;
  height: 2rpx;
  background: #E2E8F0;
  z-index: 0;
}

.step-item:last-child .step-line {
  display: none;
}

/* 表单布局 */
.form-content { flex: 1; padding: 0 24rpx; box-sizing: border-box; }
.step-content { margin-bottom: 32rpx; }

.form-section {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.section-title {
  font-size: 32rpx;
  font-weight: 800;
  color: #191C1E;
  margin-bottom: 32rpx;
  display: block;
}

/* 表单元素通用样式 */
.form-item { margin-bottom: 32rpx; }
.form-item:last-child { margin-bottom: 0; }

.item-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 16rpx;
  display: block;
}

.item-input, .picker-value {
  width: 100%;
  padding: 32rpx 24rpx;
  border: 2rpx solid #E2E8F0;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #191C1E;
  background: #F8FAFC;
  box-sizing: border-box;
  transition: all 0.2s ease;
  height: 96rpx;
  line-height: 32rpx;
}

.item-input:focus, .picker-value:active {
  border-color: #006B5C;
  background: #FFFFFF;
  box-shadow: 0 0 0 4rpx rgba(0, 107, 92, 0.2);
}

.item-picker { width: 100%; }

/* 选择器组 */
.radio-group, .tag-group, .chip-group {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
  flex-wrap: wrap;
}

.radio-option, .tag-item, .chip-item {
  padding: 20rpx 32rpx;
  border: 2rpx solid #E2E8F0;
  border-radius: 16rpx;
  background: #F8FAFC;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tag-item { padding: 16rpx 24rpx; border-radius: 12rpx; font-size: 24rpx; }
.chip-item { border-radius: 9999rpx; font-size: 26rpx; }

.radio-option.active, .tag-item.active {
  background: rgba(0, 107, 92, 0.1);
  border-color: #006B5C;
  color: #006B5C;
}

.chip-item.active {
  background: linear-gradient(145deg, #00BFA5 0%, #006B5C 100%);
  border-color: #006B5C;
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(0, 107, 92, 0.3);
}

/* 经历部分 */
.experience-section { margin-bottom: 32rpx; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-subtitle {
  font-size: 28rpx;
  font-weight: 700;
  color: #191C1E;
}

.add-button {
  padding: 12rpx 24rpx;
  background: rgba(0, 107, 92, 0.1);
  color: #006B5C;
  border: 1rpx solid rgba(0, 107, 92, 0.2);
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.experience-item {
  background: #F8FAFC;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 1rpx solid #E2E8F0;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.experience-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #191C1E;
}

.delete-button {
  font-size: 24rpx;
  color: #FF4444;
  padding: 8rpx 16rpx;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 8rpx;
}

.item-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 24rpx;
  border: 2rpx solid #E2E8F0;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #191C1E;
  background: #FFFFFF;
  box-sizing: border-box;
  line-height: 1.5;
}

/* 表单说明 */
.form-note {
  margin-top: 16rpx;
  padding: 16rpx;
  background: rgba(0, 107, 92, 0.05);
  border-radius: 8rpx;
  border-left: 4rpx solid #006B5C;
}

.note-text {
  font-size: 24rpx;
  color: #64748B;
  line-height: 1.4;
}

/* 底部按钮 */
.bottom-section {
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  margin-top: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.button-group { display: flex; gap: 16rpx; }

.prev-button, .next-button, .submit-button {
  flex: 1;
  padding: 16rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  transition: all 0.2s ease;
}

.prev-button {
  background: #F8FAFC;
  color: #64748B;
  border: 2rpx solid #E2E8F0;
}

.prev-button:active { background: #F1F5F9; transform: scale(0.98); }

.next-button, .submit-button {
  background: linear-gradient(145deg, #00BFA5 0%, #006B5C 100%);
  color: #FFFFFF;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(0, 107, 92, 0.3);
}

.next-button:active, .submit-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 107, 92, 0.2);
}
</style>