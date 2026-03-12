# Profile 模块字段映射说明

## 接口文档字段定义

根据接口文档，用户画像模块包含以下字段结构：

### 获取用户画像响应结构
```json
{
  "data": {
    "user_id": 10001,
    "completed_steps": 3,
    "total_steps": 4,
    "completion_rate": 75,
    "profile": {
      // Step 1: 学术背景
      "education_level": "bachelor",      // 本科/硕士/博士
      "school_name": "清华大学",
      "school_rank": 1,
      "major": "计算机科学与技术",
      "gpa": 3.75,
      "gpa_scale": "4.0",                // 4.0/5.0/100
      
      // Step 2: 语言标化
      "toefl": 105,
      "ielts": 7.5,
      "gre": 325,
      "gmat": null,
      
      // Step 3: 科研实习
      "internships": [
        {
          "company": "字节跳动",
          "position": "后端开发实习生",
          "duration_months": 3,
          "description": "负责高并发服务优化"
        }
      ],
      "research": [
        {
          "title": "分布式系统容错研究",
          "role": "主要研究者",
          "duration_months": 6,
          "description": "研究分布式系统容错机制"
        }
      ],
      "awards": [
        {
          "name": "ACM程序设计大赛银奖",
          "level": "省级",
          "year": 2025
        }
      ],
      
      // Step 4: 意向偏好
      "target_countries": ["US", "UK", "CA"],
      "target_majors": ["Computer Science", "Data Science"],
      "target_degree": "master",
      "budget_range": "30-50w/year",
      "career_goal": "互联网大厂技术专家"
    }
  }
}
```

## 前端页面字段映射

### 1. profile.vue (个人中心页)
- **用户信息**: `userInfo` 对象
  - `userInfo.nickname` → 用户昵称
  - `userInfo.avatar` → 用户头像
  - `userInfo.tier` → 用户层级 (free/premium)
  - `userInfo.plan_count` → 已生成方案数量
  - `userInfo.favorite_count` → 收藏院校数量
  - `userInfo.chat_count` → 对话次数

- **完成度信息**: `completionData` 对象
  - `completionData.completed_steps` → 已完成步骤数
  - `completionData.total_steps` → 总步骤数
  - `completionData.completion_rate` → 完成百分比

### 2. edit.vue (编辑个人信息页)
- **表单字段映射**:
  - `formData.education` → `profile.education_level`
  - `formData.university` → `profile.school_name`
  - `formData.major` → `profile.major`
  - `formData.gpa` → `profile.gpa`
  - `formData.languageType` + `formData.languageScore` → `profile.toefl`/`profile.ielts`
  - `formData.examType` + `formData.examScore` → `profile.gre`/`profile.gmat`
  - `formData.targetCountry` → `profile.target_countries[0]`
  - `formData.targetMajor` → `profile.target_majors[0]`
  - `formData.targetDegree` → `profile.target_degree`

### 3. create-profile.vue (创建资料页)
- **Step 1 学术背景**:
  - `formData.university` → `profile.school_name`
  - `formData.major` → `profile.major`
  - `formData.gpa` → `profile.gpa`
  - `formData.examType` + `formData.examTotalScore` → `profile.toefl`/`profile.ielts`/`profile.gre`/`profile.gmat`

- **Step 2 科研实习**:
  - `formData.workExperiences` → `profile.internships`
  - `formData.researchExperiences` → `profile.research`
  - `formData.honors` → `profile.awards`

- **Step 3 意向偏好**:
  - `formData.preferences.countries` → `profile.target_countries`
  - `formData.preferences.fields` → `profile.target_majors`
  - `formData.preferences.degrees[0]` → `profile.target_degree`
  - `formData.preferences.budget` → `profile.budget_range`

## 字段转换规则

### 1. 学历级别转换
```javascript
// 前端显示值 → 后端存储值
'本科' → 'bachelor'
'硕士' → 'master' 
'博士' → 'phd'
'其他' → 'other'
```

### 2. 国家代码转换
```javascript
// 前端显示值 → 后端存储值
'美国' → 'US'
'英国' → 'UK'
'加拿大' → 'CA'
'澳大利亚' → 'AU'
'新加坡' → 'SG'
'香港' → 'HK'
```

### 3. 学位转换
```javascript
// 前端显示值 → 后端存储值
'硕士' → 'master'
'博士' → 'phd'
'本科' → 'bachelor'
'MBA' → 'mba'
'EMBA' → 'emba'
```

## 数据验证规则

### 必填字段验证
- **edit.vue**: 姓名、性别、学历
- **create-profile.vue**: 
  - Step 1: 毕业院校、专业、GPA
  - Step 3: 目标国家、目标专业、目标学位、预算范围

### 数据格式验证
- GPA: 0-4.0 或 0-5.0 范围内的数字
- 语言成绩: 托福(0-120)、雅思(0-9)、GRE(260-340)、GMAT(200-800)
- 日期格式: YYYY-MM 或 YYYY-MM-DD

## 错误处理

### 常见错误码
- 1001: 参数错误 - 检查字段格式和必填项
- 1002/1003: Token过期 - 重新登录
- 2001: 用户不存在 - 检查用户ID
- 5001: 服务器内部错误 - 重试操作

### 错误处理策略
1. 显示用户友好的错误信息
2. 提供重试机制
3. 记录错误日志用于调试
4. 网络错误时提供离线保存选项

## 性能优化建议

1. **数据缓存**: 用户基本信息可缓存24小时
2. **懒加载**: 用户画像数据按需加载
3. **批量操作**: 多个字段更新时使用批量接口
4. **本地存储**: 网络异常时使用本地存储暂存数据

## 测试要点

1. **字段映射测试**: 验证前后端字段正确对应
2. **数据转换测试**: 验证数据类型和格式转换
3. **错误处理测试**: 模拟各种错误场景
4. **性能测试**: 大数据量下的响应速度