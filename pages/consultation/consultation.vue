<template>
  <view class="container">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-content">
        <view class="nav-back" @click="goBack">
          <text class="back-icon">‹</text>
          <text>返回</text>
        </view>
        <text class="nav-title">预约咨询</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view class="content" scroll-y="true" :style="{paddingBottom: safeAreaBottom}">
      <!-- 咨询类型选择 -->
      <view class="section">
        <view class="section-title">咨询类型</view>
        <view class="types">
          <view
            v-for="type in consultationTypes"
            :key="type.value"
            class="type-item"
            :class="{ active: formData.type === type.value }"
            @click="formData.type = type.value"
          >
            <view class="type-icon">{{ type.icon }}</view>
            <text class="type-name">{{ type.name }}</text>
            <text class="type-desc">{{ type.desc }}</text>
          </view>
        </view>
      </view>

      <!-- 预约时间 -->
      <view class="section">
        <view class="section-title">预约时间</view>
        <view class="time-picker">
          <picker
            mode="date"
            :value="formData.date"
            @change="e => formData.date = e.detail.value"
          >
            <view class="picker-content">
              <text class="picker-label">选择日期</text>
              <text class="picker-value">{{ formData.date || '请选择日期' }}</text>
            </view>
          </picker>

          <picker
            mode="time"
            :value="formData.time"
            @change="e => formData.time = e.detail.value"
          >
            <view class="picker-content">
              <text class="picker-label">选择时间</text>
              <text class="picker-value">{{ formData.time || '请选择时间' }}</text>
            </view>
          </picker>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="section">
        <view class="section-title">联系方式</view>
        <view class="input-group">
          <view class="input-item">
            <text class="input-label">手机号码</text>
            <input
              v-model="formData.contactPhone"
              type="number"
              placeholder="请输入您的手机号码"
              class="input-field"
              maxlength="11"
            />
          </view>
          <view class="input-item">
            <text class="input-label">电子邮箱</text>
            <input
              v-model="formData.email"
              type="email"
              placeholder="请输入您的电子邮箱"
              class="input-field"
            />
          </view>
        </view>
      </view>

      <!-- 咨询内容 -->
      <view class="section">
        <view class="section-title">咨询内容</view>
        <view class="textarea-container">
          <textarea
            v-model="formData.notes"
            placeholder="请简要描述您想要咨询的问题..."
            class="textarea-field"
            maxlength="500"
            :show-confirm-bar="false"
          />
          <view class="counter">{{ formData.notes.length }}/500</view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-section">
        <button
          class="submit-btn"
          :class="{ disabled: !isFormValid }"
          :disabled="!isFormValid"
          @click="submitConsultation"
        >
          提交预约
        </button>
      </view>

      <!-- 预约说明 -->
      <view class="notice-section">
        <view class="notice-title">预约须知</view>
        <view class="notice-list">
          <text class="notice-item">• 预约成功后，我们的顾问将在24小时内与您联系</text>
          <text class="notice-item">• 请确保联系方式准确无误</text>
          <text class="notice-item">• 如需修改预约时间，请提前2小时联系客服</text>
          <text class="notice-item">• 咨询时长：30分钟/次</text>
        </view>
      </view>
    </scroll-view>

    <!-- 成功弹窗 -->
    <view class="modal" v-if="showSuccessModal">
      <view class="modal-content">
        <view class="modal-icon">✓</view>
        <text class="modal-title">预约成功</text>
        <text class="modal-desc">我们的顾问将在24小时内与您联系，请保持电话畅通</text>
        <button class="modal-btn" @click="closeModal">确定</button>
      </view>
    </view>
  </view>
</template>

<script>
import { consultationAPI } from "@/api/index.js";

export default {
  data() {
    return {
      safeAreaBottom: '120rpx',
      showSuccessModal: false,
      consultationTypes: [
        { value: 'online', icon: '💻', name: '线上咨询', desc: '视频/语音通话' },
        { value: 'phone', icon: '📞', name: '电话咨询', desc: '电话沟通' },
        { value: 'onsite', icon: '🏢', name: '线下咨询', desc: '到店咨询' }
      ],
      formData: {
        type: 'online',
        date: '',
        time: '',
        contactPhone: '',
        email: '',
        notes: ''
      }
    };
  },
  computed: {
    isFormValid() {
      return this.formData.date && this.formData.time && this.formData.contactPhone && this.formData.email && this.formData.notes;
    }
  },
  onLoad() {
    this.calculateSafeArea();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.formData.date = this.formatDate(tomorrow);
  },
  methods: {
    calculateSafeArea() {
      const systemInfo = uni.getSystemInfoSync();
      const safeArea = systemInfo.safeArea;
      if (safeArea) {
        const bottom = systemInfo.screenHeight - safeArea.bottom;
        this.safeAreaBottom = bottom + 120 + 'rpx';
      }
    },
    formatDate(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    },
    goBack() {
      uni.navigateBack();
    },
    async submitConsultation() {
      if (!this.isFormValid) {
        uni.showToast({ title: '请填写完整信息', icon: 'none' });
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(this.formData.contactPhone)) {
        uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
        uni.showToast({ title: '请输入正确的邮箱地址', icon: 'none' });
        return;
      }
      try {
        uni.showLoading({ title: '提交中...', mask: true });
        const response = await consultationAPI.createConsultation({
          type: this.formData.type,
          preferred_time: `${this.formData.date}T${this.formData.time}:00Z`,
          contact_phone: this.formData.contactPhone,
          notes: this.formData.notes
        });
        uni.hideLoading();
        if (response.code === 0) {
          this.showSuccessModal = true;
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          this.formData = { ...this.formData, date: this.formatDate(tomorrow), time: '', contactPhone: '', email: '', notes: '' };
        } else {
          uni.showToast({ title: response.message || '预约失败', icon: 'none' });
        }
      } catch (error) {
        uni.hideLoading();
        uni.showToast({ title: '网络请求失败，请重试', icon: 'none' });
      }
    },
    closeModal() {
      this.showSuccessModal = false;
      this.goBack();
    }
  }
}
</script>

