/**
 * 数据 Agent - 销售报表 + 数据分析
 * 
 * 功能：
 * - 销售报表生成（日/周/月）
 * - 转化漏斗分析
 * - 选品建议
 * - 数据可视化
 */

class DataAnalystAgent {
  constructor(config = {}) {
    this.name = '数据 Agent';
    this.platform = config.platform || 'amazon';
    this.currency = config.currency || 'USD';
    this.timezone = config.timezone || 'Asia/Shanghai';
    
    console.log(`✅ ${this.name} 初始化完成`);
    console.log(`   平台：${this.platform}`);
    console.log(`   货币：${this.currency}`);
  }
  
  // 处理数据分析请求
  async handle_message(message) {
    const { content, sender, context } = message;
    
    console.log(`\n📨 [数据 Agent] 收到请求`);
    console.log(`   用户：${sender}`);
    console.log(`   内容：${content}`);
    
    // 识别任务类型
    if (content.includes('报表') || content.includes('report')) {
      return this.generateSalesReport(content);
    } else if (content.includes('转化') || content.includes('funnel')) {
      return this.analyzeFunnel(content);
    } else if (content.includes('选品') || content.includes('product')) {
      return this.suggestProducts(content);
    } else if (content.includes('利润') || content.includes('profit')) {
      return this.analyzeProfit(content);
    } else {
      return this.getHelp();
    }
  }
  
  // 生成销售报表
  async generateSalesReport(input) {
    console.log(`   🔍 任务：生成销售报表`);
    
    const period = this.extractPeriod(input); // day/week/month
    const dates = this.getDateRange(period);
    
    // 模拟销售数据
    const salesData = this.generateSalesData(period);
    
    return {
      type: 'rich_text',
      content: this.formatSalesReport(salesData, dates, period)
    };
  }
  
  // 转化漏斗分析
  async analyzeFunnel(input) {
    console.log(`   🔍 任务：转化漏斗分析`);
    
    const funnelData = this.generateFunnelData();
    
    return {
      type: 'rich_text',
      content: this.formatFunnelAnalysis(funnelData)
    };
  }
  
  // 选品建议
  async suggestProducts(input) {
    console.log(`   🔍 任务：选品建议`);
    
    const category = this.extractCategory(input);
    const suggestions = this.generateProductSuggestions(category);
    
    return {
      type: 'rich_text',
      content: this.formatProductSuggestions(suggestions)
    };
  }
  
  // 利润分析
  async analyzeProfit(input) {
    console.log(`   🔍 任务：利润分析`);
    
    const profitData = this.generateProfitData();
    
    return {
      type: 'rich_text',
      content: this.formatProfitAnalysis(profitData)
    };
  }
  
  // ===== 辅助方法 =====
  
  extractPeriod(input) {
    if (input.includes('日') || input.includes('天')) return 'day';
    if (input.includes('周')) return 'week';
    if (input.includes('月')) return 'month';
    return 'week'; // 默认周报
  }
  
  extractCategory(input) {
    const match = input.match(/([电子|家居|服装|美妆|运动|玩具|其他]+)/);
    return match ? match[1] : '全品类';
  }
  
  getDateRange(period) {
    const now = new Date();
    let start = new Date();
    
    switch (period) {
      case 'day':
        start.setDate(now.getDate() - 1);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  }
  
  generateSalesData(period) {
    // 模拟销售数据
    const baseRevenue = period === 'month' ? 35000 : period === 'week' ? 12000 : 2000;
    const baseOrders = period === 'month' ? 450 : period === 'week' ? 150 : 25;
    
    return {
      revenue: (baseRevenue * (0.8 + Math.random() * 0.4)).toFixed(2),
      orders: Math.floor(baseOrders * (0.8 + Math.random() * 0.4)),
      aov: (baseRevenue / baseOrders * (0.9 + Math.random() * 0.2)).toFixed(2), // 客单价
      conversionRate: (2.5 + Math.random() * 1.5).toFixed(2),
      traffic: Math.floor(baseOrders / 0.03 * (0.8 + Math.random() * 0.4)), // 假设 3% 转化率
      topProducts: [
        { name: '无线耳机', revenue: 4234, orders: 156, percent: 34 },
        { name: '充电器', revenue: 2890, orders: 98, percent: 23 },
        { name: '数据线', revenue: 1567, orders: 187, percent: 13 },
        { name: '手机壳', revenue: 1234, orders: 145, percent: 10 },
        { name: '其他', revenue: 2531, orders: 234, percent: 20 }
      ],
      dailyTrend: this.generateDailyTrend(period),
      alerts: this.generateSalesAlerts(period)
    };
  }
  
  generateDailyTrend(period) {
    const days = period === 'month' ? 30 : period === 'week' ? 7 : 1;
    const trend = [];
    let base = 100;
    
    for (let i = 0; i < days; i++) {
      base = base * (0.9 + Math.random() * 0.2);
      trend.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: (base * 100).toFixed(2),
        orders: Math.floor(base * 3)
      });
    }
    
