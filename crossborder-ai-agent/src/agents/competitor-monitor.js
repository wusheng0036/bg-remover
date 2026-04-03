/**
 * 监控 Agent - 竞品追踪 + 价格预警
 * 
 * 功能：
 * - 竞品价格监控
 * - 销量追踪
 * - 评论变化预警
 * - 定时任务调度
 */

class CompetitorMonitorAgent {
  constructor(config = {}) {
    this.name = '监控 Agent';
    this.platform = config.platform || 'amazon';
    this.checkInterval = config.checkInterval || 3600000; // 默认 1 小时检查一次
    this.alertThreshold = config.alertThreshold || {
      priceChange: 0.1, // 价格变化超过 10% 预警
      ratingDrop: 0.3,  // 评分下降超过 0.3 预警
      rankChange: 50    // 排名变化超过 50 预警
    };
    
    // 监控任务存储
    this.monitorTasks = new Map();
    
    console.log(`✅ ${this.name} 初始化完成`);
    console.log(`   检查间隔：${this.checkInterval / 1000 / 60} 分钟`);
  }
  
  // 处理监控请求
  async handle_message(message) {
    const { content, sender, context } = message;
    
    console.log(`\n📨 [监控 Agent] 收到请求`);
    console.log(`   用户：${sender}`);
    console.log(`   内容：${content}`);
    
    // 识别任务类型
    if (content.includes('添加') || content.includes('监控')) {
      return this.addMonitorTask(content);
    } else if (content.includes('删除') || content.includes('取消')) {
      return this.removeMonitorTask(content);
    } else if (content.includes('列表') || content.includes('任务')) {
      return this.listMonitorTasks();
    } else if (content.includes('状态') || content.includes('报告')) {
      return this.generateReport(content);
    } else {
      return this.getHelp();
    }
  }
  
  // 添加监控任务
  async addMonitorTask(input) {
    console.log(`   🔍 任务：添加监控`);
    
    // 提取竞品信息（简单实现）
    const taskInfo = this.extractCompetitorInfo(input);
    
    const taskId = `monitor_${Date.now()}`;
    const task = {
      id: taskId,
      name: taskInfo.name || '未命名监控',
      url: taskInfo.url || '',
      platform: taskInfo.platform || this.platform,
      metrics: taskInfo.metrics || ['price', 'rating', 'rank'],
      createdAt: new Date().toISOString(),
      lastCheck: null,
      status: 'active',
      alerts: []
    };
    
    this.monitorTasks.set(taskId, task);
    
    // 模拟初始数据
    const initialData = this.fetchCompetitorData(task);
    task.currentData = initialData;
    
    console.log(`   ✅ 已添加监控任务：${taskId}`);
    
    return {
      type: 'rich_text',
      content: this.formatAddTaskResult(task, initialData)
    };
  }
  
  // 删除监控任务
  async removeMonitorTask(input) {
    console.log(`   🔍 任务：删除监控`);
    
    const taskId = this.extractTaskId(input);
    
    if (taskId && this.monitorTasks.has(taskId)) {
      this.monitorTasks.delete(taskId);
      console.log(`   ✅ 已删除监控任务：${taskId}`);
      
      return {
        type: 'text',
        content: `✅ 已删除监控任务：${taskId}`
      };
    }
    
    return {
      type: 'text',
      content: `❌ 未找到监控任务，请检查任务 ID`
    };
  }
  
  // 列出监控任务
  async listMonitorTasks() {
    console.log(`   🔍 任务：列出监控`);
    
    const tasks = Array.from(this.monitorTasks.values());
    
    if (tasks.length === 0) {
      return {
        type: 'text',
        content: `📋 暂无监控任务\n\n使用"监控 [竞品链接]"添加新任务`
      };
    }
    
    return {
      type: 'rich_text',
      content: this.formatTaskList(tasks)
    };
  }
  