<style>
.container { flex: 1; background: #F7F9FC; min-height: 100vh; }

.nav-bar { background: #FFFFFF; box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06); padding: 32rpx 48rpx; }
.nav-content { display: flex; align-items: center; justify-content: space-between; }
.nav-back { display: flex; align-items: center; gap: 8rpx; color: #006B5C; font-size: 28rpx; font-weight: 500; }
.back-icon { font-size: 36rpx; font-weight: bold; }
.nav-title { font-size: 36rpx; font-weight: 700; color: #191C1E; }
.nav-placeholder { width: 100rpx; }

.content { flex: 1; padding: 32rpx 24rpx; box-sizing: border-box; }

.section { background: #FFFFFF; border-radius: 24rpx; padding: 32rpx; margin-bottom: 24rpx; box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06); border: 1rpx solid rgba(0, 0, 0, 0.05); }
.section-title { font-size: 32rpx; font-weight: 700; color: #191C1E; margin-bottom: 24rpx; }

.types { display: flex; flex-direction: column; gap: 16rpx; }
.type-item { display: flex; align-items: center; padding: 24rpx; border: 2rpx solid #E2E8F0; border-radius: 16rpx; transition: all 0.3s ease; cursor: pointer; }
.type-item.active { border-color: #006B5C; background: rgba(0, 107, 92, 0.05); }
.type-icon { font-size: 40rpx; margin-right: 20rpx; width: 60rpx; text-align: center; }
.type-name { flex: 1; font-size: 28rpx; font-weight: 600; color: #191C1E; }
.type-desc { font-size: 24rpx; color: #64748B; font-weight: 500; }

.time-picker { display: flex; gap: 16rpx; }
.picker-content { display: flex; flex-direction: column; padding: 24rpx; border: 2rpx solid #E2E8F0; border-radius: 12rpx; cursor: pointer; transition: border-color 0.3s ease; }
.picker-content:active { border-color: #006B5C; }
.picker-label { font-size: 24rpx; color: #64748B; margin-bottom: 8rpx; }
.picker-value { font-size: 28rpx; color: #191C1E; font-weight: 500; }

.input-group { display: flex; flex-direction: column; gap: 24rpx; }
.input-item { display: flex; flex-direction: column; gap: 12rpx; }
.input-label { font-size: 28rpx; color: #191C1E; font-weight: 600; }
.input-field { padding: 20rpx; border: 2rpx solid #E2E8F0; border-radius: 12rpx; font-size: 28rpx; background: #FFFFFF; }
.input-field:focus { border-color: #006B5C; }

.textarea-container { position: relative; }
.textarea-field { width: 100%; height: 200rpx; padding: 20rpx; border: 2rpx solid #E2E8F0; border-radius: 12rpx; font-size: 28rpx; background: #FFFFFF; box-sizing: border-box; }
.textarea-field:focus { border-color: #006B5C; }
.counter { position: absolute; bottom: 12rpx; right: 12rpx; font-size: 24rpx; color: #64748B; }

.submit-section { padding: 32rpx 0; }
.submit-btn { background: linear-gradient(145deg, #006B5C 0%, #00BFA5 100%); color: #FFFFFF; border: none; border-radius: 16rpx; padding: 28rpx; font-size: 32rpx; font-weight: 600; width: 100%; transition: all 0.3s ease; }
.submit-btn:active { transform: scale(0.98); }
.submit-btn.disabled { background: #CBD5E1; color: #94A3B8; cursor: not-allowed; }
.submit-btn.disabled:active { transform: none; }

.notice-section { background: #F8FAFC; border-radius: 16rpx; padding: 24rpx; margin-top: 32rpx; }
.notice-title { font-size: 28rpx; font-weight: 600; color: #191C1E; margin-bottom: 16rpx; }
.notice-list { display: flex; flex-direction: column; gap: 12rpx; }
.notice-item { font-size: 24rpx; color: #64748B; line-height: 1.5; }

.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-content { background: #FFFFFF; border-radius: 24rpx; padding: 48rpx; margin: 48rpx; text-align: center; max-width: 600rpx; }
.modal-icon { font-size: 80rpx; color: #00BFA5; margin-bottom: 24rpx; }
.modal-title { font-size: 36rpx; font-weight: 700; color: #191C1E; margin-bottom: 16rpx; display: block; }
.modal-desc { font-size: 28rpx; color: #64748B; line-height: 1.5; margin-bottom: 32rpx; display: block; }
.modal-btn { background: #006B5C; color: #FFFFFF; border: none; border-radius: 12rpx; padding: 20rpx 40rpx; font-size: 28rpx; font-weight: 600; }
</style>