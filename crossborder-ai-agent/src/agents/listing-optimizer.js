/**
 * 运营 Agent - Listing 优化 + 内容生成
 * 
 * 功能：
 * - 商品标题优化（SEO + 转化）
 * - 商品描述生成（多版本 A/B 测试）
 * - 关键词研究
 * - 社媒文案批量生产
 */

class ListingOptimizerAgent {
  constructor(config = {}) {
    this.name = '运营 Agent';
    this.platform = config.platform || 'amazon';
    this.language = config.language || 'zh';
    this.aiModel = config.aiModel || 'deepseek';
    
    // 标题长度限制（不同平台）
    this.titleLimits = {
      amazon: 200,
      shopify: 255,
      etsy: 140,
      ebay: 80
    };
    
    console.log(`✅ ${this.name} 初始化完成`);
    console.log(`   平台：${this.platform}`);
    console.log(`   AI 模型：${this.aiModel}`);
  }
  
  // 处理优化请求
  async handle_message(message) {
    const { content, sender, context } = message;
    
    console.log(`\n📨 [运营 Agent] 收到请求`);
    console.log(`   用户：${sender}`);
    console.log(`   内容：${content}`);
    
    // 识别任务类型
    if (content.includes('标题') || content.includes('title')) {
      return this.optimizeTitle(content);
    } else if (content.includes('描述') || content.includes('description')) {
      return this.generateDescription(content);
    } else if (content.includes('关键词') || content.includes('keyword')) {
      return this.researchKeywords(content);
    } else if (content.includes('文案') || content.includes('copy')) {
      return this.generateSocialCopy(content);
    } else {
      return this.getHelp();
    }
  }
  
  // 优化商品标题
  async optimizeTitle(input) {
    console.log(`   🔍 任务：优化标题`);
    
    // 提取原始标题（简单实现，实际应该用 AI 提取）
    const originalTitle = this.extractTitle(input);
    
    // 生成 3 个版本
    const versions = [
      {
        type: 'SEO 优先',
        title: this.generateSEOTitle(originalTitle),
        description: '包含更多关键词，利于搜索排名',
        length: this.titleLimits[this.platform]
      },
      {
        type: '转化优先',
        title: this.generateConversionTitle(originalTitle),
        description: '突出卖点和优惠，提升点击率',
        length: this.titleLimits[this.platform]
      },
      {
        type: '平衡型',
        title: this.generateBalancedTitle(originalTitle),
        description: 'SEO 和转化的平衡',
        length: this.titleLimits[this.platform]
      }
    ];
    
    // 关键词建议
    const keywords = this.suggestKeywords(originalTitle);
    
    return {
      type: 'rich_text',
      content: this.formatTitleOptimization(originalTitle, versions, keywords)
    };
  }
  
  // 生成商品描述
  async generateDescription(input) {
    console.log(`   🔍 任务：生成描述`);
    
    const productInfo = this.extractProductInfo(input);
    
    const descriptions = {
      short: this.generateShortDescription(productInfo), // 简短版（适合移动端）
      standard: this.generateStandardDescription(productInfo), // 标准版
      detailed: this.generateDetailedDescription(productInfo), // 详细版
      bulletPoints: this.generateBulletPoints(productInfo) // 卖点列表
    };
    
    return {
      type: 'rich_text',
      content: this.formatDescription(descriptions, productInfo)
    };
  }
  
  // 关键词研究
  async researchKeywords(input) {
    console.log(`   🔍 任务：关键词研究`);
    
    const seedKeyword = this.extractKeyword(input);
    
    const keywords = {
      primary: [
        { keyword: seedKeyword, volume: '高', competition: '中', cpc: '$1.2' },
        { keyword: `best ${seedKeyword}`, volume: '高', competition: '高', cpc: '$2.1' },
        { keyword: `${seedkeyword} for beginners`, volume: '中', competition: '低', cpc: '$0.8' }
      ],
      longtail: [
        { keyword: `${seedKeyword} under $50`, volume: '中', competition: '低', cpc: '$0.6' },
        { keyword: `wireless ${seedKeyword} with case`, volume: '低', competition: '低', cpc: '$0.5' }
      ],
      related: [
        `top ${seedKeyword} 2026`,
        `${seedKeyword} review`,
        `how to choose ${seedKeyword}`
      ]
    };
    
    return {
      type: 'rich_text',
      content: this.formatKeywords(keywords)
    };
  }
  