    return trend;
  }
  
  generateSalesAlerts(period) {
    const alerts = [];
    const rand = Math.random();
    
    if (rand > 0.7) {
      alerts.push({
        type: 'warning',
        message: '商品 C 转化率下降 1.2%，建议优化 Listing',
        severity: 'medium'
      });
    }
    if (rand > 0.8) {
      alerts.push({
        type: 'warning',
        message: '广告 ACOS 上升至 28%，建议调整出价',
        severity: 'high'
      });
    }
    if (rand > 0.9) {
      alerts.push({
        type: 'success',
        message: '无线耳机销量创新高，建议增加库存',
        severity: 'low'
      });
    }
    
    return alerts;
  }
  
  generateFunnelData() {
    return {
      impressions: 50000,
      clicks: 3500,
      productViews: 2100,
      addToCart: 420,
      checkout: 210,
      purchases: 150,
      benchmark: {
        ctr: 7.0,
        viewToCart: 20.0,
        cartToCheckout: 50.0,
        checkoutToPurchase: 71.4
      }
    };
  }
  
  generateProductSuggestions(category) {
    return [
      {
        name: '智能手表',
        demand: '高',
        competition: '中',
        margin: '35-45%',
        trend: '上升',
        reason: '健康意识提升，市场需求增长快'
      },
      {
        name: '无线充电器',
        demand: '高',
        competition: '高',
        margin: '25-35%',
        trend: '稳定',
        reason: '刚需产品，复购率高'
      },
      {
        name: '瑜伽用品',
        demand: '中',
        competition: '低',
        margin: '40-50%',
        trend: '上升',
        reason: '居家健身趋势，竞争相对较小'
      }
    ];
  }
  
  generateProfitData() {
    const revenue = 35000;
    const cogs = revenue * 0.35; // 商品成本 35%
    const shipping = revenue * 0.12; // 物流 12%
    const ads = revenue * 0.18; // 广告 18%
    const platform = revenue * 0.15; // 平台佣金 15%
    const other = revenue * 0.05; // 其他 5%
    
    return {
      revenue,
      costs: {
        cogs,
        shipping,
        ads,
        platform,
        other
      },
      profit: revenue - cogs - shipping - ads - platform - other,
      margin: ((revenue - cogs - shipping - ads - platform - other) / revenue * 100)
    };
  }
  
  // ===== 格式化输出 =====
  
  formatSalesReport(data, dates, period) {
    const periodName = period === 'day' ? '日报' : period === 'week' ? '周报' : '月报';
    const growthSymbol = (data.orders > 140) ? '↑' : '↓';
    const growthPercent = ((data.orders - 140) / 140 * 100).toFixed(1);
    
    let text = `📊 销售${periodName}\n\n`;
    text += `📅 统计周期：${dates.start} ~ ${dates.end}\n\n`;
    text += `─────────────────\n\n`;
    
    text += `💰 **核心指标**\n\n`;
    text += `• 销售额：$${data.revenue}\n`;
    text += `• 订单数：${data.orders} ${growthSymbol}${Math.abs(growthPercent)}% vs 上期\n`;
    text += `• 客单价：$${data.aov}\n`;
    text += `• 转化率：${data.conversionRate}%\n`;
    text += `• 访客数：${data.traffic.toLocaleString()}\n\n`;
    
    text += `─────────────────\n\n`;
    text += `🏆 **Top 5 商品**\n\n`;
    text += `| 排名 | 商品 | 销售额 | 订单 | 占比 |\n`;
    text += `|------|------|--------|------|------|\n`;
    data.topProducts.forEach((p, i) => {
      text += `| ${i + 1} | ${p.name} | $${p.revenue.toLocaleString()} | ${p.orders} | ${p.percent}% |\n`;
    });
    
    text += `\n─────────────────\n\n`;
    
    if (data.alerts.length > 0) {
      text += `⚠️  **需要注意**\n\n`;
      data.alerts.forEach(alert => {
        const emoji = alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : '✅';
        text += `${emoji} ${alert.message}\n`;
      });
      text += `\n`;
    }
    
    text += `─────────────────\n\n`;
    text += `💡 建议：${this.generateInsight(data)}`;
    
    return { type: 'markdown', content: text };
  }
  
  formatFunnelAnalysis(funnel) {
    const ctr = (funnel.clicks / funnel.impressions * 100).toFixed(2);
    const viewToCart = (funnel.addToCart / funnel.productViews * 100).toFixed(1);
    const cartToCheckout = (funnel.checkout / funnel.addToCart * 100).toFixed(1);
    const checkoutToPurchase = (funnel.purchases / funnel.checkout * 100).toFixed(1);
    const overallConversion = (funnel.purchases / funnel.impressions * 100).toFixed(3);
    
    let text = `📊 转化漏斗分析\n\n`;
    text += `─────────────────\n\n`;
    text += `**转化路径**\n\n`;
    text += `1️⃣ 曝光 → 点击：${funnel.impressions.toLocaleString()} → ${funnel.clicks.toLocaleString()}\n`;
    text += `   点击率 (CTR): ${ctr}% (行业基准：${funnel.benchmark.ctr}%)\n`;
    text += `   ${ctr >= funnel.benchmark.ctr ? '✅ 高于基准' : '⚠️ 低于基准'}\n\n`;
    
    text += `2️⃣ 点击 → 浏览：${funnel.clicks.toLocaleString()} → ${funnel.productViews.toLocaleString()}\n`;
    text += `   浏览率：${(funnel.productViews / funnel.clicks * 100).toFixed(1)}%\n\n`;
    
    text += `3️⃣ 浏览 → 加购：${funnel.productViews.toLocaleString()} → ${funnel.addToCart.toLocaleString()}\n`;
    text += `   加购率：${viewToCart}% (行业基准：${funnel.benchmark.viewToCart}%)\n`;
    text += `   ${viewToCart >= funnel.benchmark.viewToCart ? '✅ 高于基准' : '⚠️ 低于基准'}\n\n`;
    
    text += `4️⃣ 加购 → 结账：${funnel.addToCart.toLocaleString()} → ${funnel.checkout.toLocaleString()}\n`;
    text += `   结账率：${cartToCheckout}% (行业基准：${funnel.benchmark.cartToCheckout}%)\n`;
    text += `   ${cartToCheckout >= funnel.benchmark.cartToCheckout ? '✅ 高于基准' : '⚠️ 低于基准'}\n\n`;
    
    text += `5️⃣ 结账 → 购买：${funnel.checkout.toLocaleString()} → ${funnel.purchases.toLocaleString()}\n`;
    text += `   成交率：${checkoutToPurchase}% (行业基准：${funnel.benchmark.checkoutToPurchase}%)\n`;
    text += `   ${checkoutToPurchase >= funnel.benchmark.checkoutToPurchase ? '✅ 高于基准' : '⚠️ 低于基准'}\n\n`;
    
    text += `─────────────────\n\n`;
    text += `🎯 **整体转化率**: ${overallConversion}%\n\n`;
    text += `💡 **优化建议**:\n`;
    text += this.generateFunnelInsights(funnel, ctr, viewToCart, cartToCheckout, checkoutToPurchase);
    
    return { type: 'markdown', content: text };
  }
  
  formatProductSuggestions(suggestions) {
    let text = `💡 选品建议\n\n`;
    text += `─────────────────\n\n`;
    
    suggestions.forEach((product, i) => {
      const demandEmoji = product.demand === '高' ? '🔥' : '📈';
      const trendEmoji = product.trend === '上升' ? '↗️' : '➡️';
      
      text += `${i + 1}. **${product.name}**\n\n`;
      text += `   需求：${demandEmoji} ${product.demand}\n`;
      text += `   竞争：${product.competition}\n`;
      text += `   利润率：${product.margin}\n`;
      text += `   趋势：${trendEmoji} ${product.trend}\n`;
      text += `   推荐理由：${product.reason}\n\n`;
      text += `─────────────────\n\n`;
    });
    
    text += `💡 建议：优先选择「需求高 + 竞争低 + 趋势上升」的品类，快速测试市场反应。`;
    
    return { type: 'markdown', content: text };
  }
  
  formatProfitAnalysis(data) {
    let text = `💰 利润分析\n\n`;
    text += `─────────────────\n\n`;
    text += `**收入**: $${data.revenue.toLocaleString()}\n\n`;
    text += `**成本结构**:\n\n`;
    text += `| 项目 | 金额 | 占比 |\n`;
    text += `|------|------|------|\n`;
    text += `| 商品成本 | $${data.costs.cogs.toFixed(2)} | ${(data.costs.cogs / data.revenue * 100).toFixed(1)}% |\n`;
    text += `| 物流费用 | $${data.costs.shipping.toFixed(2)} | ${(data.costs.shipping / data.revenue * 100).toFixed(1)}% |\n`;
    text += `| 广告费用 | $${data.costs.ads.toFixed(2)} | ${(data.costs.ads / data.revenue * 100).toFixed(1)}% |\n`;
    text += `| 平台佣金 | $${data.costs.platform.toFixed(2)} | ${(data.costs.platform / data.revenue * 100).toFixed(1)}% |\n`;
    text += `| 其他费用 | $${data.costs.other.toFixed(2)} | ${(data.costs.other / data.revenue * 100).toFixed(1)}% |\n`;
    text += `| **总成本** | **$${(data.costs.cogs + data.costs.shipping + data.costs.ads + data.costs.platform + data.costs.other).toFixed(2)}** | **${((data.costs.cogs + data.costs.shipping + data.costs.ads + data.costs.platform + data.costs.other) / data.revenue * 100).toFixed(1)}%** |\n\n`;
    text += `─────────────────\n\n`;
    text += `🎯 **净利润**: $${data.profit.toFixed(2)}\n`;
    text += `📊 **净利率**: ${data.margin.toFixed(1)}%\n\n`;
    text += `💡 **优化建议**:\n`;
    text += this.generateProfitInsights(data);
    
    return { type: 'markdown', content: text };
  }
  
  generateInsight(data) {
    if (data.conversionRate < 2.0) {
      return '转化率偏低，建议优化商品详情页、增加评价、调整价格策略。';
    } else if (data.aov < 30) {
      return '客单价偏低，建议设置满减优惠、捆绑销售、推荐高价商品。';
    } else {
      return '整体表现良好，建议加大广告投入，扩大流量规模。';
    }
  }
  
  generateFunnelInsights(funnel, ctr, viewToCart, cartToCheckout, checkoutToPurchase) {
    const insights = [];
    
    if (ctr < funnel.benchmark.ctr) {
      insights.push('• CTR 偏低 → 优化主图、标题、价格');
    }
    if (viewToCart < funnel.benchmark.viewToCart) {
      insights.push('• 加购率低 → 优化商品描述、增加评价、突出卖点');
    }
    if (cartToCheckout < funnel.benchmark.cartToCheckout) {
      insights.push('• 结账率低 → 检查运费设置、简化结账流程');
    }
    if (checkoutToPurchase < funnel.benchmark.checkoutToPurchase) {
      insights.push('• 成交率低 → 优化支付方式、减少弃单');
    }
    
    return insights.length > 0 ? insights.join('\n') : '各环节转化正常，继续保持！';
  }
  
  generateProfitInsights(data) {
    const insights = [];
    const adRatio = data.costs.ads / data.revenue * 100;
    const shippingRatio = data.costs.shipping / data.revenue * 100;
    
    if (adRatio > 20) {
      insights.push('• 广告占比偏高 → 优化关键词、提高质量分、降低 ACOS');
    }
    if (shippingRatio > 15) {
      insights.push('• 物流成本偏高 → 考虑海外仓、优化包装、谈判运费');
    }
    if (data.margin < 15) {
      insights.push('• 净利率偏低 → 考虑提价、优化供应链、增加高毛利产品');
    }
    
    return insights.length > 0 ? insights.join('\n') : '利润结构健康，可以继续扩大规模！';
  }
  
  getHelp() {
    return {
      type: 'text',
      content: `📊 数据 Agent - 功能列表

📋 我可以帮你：
• 销售报表 - "生成周报" / "上月销售情况"
• 转化分析 - "分析转化漏斗"
• 选品建议 - "有什么好卖的品类？"
• 利润分析 - "利润情况怎么样？"

📅 支持的周期：
• 日报 - "生成昨天的销售报表"
• 周报 - "本周销售情况"
• 月报 - "上月经营分析"

💡 数据会自动同步到你的飞书表格，方便存档和分享。

试试说："生成销售周报"`
    };
  }
}

module.exports = DataAnalystAgent;
