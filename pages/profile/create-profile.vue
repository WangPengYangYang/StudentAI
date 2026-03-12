<template>
  <view class="create-profile-container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <view class="nav-back" @click="goBack">‹</view>
        <text class="nav-title">完善个人信息</text>
        <view class="nav-spacer"></view>
      </view>
    </view>

    <!-- 步骤指示器 -->
    <view class="step-indicator">
      <view class="step-item" :class="{active: currentStep === 1}">
        <view class="step-number">1</view>
        <text class="step-text">学术背景</text>
      </view>
      <view class="step-line"></view>
      <view class="step-item" :class="{active: currentStep === 2}">
        <view class="step-number">2</view>
        <text class="step-text">语言能力</text>
      </view>
      <view class="step-line"></view>
      <view class="step-item" :class="{active: currentStep === 3}">
        <view class="step-number">3</view>
        <text class="step-text">科研与实习经历</text>
      </view>
      <view class="step-line"></view>
      <view class="step-item" :class="{active: currentStep === 4}">
        <view class="step-number">4</view>
        <text class="step-text">意向偏好</text>
      </view>
    </view>

    <scroll-view class="form-content" scroll-y="true" :style="{paddingBottom: safeAreaBottom}">
      <!-- 第1步：学术背景 -->
      <view v-if="currentStep === 1" class="step-content">
        <view class="form-section">
          <text class="section-title">学术背景</text>

          <view class="form-item">
            <text class="item-label">学历</text>
            <picker
              mode="selector"
              :range="educationLevels"
              :value="educationLevelIndex"
              @change="onEducationLevelChange"
              class="item-picker"
            >
              <view class="picker-value">
                {{formData.educationLevel ? educationLevelLabels[formData.educationLevel] : '请选择学历'}}
              </view>
            </picker>
          </view>

          <view class="form-item">
            <text class="item-label">毕业院校</text>
            <input
              class="item-input"
              placeholder="请输入您的毕业院校"
              v-model="formData.schoolName"
            />
            <view class="tag-group">
              <text class="tag-item" :class="{active: formData.schoolRank === 1}" @click="selectSchoolRank(1)">985</text>
              <text class="tag-item" :class="{active: formData.schoolRank === 2}" @click="selectSchoolRank(2)">211</text>
              <text class="tag-item" :class="{active: formData.schoolRank === 3}" @click="selectSchoolRank(3)">双一流</text>
            </view>
          </view>

          <view class="form-item">
            <text class="item-label">专业</text>
            <input
              class="item-input"
              placeholder="请输入您的专业"
              v-model="formData.major"
            />
          </view>

          <view class="form-item">
            <text class="item-label">平均学分绩点 (GPA)</text>
            <input
              class="item-input"
              type="digit"
              placeholder="例如: 3.5"
              v-model="formData.gpa"
            />
          </view>

          <view class="form-item">
            <text class="item-label">GPA 评分标准</text>
            <picker
              mode="selector"
              :range="gpaScales"
              :value="gpaScaleIndex"
              @change="onGpaScaleChange"
              class="item-picker"
            >
              <view class="picker-value">
                {{formData.gpaScale ? gpaScaleLabels[formData.gpaScale] : '请选择评分标准'}}
              </view>
            </picker>
          </view>
        </view>
      </view>

      <!-- 第2步：语言标化考试 -->
      <view v-if="currentStep === 2" class="step-content">
        <view class="form-section">
          <text class="section-title">语言标化考试</text>

          <view class="form-item">
            <text class="item-label">托福成绩</text>
            <input
              class="item-input"
              type="digit"
              placeholder="请输入托福总分（0-120）"
              v-model="formData.toefl"
            />
          </view>

          <view class="form-item">
            <text class="item-label">雅思成绩</text>
            <input
              class="item-input"
              type="digit"
              placeholder="请输入雅思总分（0-9）"
              v-model="formData.ielts"
            />
          </view>

          <view class="form-item">
            <text class="item-label">GRE成绩</text>
            <input
              class="item-input"
              type="digit"
              placeholder="请输入GRE总分（260-340）"
              v-model="formData.gre"
            />
          </view>

          <view class="form-item">
            <text class="item-label">GMAT成绩</text>
            <input
              class="item-input"
              type="digit"
              placeholder="请输入GMAT总分（200-800）"
              v-model="formData.gmat"
            />
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

          <!-- 实习经历 -->
          <view class="experience-section">
            <view class="section-header">
              <text class="section-subtitle">实习经历</text>
              <button class="add-button" @click="addInternship">+ 添加实习经历</button>
            </view>

            <view v-for="(internship, index) in formData.internships" :key="index" class="experience-item">
              <view class="experience-header">
                <text class="experience-title">实习经历 {{index + 1}}</text>
                <text class="delete-button" @click="deleteInternship(index)">删除</text>
              </view>

              <view class="form-item">
                <text class="item-label">公司名称</text>
                <input
                  class="item-input"
                  placeholder="请输入公司名称"
                  v-model="internship.company"
                />
              </view>

              <view class="form-item">
                <text class="item-label">职位</text>
                <input
                  class="item-input"
                  placeholder="请输入您的职位"
                  v-model="internship.position"
                />
              </view>

              <view class="form-item">
                <text class="item-label">持续时间（月）</text>
                <input
                  class="item-input"
                  type="number"
                  placeholder="请输入实习月数"
                  v-model="internship.durationMonths"
                />
              </view>

              <view class="form-item">
                <text class="item-label">工作描述</text>
                <textarea
                  class="item-textarea"
                  placeholder="请简要描述您的工作内容和成果"
                  v-model="internship.description"
                />
              </view>
            </view>
          </view>

          <!-- 科研经历 -->
          <view class="experience-section">
            <view class="section-header">
              <text class="section-subtitle">科研经历</text>
              <button class="add-button" @click="addResearch">+ 添加科研经历</button>
            </view>

            <view v-for="(research, index) in formData.research" :key="index" class="experience-item">
              <view class="experience-header">
                <text class="experience-title">科研经历 {{index + 1}}</text>
                <text class="delete-button" @click="deleteResearch(index)">删除</text>
              </view>

              <view class="form-item">
                <text class="item-label">项目名称</text>
                <input
                  class="item-input"
                  placeholder="请输入项目名称"
                  v-model="research.title"
                />
              </view>

              <view class="form-item">
                <text class="item-label">担任角色</text>
                <input
                  class="item-input"
                  placeholder="请输入您在项目中的角色"
                  v-model="research.role"
                />
              </view>

              <view class="form-item">
                <text class="item-label">持续时间（月）</text>
                <input
                  class="item-input"
                  type="number"
                  placeholder="请输入项目月数"
                  v-model="research.durationMonths"
                />
              </view>

              <view class="form-item">
                <text class="item-label">项目描述</text>
                <textarea
                  class="item-textarea"
                  placeholder="请简要描述您的研究内容和成果"
                  v-model="research.description"
                />
              </view>
            </view>
          </view>

          <!-- 获奖经历 -->
          <view class="experience-section">
            <view class="section-header">
              <text class="section-subtitle">获奖经历</text>
              <button class="add-button" @click="addAward">+ 添加获奖经历</button>
            </view>

            <view v-for="(award, index) in formData.awards" :key="index" class="experience-item">
              <view class="experience-header">
                <text class="experience-title">获奖经历 {{index + 1}}</text>
                <text class="delete-button" @click="deleteAward(index)">删除</text>
              </view>

              <view class="form-item">
                <text class="item-label">奖项名称</text>
                <input
                  class="item-input"
                  placeholder="请输入奖项名称"
                  v-model="award.name"
                />
              </view>

              <view class="form-item">
                <text class="item-label">奖项级别</text>
                <input
                  class="item-input"
                  placeholder="例如：国家级、省级、校级"
                  v-model="award.level"
                />
              </view>

              <view class="form-item">
                <text class="item-label">获奖年份</text>
                <input
                  class="item-input"
                  type="number"
                  placeholder="请输入获奖年份"
                  v-model="award.year"
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
              <view
                v-for="(country, index) in targetCountries"
                :key="index"
                class="chip-item"
                :class="{active: formData.targetCountries.includes(country.code)}"
                @click="toggleTargetCountry(country.code)"
              >
                <text class="chip-text">{{country.name}}</text>
              </view>
            </view>
          </view>

          <!-- 目标专业 -->
          <view class="form-item">
            <text class="item-label">目标专业</text>
            <view class="chip-group">
              <view
                v-for="(major, index) in targetMajors"
                :key="index"
                class="chip-item"
                :class="{active: formData.targetMajors.includes(major)}"
                @click="toggleTargetMajor(major)"
              >
                <text class="chip-text">{{major}}</text>
              </view>
            </view>
          </view>

          <!-- 目标学位 -->
          <view class="form-item">
            <text class="item-label">目标学位</text>
            <view class="radio-group">
              <view class="radio-option" :class="{active: formData.targetDegree === 'bachelor'}" @click="selectTargetDegree('bachelor')">
                <text class="radio-text">本科</text>
              </view>
              <view class="radio-option" :class="{active: formData.targetDegree === 'master'}" @click="selectTargetDegree('master')">
                <text class="radio-text">硕士</text>
              </view>
              <view class="radio-option" :class="{active: formData.targetDegree === 'phd'}" @click="selectTargetDegree('phd')">
                <text class="radio-text">博士</text>
              </view>
            </view>
          </view>

          <!-- 预算范围 -->
          <view class="form-item">
            <text class="item-label">预算范围</text>
            <view class="radio-group">
              <view class="radio-option" :class="{active: formData.budgetRange === '20w以下/year'}" @click="selectBudgetRange('20w以下/year')">
                <text class="radio-text">20万以下/年</text>
              </view>
              <view class="radio-option" :class="{active: formData.budgetRange === '20-30w/year'}" @click="selectBudgetRange('20-30w/year')">
                <text class="radio-text">20-30万/年</text>
              </view>
              <view class="radio-option" :class="{active: formData.budgetRange === '30-50w/year'}" @click="selectBudgetRange('30-50w/year')">
                <text class="radio-text">30-50万/年</text>
              </view>
              <view class="radio-option" :class="{active: formData.budgetRange === '50w以上/year'}" @click="selectBudgetRange('50w以上/year')">
                <text class="radio-text">50万以上/年</text>
              </view>
            </view>
          </view>

          <!-- 职业目标 -->
          <view class="form-item">
            <text class="item-label">职业目标</text>
            <textarea
              class="item-textarea"
              placeholder="请简要描述您的职业规划和发展目标"
              v-model="formData.careerGoal"
            />
          </view>
        </view>
      </view>

      <!-- 底部按钮 -->
      <view class="bottom-section">
        <view class="button-group">
          <button
            v-if="currentStep > 1"
            class="prev-button"
            @click="prevStep"
          >
            上一步
          </button>
          <button
            v-if="currentStep < 4"
            class="next-button"
            @click="nextStep"
          >
            下一步
          </button>
          <button
            v-if="currentStep === 4"
            class="submit-button"
            @click="submitProfile"
          >
            完成
          </button>
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
      formData: {
        // 第1步：学术背景
        educationLevel: '',
        schoolName: '',
        schoolRank: null,
        major: '',
        gpa: '',
        gpaScale: '',

        // 第2步：语言标化
        toefl: '',
        ielts: '',
        gre: '',
        gmat: '',

        // 第3步：科研实习
        internships: [],
        research: [],
        awards: [],

        // 第4步：意向偏好
        targetCountries: [],
        targetMajors: [],
        targetDegree: '',
        budgetRange: '',
        careerGoal: ''
      },
      // 目标国家选项
      targetCountries: [
        { code: 'US', name: '美国' },
        { code: 'UK', name: '英国' },
        { code: 'CA', name: '加拿大' },
        { code: 'AU', name: '澳大利亚' },
        { code: 'SG', name: '新加坡' },
        { code: 'HK', name: '香港' },
        { code: 'JP', name: '日本' },
        { code: 'DE', name: '德国' },
        { code: 'FR', name: '法国' },
        { code: 'NL', name: '荷兰' },
        { code: 'CH', name: '瑞士' }
      ],
      // 学历选项
      educationLevels: ['本科', '硕士', '博士'],
      educationLevelLabels: {
        'bachelor': '本科',
        'master': '硕士',
        'phd': '博士'
      },
      educationLevelIndex: 0,

      // GPA评分标准选项
      gpaScales: ['4.0 分制', '5.0 分制', '100 分制'],
      gpaScaleLabels: {
        '4.0': '4.0 分制',
        '5.0': '5.0 分制',
        '100': '100 分制'
      },
      gpaScaleIndex: 0,

      // 目标专业选项
      targetMajors: [
        '计算机科学', '人工智能', '数据科学', '商业分析', '金融', '市场营销',
        '工程管理', '机械工程', '电子工程', '土木工程', '生物医学', '法律',
        '教育', '心理学', '传媒', '艺术与设计'
      ]
    };
  },
  onLoad() {
    this.calculateSafeArea();
    this.loadUserData();
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
      if (this.currentStep > 1) {
        this.currentStep--;
      } else {
        uni.navigateBack();
      }
    },

    // 第1步：学术背景相关方法
    onEducationLevelChange(e) {
      const index = e.detail.value;
      this.educationLevelIndex = index;
      const levelMap = { 0: 'bachelor', 1: 'master', 2: 'phd' };
      this.formData.educationLevel = levelMap[index];
    },

    onGpaScaleChange(e) {
      const index = e.detail.value;
      this.gpaScaleIndex = index;
      const scaleMap = { 0: '4.0', 1: '5.0', 2: '100' };
      this.formData.gpaScale = scaleMap[index];
    },

    selectSchoolRank(rank) {
      this.formData.schoolRank = rank;
    },

    // 第3步：科研实习相关方法
    addInternship() {
      this.formData.internships.push({
        company: '',
        position: '',
        durationMonths: '',
        description: ''
      });
    },

    deleteInternship(index) {
      this.formData.internships.splice(index, 1);
    },

    addResearch() {
      this.formData.research.push({
        title: '',
        role: '',
        durationMonths: '',
        description: ''
      });
    },

    deleteResearch(index) {
      this.formData.research.splice(index, 1);
    },

    addAward() {
      this.formData.awards.push({
        name: '',
        level: '',
        year: ''
      });
    },

    deleteAward(index) {
      this.formData.awards.splice(index, 1);
    },

    // 第4步：意向偏好相关方法
    toggleTargetCountry(countryCode) {
      const index = this.formData.targetCountries.indexOf(countryCode);
      if (index > -1) {
        this.formData.targetCountries.splice(index, 1);
      } else {
        this.formData.targetCountries.push(countryCode);
      }
    },

    toggleTargetMajor(major) {
      const index = this.formData.targetMajors.indexOf(major);
      if (index > -1) {
        this.formData.targetMajors.splice(index, 1);
      } else {
        this.formData.targetMajors.push(major);
      }
    },

    selectTargetDegree(degree) {
      this.formData.targetDegree = degree;
    },

    selectBudgetRange(budget) {
      this.formData.budgetRange = budget;
    },

    nextStep() {
      // 验证当前步骤的必填字段
      if (this.currentStep === 1) {
        // 第1步：学术背景验证
        if (!this.formData.educationLevel || !this.formData.schoolName || !this.formData.major || !this.formData.gpa || !this.formData.gpaScale) {
          uni.showToast({
            title: '请填写学历、毕业院校、专业、GPA和评分标准',
            icon: 'none'
          });
          return;
        }
      } else if (this.currentStep === 2) {
        // 第2步：语言标化验证
        // 至少需要填写一项成绩
        if (!this.formData.toefl && !this.formData.ielts && !this.formData.gre && !this.formData.gmat) {
          uni.showToast({
            title: '请至少填写一项语言标化成绩',
            icon: 'none'
          });
          return;
        }
      }

      this.currentStep++;
    },

    prevStep() {
      this.currentStep--;
    },

    async loadUserData() {
      try {
        this.isLoading = true;

        // 从后端接口加载用户数据
        const response = await profileAPI.getProfile();
        if (response.code === 0 && response.data && response.data.profile) {
          const profileData = response.data.profile;

          // 填充表单数据
          this.formData = {
            ...this.formData,
            educationLevel: profileData.education_level || '',
            schoolName: profileData.school_name || '',
            major: profileData.major || '',
            gpa: profileData.gpa || '',
            gpaScale: profileData.gpa_scale || '',
            toefl: profileData.toefl || '',
            ielts: profileData.ielts || '',
            gre: profileData.gre || '',
            gmat: profileData.gmat || '',
            internships: profileData.internships || [],
            research: profileData.research || [],
            awards: profileData.awards || [],
            targetCountries: profileData.target_countries || [],
            targetMajors: profileData.target_majors || [],
            targetDegree: profileData.target_degree || '',
            budgetRange: profileData.budget_range || '',
            careerGoal: profileData.career_goal || ''
          };
        } else {
          console.log('用户尚未填写个人信息');
        }

        // 同时从本地存储加载用户数据作为备份
        const localData = uni.getStorageSync('userProfile');
        if (localData) {
          this.formData = { ...this.formData, ...localData };
        }
      } catch (error) {
        console.error('加载用户数据失败:', error);
        uni.showToast({
          title: '加载用户数据失败',
          icon: 'none'
        });

        // 从本地存储加载用户数据作为备用
        const localData = uni.getStorageSync('userProfile');
        if (localData) {
          this.formData = { ...this.formData, ...localData };
        }
      } finally {
        this.isLoading = false;
      }
    },

    async submitProfile() {
      // 验证意向偏好
      if (this.formData.targetCountries.length === 0 ||
          this.formData.targetMajors.length === 0 ||
          !this.formData.targetDegree ||
          !this.formData.budgetRange) {
        uni.showToast({
          title: '请完成所有意向偏好选择',
          icon: 'none'
        });
        return;
      }

      try {
        this.isLoading = true;

        // 分步骤保存到后端接口
        const savePromises = [];

        // 第1步：保存学术背景
        if (this.formData.educationLevel || this.formData.schoolName || this.formData.major) {
          savePromises.push(
            profileAPI.updateEducation({
              education_level: this.formData.educationLevel,
              school_name: this.formData.schoolName,
              major: this.formData.major,
              gpa: parseFloat(this.formData.gpa),
              gpa_scale: this.formData.gpaScale
            })
          );
        }

        // 第2步：保存语言标化
        if (this.formData.toefl || this.formData.ielts || this.formData.gre || this.formData.gmat) {
          savePromises.push(
            profileAPI.updateLanguage({
              toefl: this.formData.toefl ? parseFloat(this.formData.toefl) : null,
              ielts: this.formData.ielts ? parseFloat(this.formData.ielts) : null,
              gre: this.formData.gre ? parseFloat(this.formData.gre) : null,
              gmat: this.formData.gmat ? parseFloat(this.formData.gmat) : null
            })
          );
        }

        // 第3步：保存科研实习
        if (this.formData.internships.length > 0 || this.formData.research.length > 0 || this.formData.awards.length > 0) {
          savePromises.push(
            profileAPI.updateExperience({
              internships: this.formData.internships,
              research: this.formData.research,
              awards: this.formData.awards
            })
          );
        }

        // 第4步：保存意向偏好
        if (this.formData.targetCountries.length > 0 || this.formData.targetMajors.length > 0) {
          savePromises.push(
            profileAPI.updatePreference({
              target_countries: this.formData.targetCountries,
              target_majors: this.formData.targetMajors,
              target_degree: this.formData.targetDegree,
              budget_range: this.formData.budgetRange,
              career_goal: this.formData.careerGoal
            })
          );
        }

        // 并行执行所有保存操作
        await Promise.all(savePromises);

        // 保存到本地存储作为备份
        uni.setStorageSync('userProfile', this.formData);

        // 更新用户资料完成度
        const profileData = {
          completionRate: 100,
          lastUpdate: new Date().toISOString()
        };
        uni.setStorageSync('userProfileMeta', profileData);

        uni.showToast({
          title: '资料保存成功',
          icon: 'success'
        });

        // 跳转到个人中心页面
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/profile/profile'
          });
        }, 1500);

      } catch (error) {
        console.error('保存用户资料失败:', error);
        uni.showToast({
          title: '资料保存失败，请重试',
          icon: 'none'
        });

        // 保存到本地存储作为备用
        uni.setStorageSync('userProfile', this.formData);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style>
.create-profile-container {
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
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-back {
  font-size: 40rpx;
  color: #006B5C;
  font-weight: bold;
  padding: 8rpx;
  transition: all 0.2s ease;
}

.nav-back:active {
  transform: scale(0.9);
}

.nav-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #191C1E;
  font-family: 'WenQuanYi Zen Hei';
}

.nav-spacer {
  width: 40rpx;
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 48rpx;
  background: #FFFFFF;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.step-number {
  width: 48rpx;
  height: 48rpx;
  border-radius: 9999rpx;
  background: #E2E8F0;
  color: #64748B;
  font-size: 24rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
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
}

.step-item.active .step-text {
  color: #006B5C;
  font-weight: 700;
}

.step-line {
  flex: 1;
  height: 2rpx;
  background: #E2E8F0;
  margin: 0 16rpx;
  margin-top: -20rpx;
}

/* 表单内容 */
.form-content {
  flex: 1;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.step-content {
  margin-bottom: 32rpx;
}

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
  font-family: 'WenQuanYi Zen Hei';
}

.form-item {
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.item-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #191C1E;
  margin-bottom: 16rpx;
  display: block;
}

.item-input {
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

.item-input:focus {
  border-color: #006B5C;
  background: #FFFFFF;
  box-shadow: 0 0 0 4rpx rgba(0, 107, 92, 0.2);
}

.item-picker {
  width: 100%;
}

.picker-value {
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

.picker-value:active {
  background: #F1F5F9;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  gap: 16rpx;
}

.radio-option {
  flex: 1;
  padding: 32rpx 24rpx;
  border: 2rpx solid #E2E8F0;
  border-radius: 16rpx;
  text-align: center;
  background: #F8FAFC;
  transition: all 0.2s ease;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radio-option.active {
  background: rgba(0, 107, 92, 0.1);
  border-color: #006B5C;
  color: #006B5C;
}

.radio-text {
  font-size: 28rpx;
  font-weight: 600;
}

/* 标签组 */
.tag-group {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.tag-item {
  padding: 16rpx 24rpx;
  border: 2rpx solid #E2E8F0;
  border-radius: 12rpx;
  font-size: 24rpx;
  color: #64748B;
  background: #F8FAFC;
  transition: all 0.2s ease;
}

.tag-item.active {
  background: rgba(0, 107, 92, 0.1);
  border-color: #006B5C;
  color: #006B5C;
  font-weight: 700;
}

/* 考试选项组 */
.exam-group {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.exam-option {
  flex: 1;
  padding: 24rpx;
  border: 2rpx solid #E2E8F0;
  border-radius: 16rpx;
  text-align: center;
  background: #F8FAFC;
  transition: all 0.2s ease;
}

.exam-option.active {
  background: rgba(0, 107, 92, 0.1);
  border-color: #006B5C;
  color: #006B5C;
}

.exam-text {
  font-size: 26rpx;
  font-weight: 600;
}

/* 经历部分样式 */
.experience-section {
  margin-bottom: 32rpx;
}

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

.date-range {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.date-picker {
  flex: 1;
}

.date-separator {
  font-size: 24rpx;
  color: #64748B;
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
  transition: all 0.2s ease;
  line-height: 1.5;
}

.item-textarea:focus {
  border-color: #006B5C;
  background: #FFFFFF;
  box-shadow: 0 0 0 4rpx rgba(0, 107, 92, 0.2);
}

/* 分数详情 */
.score-details {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.score-item {
  display: flex;
  align-items: center;
}

.score-label {
  width: 120rpx;
  font-size: 26rpx;
  color: #191C1E;
  font-weight: 600;
}

.score-input {
  flex: 1;
  padding: 24rpx;
  border: 2rpx solid #E2E8F0;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #191C1E;
  background: #F8FAFC;
  box-sizing: border-box;
}

/* 准备考试选项 */
.preparing-exam {
  margin-top: 16rpx;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.checkbox-text {
  font-size: 26rpx;
  color: #191C1E;
}

/* 表单说明文本 */
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

/* 意向偏好样式 */
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.chip-item {
  padding: 20rpx 32rpx;
  border: 2rpx solid #E2E8F0;
  border-radius: 9999rpx;
  font-size: 26rpx;
  color: #64748B;
  background: #F8FAFC;
  transition: all 0.2s ease;
}

.chip-item.active {
  background: linear-gradient(145deg, #00BFA5 0%, #006B5C 100%);
  border-color: #006B5C;
  color: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(0, 107, 92, 0.3);
}

.chip-text {
  font-weight: 600;
}

.ranking-slider {
  margin-top: 16rpx;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.slider-label {
  font-size: 24rpx;
  color: #64748B;
}

.preference-slider {
  width: 100%;
  margin: 16rpx 0;
}

.slider-values {
  text-align: center;
  margin-top: 16rpx;
}

.slider-value {
  font-size: 28rpx;
  font-weight: 700;
  color: #006B5C;
}

.preference-options {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 16rpx;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.checkbox-text {
  font-size: 26rpx;
  color: #191C1E;
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

.button-group {
  display: flex;
  gap: 16rpx;
}

.prev-button {
  flex: 1;
  padding: 32rpx;
  background: #F8FAFC;
  color: #64748B;
  border: 2rpx solid #E2E8F0;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  transition: all 0.2s ease;
}

.prev-button:active {
  background: #F1F5F9;
  transform: scale(0.98);
}

.next-button {
  flex: 1;
  padding: 32rpx;
  background: linear-gradient(145deg, #00BFA5 0%, #006B5C 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(0, 107, 92, 0.3);
  transition: all 0.2s ease;
}

.next-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 107, 92, 0.2);
}

.submit-button {
  flex: 1;
  padding: 32rpx;
  background: linear-gradient(145deg, #00BFA5 0%, #006B5C 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(0, 107, 92, 0.3);
  transition: all 0.2s ease;
}

.submit-button:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(0, 107, 92, 0.2);
}

</style>