"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      currentStep: 1,
      steps: [1, 2, 3, 4],
      educationIndex: 0,
      educationOptions: ["本科", "硕士", "博士", "其他"],
      gpaTypeOptions: [
        { label: "百分制", value: "percent" },
        { label: "4.0制", value: "four" },
        { label: "5.0制", value: "five" }
      ],
      languageTypeIndex: 0,
      languageTypeOptions: ["雅思", "托福", "GRE", "GMAT", "其他"],
      companyTypeIndex: 0,
      companyTypeOptions: ["名企", "普企", "创业公司", "其他"],
      scoreStatusOptions: [
        { name: "已有成绩", value: "hasScore" },
        { name: "备考中", value: "preparing" },
        { name: "AI预测", value: "predict" }
      ],
      countryOptions: ["美国", "英国", "加拿大", "澳大利亚", "新加坡", "香港", "其他"],
      formData: {
        // 学业背景
        education: "本科",
        school: "",
        major: "",
        gpa: "",
        // 语言成绩
        languageType: "雅思",
        scoreStatus: "hasScore",
        score: "",
        examDate: "",
        predictScore: "85-90",
        // 工作经历
        companyType: "名企",
        company: "",
        position: "",
        workDuration: "",
        workDescription: "",
        // 留学意向
        targetCountries: [],
        targetMajor: "",
        budget: 50
      }
    };
  },
  methods: {
    // 步骤导航
    nextStep() {
      if (this.validateCurrentStep()) {
        this.currentStep++;
      }
    },
    prevStep() {
      this.currentStep--;
    },
    // 表单验证
    validateCurrentStep() {
      switch (this.currentStep) {
        case 1:
          if (!this.formData.school || !this.formData.major || !this.formData.gpa) {
            common_vendor.index.showToast({ title: "请填写完整的学业信息", icon: "none" });
            return false;
          }
          break;
        case 2:
          if (this.formData.scoreStatus === "hasScore" && !this.formData.score) {
            common_vendor.index.showToast({ title: "请填写考试成绩", icon: "none" });
            return false;
          }
          if (this.formData.scoreStatus === "preparing" && !this.formData.examDate) {
            common_vendor.index.showToast({ title: "请选择考试时间", icon: "none" });
            return false;
          }
          break;
        case 3:
          if (!this.formData.company || !this.formData.position || !this.formData.workDuration) {
            common_vendor.index.showToast({ title: "请填写完整的工作信息", icon: "none" });
            return false;
          }
          break;
        case 4:
          if (this.formData.targetCountries.length === 0 || !this.formData.targetMajor) {
            common_vendor.index.showToast({ title: "请选择目标国家和专业", icon: "none" });
            return false;
          }
          break;
      }
      return true;
    },
    // 选择器变化
    bindEducationChange(e) {
      this.educationIndex = e.detail.value;
      this.formData.education = this.educationOptions[this.educationIndex];
    },
    bindLanguageTypeChange(e) {
      this.languageTypeIndex = e.detail.value;
      this.formData.languageType = this.languageTypeOptions[this.languageTypeIndex];
    },
    bindCompanyTypeChange(e) {
      this.companyTypeIndex = e.detail.value;
      this.formData.companyType = this.companyTypeOptions[this.companyTypeIndex];
    },
    bindScoreStatusChange(e) {
      this.formData.scoreStatus = e.detail.value;
    },
    bindExamDateChange(e) {
      this.formData.examDate = e.detail.value;
    },
    bindCountryChange(e) {
      this.formData.targetCountries = e.detail.value;
    },
    bindBudgetChange(e) {
      this.formData.budget = e.detail.value;
    },
    // GPA类型选择
    selectGpaType(type) {
      this.formData.gpaType = type;
    },
    // 获取GPA占位符文本
    getGpaPlaceholder(type) {
      const placeholders = {
        "percent": "百分制成绩（如：85）",
        "four": "4.0制GPA（如：3.5）",
        "five": "5.0制GPA（如：4.2）"
      };
      return placeholders[type] || "GPA成绩";
    },
    // 提交表单
    submitForm() {
      if (this.validateCurrentStep()) {
        common_vendor.index.showLoading({ title: "提交中..." });
        common_vendor.index.setStorageSync("userStudyInfo", this.formData);
        setTimeout(() => {
          common_vendor.index.hideLoading();
          common_vendor.index.showToast({ title: "信息提交成功！" });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        }, 1e3);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.currentStep / 4 * 100 + "%",
    b: common_vendor.f($data.steps, (step, index, i0) => {
      return common_vendor.e({
        a: $data.currentStep > index
      }, $data.currentStep > index ? {} : {}, {
        b: index,
        c: common_vendor.n($data.currentStep > index ? "completed" : ""),
        d: common_vendor.n($data.currentStep === index + 1 ? "active" : "")
      });
    }),
    c: common_vendor.t($data.currentStep),
    d: $data.currentStep === 1
  }, $data.currentStep === 1 ? {
    e: common_vendor.t($data.educationOptions[$data.educationIndex]),
    f: common_vendor.o((...args) => $options.bindEducationChange && $options.bindEducationChange(...args)),
    g: $data.educationIndex,
    h: $data.educationOptions,
    i: $data.formData.school,
    j: common_vendor.o(($event) => $data.formData.school = $event.detail.value),
    k: $data.formData.major,
    l: common_vendor.o(($event) => $data.formData.major = $event.detail.value),
    m: common_vendor.f($data.gpaTypeOptions, (type, index, i0) => {
      return {
        a: common_vendor.t(type.label),
        b: index,
        c: common_vendor.n($data.formData.gpaType === type.value ? "active" : ""),
        d: common_vendor.o(($event) => $options.selectGpaType(type.value), index)
      };
    }),
    n: "请输入" + ($data.formData.gpaType ? $options.getGpaPlaceholder($data.formData.gpaType) : "GPA成绩"),
    o: $data.formData.gpa,
    p: common_vendor.o(($event) => $data.formData.gpa = $event.detail.value)
  } : {}, {
    q: $data.currentStep === 2
  }, $data.currentStep === 2 ? common_vendor.e({
    r: common_vendor.t($data.languageTypeOptions[$data.languageTypeIndex]),
    s: common_vendor.o((...args) => $options.bindLanguageTypeChange && $options.bindLanguageTypeChange(...args)),
    t: $data.languageTypeIndex,
    v: $data.languageTypeOptions,
    w: common_vendor.f($data.scoreStatusOptions, (item, index, i0) => {
      return {
        a: item.value,
        b: $data.formData.scoreStatus === item.value,
        c: common_vendor.t(item.name),
        d: index
      };
    }),
    x: common_vendor.o((...args) => $options.bindScoreStatusChange && $options.bindScoreStatusChange(...args)),
    y: $data.formData.scoreStatus === "hasScore"
  }, $data.formData.scoreStatus === "hasScore" ? {
    z: $data.formData.score,
    A: common_vendor.o(($event) => $data.formData.score = $event.detail.value)
  } : {}, {
    B: $data.formData.scoreStatus === "preparing"
  }, $data.formData.scoreStatus === "preparing" ? {
    C: common_vendor.t($data.formData.examDate || "请选择考试时间"),
    D: common_vendor.o((...args) => $options.bindExamDateChange && $options.bindExamDateChange(...args))
  } : {}, {
    E: $data.formData.scoreStatus === "predict"
  }, $data.formData.scoreStatus === "predict" ? {
    F: common_vendor.t($data.formData.predictScore || "85-90")
  } : {}) : {}, {
    G: $data.currentStep === 3
  }, $data.currentStep === 3 ? {
    H: common_vendor.t($data.companyTypeOptions[$data.companyTypeIndex]),
    I: common_vendor.o((...args) => $options.bindCompanyTypeChange && $options.bindCompanyTypeChange(...args)),
    J: $data.companyTypeIndex,
    K: $data.companyTypeOptions,
    L: $data.formData.company,
    M: common_vendor.o(($event) => $data.formData.company = $event.detail.value),
    N: $data.formData.position,
    O: common_vendor.o(($event) => $data.formData.position = $event.detail.value),
    P: $data.formData.workDuration,
    Q: common_vendor.o(($event) => $data.formData.workDuration = $event.detail.value),
    R: $data.formData.workDescription,
    S: common_vendor.o(($event) => $data.formData.workDescription = $event.detail.value)
  } : {}, {
    T: $data.currentStep === 4
  }, $data.currentStep === 4 ? {
    U: common_vendor.f($data.countryOptions, (country, index, i0) => {
      return {
        a: country,
        b: $data.formData.targetCountries.includes(country),
        c: common_vendor.t(country),
        d: index
      };
    }),
    V: common_vendor.o((...args) => $options.bindCountryChange && $options.bindCountryChange(...args)),
    W: $data.formData.targetMajor,
    X: common_vendor.o(($event) => $data.formData.targetMajor = $event.detail.value),
    Y: $data.formData.budget,
    Z: common_vendor.o((...args) => $options.bindBudgetChange && $options.bindBudgetChange(...args)),
    aa: common_vendor.t($data.formData.budget)
  } : {}, {
    ab: $data.currentStep > 1
  }, $data.currentStep > 1 ? {
    ac: common_vendor.o((...args) => $options.prevStep && $options.prevStep(...args))
  } : {}, {
    ad: $data.currentStep < 4
  }, $data.currentStep < 4 ? {
    ae: common_vendor.o((...args) => $options.nextStep && $options.nextStep(...args))
  } : {}, {
    af: $data.currentStep === 4
  }, $data.currentStep === 4 ? {
    ag: common_vendor.o((...args) => $options.submitForm && $options.submitForm(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user-info/user-info.js.map
