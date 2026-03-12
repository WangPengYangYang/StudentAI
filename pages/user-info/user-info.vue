<template>
	<view class="user-info-container">
		<!-- 进度条 -->
		<view class="progress-bar">
			<view class="progress-track">
				<view class="progress-fill" :style="{width: (currentStep / 4 * 100) + '%'}"></view>
			</view>
			<view class="step-indicators">
				<view v-for="(step, index) in steps" :key="index"
					:class="['step-dot', currentStep > index ? 'completed' : '', currentStep === index + 1 ? 'active' : '']">
					<text v-if="currentStep > index" class="step-check">✓</text>
				</view>
			</view>
			<text class="step-text">步骤 {{currentStep}}/4</text>
		</view>

		<!-- 步骤内容 -->
		<view class="step-content">
			<!-- 步骤1: 学业背景 -->
			<view v-if="currentStep === 1" class="step-panel">
				<text class="step-title">学业背景</text>
				<view class="form-group">
					<text class="label">最高学历</text>
					<picker @change="bindEducationChange" :value="educationIndex" :range="educationOptions">
						<view class="picker">{{educationOptions[educationIndex]}}</view>
					</picker>
				</view>
				<view class="form-group">
					<text class="label">毕业院校</text>
					<input class="input" v-model="formData.school" placeholder="请输入毕业院校名称" />
				</view>
				<view class="form-group">
					<text class="label">专业</text>
					<input class="input" v-model="formData.major" placeholder="请输入专业名称" />
				</view>
				<view class="form-group">
					<text class="label">GPA成绩</text>
					<view class="gpa-type-tags">
						<view
							v-for="(type, index) in gpaTypeOptions"
							:key="index"
							:class="['gpa-tag', formData.gpaType === type.value ? 'active' : '']"
							@click="selectGpaType(type.value)"
						>
							<text>{{type.label}}</text>
						</view>
					</view>
					<input class="input" v-model="formData.gpa" :placeholder="'请输入' + (formData.gpaType ? getGpaPlaceholder(formData.gpaType) : 'GPA成绩')" type="number" />
				</view>
			</view>

			<!-- 步骤2: 语言/标化成绩 -->
			<view v-if="currentStep === 2" class="step-panel">
				<text class="step-title">语言/标化成绩</text>
				<view class="form-group">
					<text class="label">语言考试类型</text>
					<picker @change="bindLanguageTypeChange" :value="languageTypeIndex" :range="languageTypeOptions">
						<view class="picker">{{languageTypeOptions[languageTypeIndex]}}</view>
					</picker>
				</view>
				<view class="form-group">
					<text class="label">成绩状态</text>
					<radio-group @change="bindScoreStatusChange">
						<label class="radio-label" v-for="(item, index) in scoreStatusOptions" :key="index">
							<radio :value="item.value" :checked="formData.scoreStatus === item.value" />
							<text>{{item.name}}</text>
						</label>
					</radio-group>
				</view>
				<view v-if="formData.scoreStatus === 'hasScore'" class="form-group">
					<text class="label">考试成绩</text>
					<input class="input" v-model="formData.score" placeholder="请输入考试成绩" type="number" />
				</view>
				<view v-if="formData.scoreStatus === 'preparing'" class="form-group">
					<text class="label">预计考试时间</text>
					<picker mode="date" @change="bindExamDateChange">
						<view class="picker">{{formData.examDate || '请选择考试时间'}}</view>
					</picker>
				</view>
				<view v-if="formData.scoreStatus === 'predict'" class="form-group">
					<text class="label">AI预测分数</text>
					<text class="predict-score">{{formData.predictScore || '85-90'}}</text>
					<text class="predict-tip">基于你的学习背景预测</text>
				</view>
			</view>

			<!-- 步骤3: 实习/工作经历 -->
			<view v-if="currentStep === 3" class="step-panel">
				<text class="step-title">实习/工作经历</text>
				<view class="form-group">
					<text class="label">公司类型</text>
					<picker @change="bindCompanyTypeChange" :value="companyTypeIndex" :range="companyTypeOptions">
						<view class="picker">{{companyTypeOptions[companyTypeIndex]}}</view>
					</picker>
				</view>
				<view class="form-group">
					<text class="label">公司名称</text>
					<input class="input" v-model="formData.company" placeholder="请输入公司名称" />
				</view>
				<view class="form-group">
					<text class="label">职位</text>
					<input class="input" v-model="formData.position" placeholder="请输入职位" />
				</view>
				<view class="form-group">
					<text class="label">工作时长</text>
					<input class="input" v-model="formData.workDuration" placeholder="请输入工作时长（月）" type="number" />
				</view>
				<view class="form-group">
					<text class="label">工作描述</text>
					<textarea class="textarea" v-model="formData.workDescription" placeholder="请描述工作内容和收获" />
				</view>
			</view>

			<!-- 步骤4: 留学意向 -->
			<view v-if="currentStep === 4" class="step-panel">
				<text class="step-title">留学意向</text>
				<view class="form-group">
					<text class="label">目标国家/地区</text>
					<checkbox-group @change="bindCountryChange">
						<label class="checkbox-label" v-for="(country, index) in countryOptions" :key="index">
							<checkbox :value="country" :checked="formData.targetCountries.includes(country)" />
							<text>{{country}}</text>
						</label>
					</checkbox-group>
				</view>
				<view class="form-group">
					<text class="label">目标专业</text>
					<input class="input" v-model="formData.targetMajor" placeholder="请输入目标专业" />
				</view>
				<view class="form-group">
					<text class="label">学费预算上限（万元）</text>
					<slider :value="formData.budget" min="10" max="100" @change="bindBudgetChange" show-value />
					<text class="budget-value">{{formData.budget}} 万元</text>
				</view>
			</view>
		</view>

		<!-- 导航按钮 -->
		<view class="navigation-buttons">
			<button v-if="currentStep > 1" class="btn-prev" @click="prevStep">上一步</button>
			<button v-if="currentStep < 4" class="btn-next" @click="nextStep">下一步</button>
			<button v-if="currentStep === 4" class="btn-submit" @click="submitForm">提交信息</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				currentStep: 1,
				steps: [1, 2, 3, 4],
				educationIndex: 0,
				educationOptions: ['本科', '硕士', '博士', '其他'],
				gpaTypeOptions: [
					{ label: '百分制', value: 'percent' },
					{ label: '4.0制', value: 'four' },
					{ label: '5.0制', value: 'five' }
				],
				languageTypeIndex: 0,
				languageTypeOptions: ['雅思', '托福', 'GRE', 'GMAT', '其他'],
				companyTypeIndex: 0,
				companyTypeOptions: ['名企', '普企', '创业公司', '其他'],
				scoreStatusOptions: [
					{ name: '已有成绩', value: 'hasScore' },
					{ name: '备考中', value: 'preparing' },
					{ name: 'AI预测', value: 'predict' }
				],
				countryOptions: ['美国', '英国', '加拿大', '澳大利亚', '新加坡', '香港', '其他'],
				formData: {
					// 学业背景
					education: '本科',
					school: '',
					major: '',
					gpa: '',

					// 语言成绩
					languageType: '雅思',
					scoreStatus: 'hasScore',
					score: '',
					examDate: '',
					predictScore: '85-90',

					// 工作经历
					companyType: '名企',
					company: '',
					position: '',
					workDuration: '',
					workDescription: '',

					// 留学意向
					targetCountries: [],
					targetMajor: '',
					budget: 50
				}
			}
		},
		methods: {
			// 步骤导航
			nextStep() {
				if (this.validateCurrentStep()) {
					this.currentStep++
				}
			},
			prevStep() {
				this.currentStep--
			},

			// 表单验证
			validateCurrentStep() {
				switch (this.currentStep) {
					case 1:
						if (!this.formData.school || !this.formData.major || !this.formData.gpa) {
							uni.showToast({ title: '请填写完整的学业信息', icon: 'none' })
							return false
						}
						break
					case 2:
						if (this.formData.scoreStatus === 'hasScore' && !this.formData.score) {
							uni.showToast({ title: '请填写考试成绩', icon: 'none' })
							return false
						}
						if (this.formData.scoreStatus === 'preparing' && !this.formData.examDate) {
							uni.showToast({ title: '请选择考试时间', icon: 'none' })
							return false
						}
						break
					case 3:
						if (!this.formData.company || !this.formData.position || !this.formData.workDuration) {
							uni.showToast({ title: '请填写完整的工作信息', icon: 'none' })
							return false
						}
						break
					case 4:
						if (this.formData.targetCountries.length === 0 || !this.formData.targetMajor) {
							uni.showToast({ title: '请选择目标国家和专业', icon: 'none' })
							return false
						}
						break
				}
				return true
			},

			// 选择器变化
			bindEducationChange(e) {
				this.educationIndex = e.detail.value
				this.formData.education = this.educationOptions[this.educationIndex]
			},
			bindLanguageTypeChange(e) {
				this.languageTypeIndex = e.detail.value
				this.formData.languageType = this.languageTypeOptions[this.languageTypeIndex]
			},
			bindCompanyTypeChange(e) {
				this.companyTypeIndex = e.detail.value
				this.formData.companyType = this.companyTypeOptions[this.companyTypeIndex]
			},
			bindScoreStatusChange(e) {
				this.formData.scoreStatus = e.detail.value
			},
			bindExamDateChange(e) {
				this.formData.examDate = e.detail.value
			},
			bindCountryChange(e) {
				this.formData.targetCountries = e.detail.value
			},
			bindBudgetChange(e) {
				this.formData.budget = e.detail.value
			},

			// GPA类型选择
			selectGpaType(type) {
				this.formData.gpaType = type
			},

			// 获取GPA占位符文本
			getGpaPlaceholder(type) {
				const placeholders = {
					'percent': '百分制成绩（如：85）',
					'four': '4.0制GPA（如：3.5）',
					'five': '5.0制GPA（如：4.2）'
				}
				return placeholders[type] || 'GPA成绩'
			},

			// 提交表单
			submitForm() {
				if (this.validateCurrentStep()) {
					uni.showLoading({ title: '提交中...' })

					// 保存到本地存储
					uni.setStorageSync('userStudyInfo', this.formData)

					setTimeout(() => {
						uni.hideLoading()
						uni.showToast({ title: '信息提交成功！' })

						// 返回首页
						setTimeout(() => {
							uni.navigateBack()
						}, 1500)
					}, 1000)
				}
			}
		}
	}