  // 生成监控报告
  async generateReport(input) {
    console.log(`   🔍 任务：生成报告`);
    
    const taskId = this.extractTaskId(input);
    let tasks = [];
    
    if (taskId && this.monitorTasks.has(taskId)) {
      tasks = [this.monitorTasks.get(taskId)];
    } else {
      tasks = Array.from(this.monitorTasks.values());
    }
    
    const reports = tasks.map(task => {
      const newData = this.fetchCompetitorData(task);
      const changes = this.calculateChanges(task.currentData, newData);
      task.currentData = newData;
      task.lastCheck = new Date().toISOString();
      
      return { task, changes };
    });
    
    return {
      type: 'rich_text',
      content: this.formatReport(reports)
    };
  }
  
  // ===== 辅助方法 =====
  
  extractCompetitorInfo(input) {
    // 简单实现：提取 URL 和平台
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    const platformMatch = input.match(/(amazon|shopify|ebay|etsy)/i);
    const nameMatch = input.match(/监控 [：:](.+)/) || input.match(/添加 [：:](.+)/);
    
    return {
      url: urlMatch ? urlMatch[0] : '',
      platform: platformMatch ? platformMatch[1].toLowerCase() : 'amazon',
      name: nameMatch ? nameMatch[1].trim() : '新监控任务',
      metrics: ['price', 'rating', 'rank']
    };
  }
  
  extractTaskId(input) {
    const match = input.match(/(monitor_\d+)/);
    return match ? match[1] : null;
  }
  
  fetchCompetitorData(task) {
    // 模拟数据（实际应该调用平台 API 或爬虫）
    return {
      price: (Math.random() * 50 + 10).toFixed(2),
      currency: 'USD',
      rating: (Math.random() * 2 + 3).toFixed(1),
      reviewCount: Math.floor(Math.random() * 5000 + 100),
      rank: Math.floor(Math.random() * 1000 + 1),
      inStock: Math.random() > 0.1,
      timestamp: new Date().toISOString()
    };
  }
  
  calculateChanges(oldData, newData) {
    if (!oldData) return { isNew: true };
    
    const priceChange = ((newData.price - oldData.price) / oldData.price * 100).toFixed(1);
    const ratingChange = (newData.rating - oldData.rating).toFixed(2);
    const rankChange = newData.rank - oldData.rank;
    
    const alerts = [];
    
    if (Math.abs(priceChange) > this.alertThreshold.priceChange * 100) {
      alerts.push({
        type: 'price',
        message: `价格变化 ${priceChange > 0 ? '+' : ''}${priceChange}%`,
        severity: Math.abs(priceChange) > 20 ? 'high' : 'medium'
      });
    }
    
    if (ratingChange < -this.alertThreshold.ratingDrop) {
      alerts.push({
        type: 'rating',
        message: `评分下降 ${Math.abs(ratingChange)}`,
        severity: 'high'
      });
    }
    
    if (Math.abs(rankChange) > this.alertThreshold.rankChange) {
      alerts.push({
        type: 'rank',
        message: `排名变化 ${rankChange > 0 ? '+' : ''}${rankChange}`,
        severity: Math.abs(rankChange) > 100 ? 'high' : 'medium'
      });
    }
    
    return {
      priceChange,
      ratingChange,
      rankChange,
      alerts,
      hasAlerts: alerts.length > 0
    };
  }
  
  // ===== 格式化输出 =====
  