  // 生成社媒文案
  async generateSocialCopy(input) {
    console.log(`   🔍 任务：生成社媒文案`);
    
    const platforms = {
      instagram: this.generateInstagramCopy(input),
      facebook: this.generateFacebookCopy(input),
      twitter: this.generateTwitterCopy(input),
      xiaohongshu: this.generateXiaohongshuCopy(input) // 小红书
    };
    
    return {
      type: 'rich_text',
      content: this.formatSocialCopy(platforms)
    };
  }
  
  // ===== 辅助方法 =====
  
  extractTitle(input) {
    // 简单实现：提取引号内或"标题："后的内容
    const match = input.match(/[""](.+)[""]/) || input.match(/标题 [：:](.+)/);
    return match ? match[1].trim() : input;
  }
  
  extractProductInfo(input) {
    return {
      name: '产品',
      features: ['功能 1', '功能 2', '功能 3'],
      benefits: ['好处 1', '好处 2'],
      targetAudience: '目标用户'
    };
  }
  
  extractKeyword(input) {
    const match = input.match(/关键词 [：:](.+)/) || input.match(/[""](.+)[""]/);
    return match ? match[1].trim() : 'product';
  }
  
  generateSEOTitle(original) {
    return `${original} - Premium Quality, Fast Shipping, 30-Day Returns | Shop Now`;
  }
  
  generateConversionTitle(original) {
    return `🔥 Hot Sale! ${original} - Limited Time Offer, Free Shipping Today!`;
  }
  
  generateBalancedTitle(original) {
    return `${original} - High Quality, Great Value, Customer Favorite`;
  }
  
  suggestKeywords(title) {
    return ['premium', 'quality', 'fast shipping', 'best seller', '2026 new'];
  }
  
  generateShortDescription(info) {
    return `高品质 ${info.name}，专为 ${info.targetAudience} 设计。立即购买享受优惠！`;
  }
  
  generateStandardDescription(info) {
    return `
🌟 产品亮点：
${info.features.map(f => `• ${f}`).join('\n')}

💡 为什么选择我们：
${info.benefits.map(b => `• ${b}`).join('\n')}

✅ 30 天无理由退货 | 🚚 免费配送 | 📞 24/7 客服支持
    `.trim();
  }
  
  generateDetailedDescription(info) {
    return this.generateStandardDescription(info) + '\n\n📦 包装清单:\n• 主机 x1\n• 配件 x1\n• 说明书 x1';
  }
  
  generateBulletPoints(info) {
    return info.features.map(f => `• ${f}`);
  }
  
  generateInstagramCopy(input) {
    return `✨ New Arrival! ${input}\n\n👉 Shop now (link in bio)\n\n#shopping #deals #newarrival`;
  }
  
  generateFacebookCopy(input) {
    return `🔥 Limited Time Offer! ${input}\n\n✅ Free Shipping\n✅ 30-Day Returns\n\nShop now: [链接]`;
  }
  
  generateTwitterCopy(input) {
    return `🚀 ${input} - Now on sale! Free shipping today only. Shop: [链接] #deals #shopping`;
  }
  
  generateXiaohongshuCopy(input) {
    return `
🌟 宝藏好物分享 | ${input}

💖 使用感受：
真的太好用了！强烈推荐给姐妹们～

✨ 亮点：
• 颜值超高
• 性价比无敌
• 物流超快

🛒 购买方式：评论区见～

#好物推荐 #购物分享 #种草
    `.trim();
  }
  
  // ===== 格式化输出 =====
  