</script>

<style>
	.user-info-container {
		padding: 30rpx;
		min-height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.progress-bar {
		position: relative;
		margin-bottom: 60rpx;
	}

	.progress-track {
		height: 8rpx;
		background: #e0e0e0;
		border-radius: 4rpx;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea, #764ba2);
		transition: width 0.3s ease;
	}

	.step-indicators {
		position: absolute;
		top: -12rpx;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
	}

	.step-dot {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		background: #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		color: white;
	}

	.step-dot.completed {
		background: #4CAF50;
	}

	.step-dot.active {
		background: #667eea;
		border: 3rpx solid #fff;
		box-shadow: 0 0 0 3rpx #667eea;
	}

	.step-text {
		display: block;
		text-align: center;
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #666;
		font-weight: bold;
	}

	.step-content {
		background: white;
		border-radius: 20rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
	}

	.step-title {
		display: block;
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 40rpx;
		text-align: center;
	}

	.form-group {
		margin-bottom: 40rpx;
	}

	.label {
		display: block;
		font-size: 28rpx;
		color: #333;
		margin-bottom: 16rpx;
		font-weight: 500;
	}

	.input, .textarea, .picker {
		border: 2rpx solid #ddd;
		border-radius: 12rpx;
		padding: 24rpx;
		font-size: 28rpx;
		background: white;
	}

	.picker {
		color: #333;
	}

	.textarea {
		height: 200rpx;
	}

	.radio-label, .checkbox-label {
		display: flex;
		align-items: center;
		margin-right: 40rpx;
		margin-bottom: 20rpx;
		font-size: 28rpx;
	}

	.gpa-type-tags {
		display: flex;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}

	.gpa-tag {
		padding: 16rpx 32rpx;
		border: 2rpx solid #ddd;
		border-radius: 12rpx;
		font-size: 24rpx;
		color: #666;
		background: #f8f9fa;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.gpa-tag.active {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
		border-color: #667eea;
	}

	.predict-score {
		font-size: 36rpx;
		color: #ff6b6b;
		font-weight: bold;
		display: block;
		margin: 10rpx 0;
	}

	.predict-tip {
		font-size: 24rpx;
		color: #888;
	}

	.budget-value {
		display: block;
		text-align: center;
		font-size: 32rpx;
		color: #667eea;
		font-weight: bold;
		margin-top: 20rpx;
	}

	.navigation-buttons {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
	}

	.btn-prev, .btn-next, .btn-submit {
		flex: 1;
		border-radius: 12rpx;
		font-size: 28rpx;
		height: 80rpx;
		line-height: 80rpx;
	}

	.btn-prev {
		background: #f8f9fa;
		color: #666;
		border: 2rpx solid #ddd;
	}

	.btn-next {
		background: linear-gradient(135deg, #667eea, #764ba2);
		color: white;
	}

	.btn-submit {
		background: linear-gradient(135deg, #4CAF50, #45a049);
		color: white;
	}
</style>