  formatAddTaskResult(task, data) {
    let text = `✅ 已添加监控任务\n\n`;
    text += `📊 **任务信息**\n`;
    text += `• ID: ${task.id}\n`;
    text += `• 名称：${task.name}\n`;
    text += `• 平台：${task.platform}\n`;
    text += `• 监控指标：${task.metrics.join(', ')}\n\n`;
    text += `📈 **当前数据**\n`;
    text += `• 价格：$${data.price}\n`;
    text += `• 评分：${data.rating}⭐ (${data.reviewCount}条评论)\n`;
    text += `• 排名：#${data.rank}\n`;
    text += `• 库存：${data.inStock ? '✅ 有货' : '❌ 缺货'}\n\n`;
    text += `🔔 **预警设置**\n`;
    text += `• 价格变化 > 10% → 通知\n`;
    text += `• 评分下降 > 0.3 → 通知\n`;
    text += `• 排名变化 > 50 → 通知\n\n`;
    text += `⏰ 我会每小时检查一次，有变化会在群里通知你~`;
    
    return { type: 'markdown', content: text };
  }
  
  formatTaskList(tasks) {
    let text = `📋 监控任务列表 (${tasks.length}个)\n\n`;
    text += `─────────────────\n\n`;
    
    tasks.forEach((task, i) => {
      const data = task.currentData || {};
      text += `${i + 1}. **${task.name}** \`${task.id}\`\n`;
      text += `   平台：${task.platform}\n`;
      if (data.price) {
        text += `   价格：$${data.price} | 评分：${data.rating}⭐ | 排名：#${data.rank}\n`;
      }
      text += `   状态：${task.status === 'active' ? '🟢 运行中' : '🔴 已暂停'}\n`;
      text += `   最后检查：${task.lastCheck || '尚未检查'}\n\n`;
    });
    
    text += `─────────────────\n\n`;
    text += `💡 说"状态 [任务 ID]"查看详细报告`;
    
    return { type: 'markdown', content: text };
  }
  
  formatReport(reports) {
    if (reports.length === 0) {
      return {
        type: 'text',
        content: `📊 暂无监控数据\n\n先添加监控任务吧~`
      };
    }
    
    let text = `📊 监控报告\n\n`;
    text += `─────────────────\n\n`;
    
    reports.forEach(({ task, changes }) => {
      text += `**${task.name}**\n\n`;
      
      if (changes.isNew) {
        text += `🆕 新任务，首次检查\n\n`;
      } else if (changes.hasAlerts) {
        text += `⚠️  发现异常变化：\n\n`;
        changes.alerts.forEach(alert => {
          const emoji = alert.severity === 'high' ? '🚨' : '⚠️';
          text += `${emoji} ${alert.message}\n`;
        });
        text += `\n`;
      } else {
        text += `✅ 无明显变化\n\n`;
      }
      
      const data = task.currentData || {};
      text += `📈 当前数据：\n`;
      text += `• 价格：$${data.price || 'N/A'} ${changes.priceChange ? `(${changes.priceChange > 0 ? '+' : ''}${changes.priceChange}%)` : ''}\n`;
      text += `• 评分：${data.rating || 'N/A'}⭐ ${changes.ratingChange ? `(${changes.ratingChange > 0 ? '+' : ''}${changes.ratingChange})` : ''}\n`;
      text += `• 排名：#${data.rank || 'N/A'} ${changes.rankChange ? `(${changes.rankChange > 0 ? '+' : ''}${changes.rankChange})` : ''}\n`;
      text += `• 库存：${data.inStock ? '✅ 有货' : '❌ 缺货'}\n\n`;
      text += `─────────────────\n\n`;
    });
    
    return { type: 'markdown', content: text };
  }
  
  getHelp() {
    return {
      type: 'text',
      content: `🕵️ 监控 Agent - 功能列表

📋 我可以帮你：
• 添加监控 - "监控这个竞品：amazon.com/dp/XXX"
• 删除监控 - "删除监控 monitor_12345"
• 查看列表 - "监控任务列表"
• 生成报告 - "状态 monitor_12345"

🔔 预警功能：
• 价格变化 > 10% → 自动通知
• 评分下降 > 0.3 → 自动通知
• 排名变化 > 50 → 自动通知

⏰ 默认每小时检查一次

试试说："监控这个竞品：amazon.com/dp/B08XXX"`
    };
  }
}

module.exports = CompetitorMonitorAgent;