  formatTitleOptimization(original, versions, keywords) {
    let text = `🎯 标题优化建议\n\n`;
    text += `📝 原标题：${original}\n\n`;
    text += `─────────────────\n\n`;
    
    versions.forEach((v, i) => {
      text += `${i + 1}. **${v.type}** (${v.title.length}字符)\n`;
      text += `${v.title}\n\n`;
      text += `   💡 ${v.description}\n\n`;
    });
    
    text += `─────────────────\n\n`;
    text += `🔑 推荐关键词：${keywords.join(', ')}\n\n`;
    text += `💡 建议：可以用 A/B 测试看看哪个版本转化率更高~`;
    
    return { type: 'markdown', content: text };
  }
  
  formatDescription(descriptions, info) {
    let text = `📝 商品描述生成完成\n\n`;
    text += `─────────────────\n\n`;
    text += `**1️⃣ 简短版**（适合移动端/社交媒体）\n\n`;
    text += `${descriptions.short}\n\n`;
    text += `─────────────────\n\n`;
    text += `**2️⃣ 标准版**（适合商品详情页）\n\n`;
    text += `${descriptions.standard}\n\n`;
    text += `─────────────────\n\n`;
    text += `**3️⃣ 详细版**（适合亚马逊/独立站）\n\n`;
    text += `${descriptions.detailed}\n\n`;
    text += `─────────────────\n\n`;
    text += `**📌 卖点列表**（适合 bullet points）\n\n`;
    text += descriptions.bulletPoints.join('\n');
    
    return { type: 'markdown', content: text };
  }
  
  formatKeywords(keywords) {
    let text = `🔑 关键词研究报告\n\n`;
    text += `─────────────────\n\n`;
    text += `**🎯 核心关键词**\n\n`;
    text += `| 关键词 | 搜索量 | 竞争度 | CPC |\n`;
    text += `|--------|--------|--------|-----|\n`;
    keywords.primary.forEach(k => {
      text += `| ${k.keyword} | ${k.volume} | ${k.competition} | ${k.cpc} |\n`;
    });
    
    text += `\n**📝 长尾关键词**\n\n`;
    keywords.longtail.forEach(k => {
      text += `• ${k.keyword} (搜索量：${k.volume}, 竞争：${k.competition})\n`;
    });
    
    text += `\n**💡 相关内容建议**\n\n`;
    keywords.related.forEach(k => {
      text += `• ${k}\n`;
    });
    
    return { type: 'markdown', content: text };
  }
  
  formatSocialCopy(platforms) {
    let text = `📱 多平台社媒文案\n\n`;
    text += `─────────────────\n\n`;
    
    Object.entries(platforms).forEach(([platform, copy]) => {
      const emojis = {
        instagram: '📸',
        facebook: '📘',
        twitter: '🐦',
        xiaohongshu: '📕'
      };
      text += `${emojis[platform]} **${this.getPlatformName(platform)}**\n\n`;
      text += `\`\`\`\n${copy}\n\`\`\`\n\n`;
      text += `─────────────────\n\n`;
    });
    
    return { type: 'markdown', content: text };
  }
  
  getPlatformName(platform) {
    const names = {
      instagram: 'Instagram',
      facebook: 'Facebook',
      twitter: 'Twitter/X',
      xiaohongshu: '小红书'
    };
    return names[platform] || platform;
  }
  
  getHelp() {
    return {
      type: 'text',
      content: `✍️ 运营 Agent - 功能列表

📋 我可以帮你：
• 优化商品标题 - "优化这个标题：..."
• 生成商品描述 - "写一个商品描述，产品是..."
• 关键词研究 - "关键词：无线耳机"
• 社媒文案 - "帮我写小红书文案"

💡 使用技巧：
• 提供越详细的产品信息，生成效果越好
• 可以指定平台（亚马逊/Shopify/独立站）
• 支持多语言输出

试试说："优化这个标题：Wireless Bluetooth Headphones"`
    };
  }
}

module.exports = ListingOptimizerAgent;
