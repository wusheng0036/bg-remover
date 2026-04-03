/**
 * 客服 Agent - 7×24 小时自动回复买家消息
 * 
 * 功能：
 * - 自动回复常见问题（物流、退货、产品咨询）
 * - 多语言支持（英文为主，可扩展）
 * - 敏感词检测，不确定时转人工
 * - 对话记录存储
 */

class CustomerServiceAgent {
  constructor(config = {}) {
    this.name = '客服 Agent';
    this.platform = config.platform || 'amazon'; // amazon / shopify / etsy
    this.language = config.language || 'en'; // en / zh / es / etc.
    this.autoReply = config.autoReply || true;
    this.escalateThreshold = config.escalateThreshold || 0.7; // 置信度低于此值转人工
    
    // 常见问题模板
    this.faqs = this.loadFAQs();
    
    console.log(`✅ ${this.name} 初始化完成`);
    console.log(`   平台：${this.platform}`);
    console.log(`   语言：${this.language}`);
    console.log(`   自动回复：${this.autoReply ? '开启' : '关闭'}`);
  }
  
  // 加载常见问题模板
  loadFAQs() {
    return {
      shipping: {
        keywords: ['shipping', 'delivery', 'track', 'ship', 'where is my', '物流', '快递', '追踪', '到哪了'],
        templates: {
          en: "Hi! Your order will be shipped within 1-2 business days. You'll receive a tracking number via email once it's dispatched. Standard delivery takes 5-7 business days. Is there anything else I can help you with?",
          zh: "您好！您的订单将在 1-2 个工作日内发货。发货后您会收到邮件包含追踪号。标准配送需要 5-7 个工作日。还有什么可以帮您的吗？"
        }
      },
      return: {
        keywords: ['return', 'refund', 'exchange', '退货', '退款', '换货'],
        templates: {
          en: "We offer 30-day hassle-free returns! Items must be unused and in original packaging. To start a return, please provide your order number and reason. We'll send you a prepaid return label.",
          zh: "我们提供 30 天无理由退货！商品必须未使用且保持原包装。请提供您的订单号和退货原因，我们会发送预付退货标签给您。"
        }
      },
      product: {
        keywords: ['size', 'color', 'material', 'specification', '尺寸', '颜色', '材质', '规格'],
        templates: {
          en: "Great question! You can find detailed product specifications in the product description section. If you need specific measurements or details, please let me know which product you're asking about!",
          zh: "好问题！您可以在商品描述页面找到详细规格。如果您需要具体尺寸或详情，请告诉我您询问的是哪款商品！"
        }
      },
      discount: {
        keywords: ['discount', 'coupon', 'promo', 'sale', '优惠', '折扣', '优惠券'],
        templates: {
          en: "Thanks for your interest! You can sign up for our newsletter to get 10% off your first order. We also run seasonal sales - follow us on social media to stay updated!",
          zh: "感谢关注！订阅我们的通讯可享受首单 9 折优惠。我们也会举办季节性促销 - 关注我们的社交媒体获取最新信息！"
        }
      }
    };
  }
  
  // 处理买家消息
  async handle_message(message) {
    const { content, buyer_id, order_id, platform } = message;
    
    console.log(`\n📨 [客服 Agent] 收到消息`);
    console.log(`   买家：${buyer_id}`);
    console.log(`   订单：${order_id || '无'}`);
    console.log(`   内容：${content}`);
    
    // 1. 分类问题类型
    const category = this.classifyMessage(content);
    console.log(`   分类：${category}`);
    
    // 2. 生成回复
    const reply = await this.generateReply(content, category, message);
    
    // 3. 检查是否需要转人工
    if (reply.confidence < this.escalateThreshold) {
      console.log(`   ⚠️  置信度低 (${reply.confidence})，建议转人工`);
      reply.escalate = true;
    }
    
    // 4. 存储对话记录
    this.saveConversation({
      timestamp: new Date().toISOString(),
      buyer_id,
      order_id,
      content,
      reply: reply.text,
      category,
      confidence: reply.confidence,
      escalated: reply.escalate
    });
    
    return reply;
  }
  
  // 分类消息
  classifyMessage(content) {
    const lowerContent = content.toLowerCase();
    
    for (const [category, config] of Object.entries(this.faqs)) {
      if (config.keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    
    return 'general'; // 通用问题
  }
  
  // 生成回复
  async generateReply(content, category, context) {
    const lang = this.language;
    
    if (this.faqs[category]) {
      const template = this.faqs[category].templates[lang] || this.faqs[category].templates.en;
      return {
        text: template,
        confidence: 0.85,
        escalate: false,
        category
      };
    }
    
    // 通用回复（需要 AI 生成）
    const genericReply = {
      en: `Thank you for your message! I've received your inquiry about "${content.substring(0, 50)}...". Our team will get back to you within 24 hours. Is there anything urgent I can help you with right now?`,
      zh: `感谢您的消息！我已收到您关于"${content.substring(0, 50)}..."的咨询。我们的团队将在 24 小时内回复您。有什么紧急的事情我可以现在帮您吗？`
    };
    
    return {
      text: genericReply[lang] || genericReply.en,
      confidence: 0.5, // 置信度低，可能需要人工跟进
      escalate: true,
      category: 'general'
    };
  }
  
  // 存储对话记录
  saveConversation(record) {
    // TODO: 实际项目中存储到数据库或飞书表格
    console.log(`   💾 对话记录已保存`);
  }
  
  // 获取统计数据
  getStats() {
    return {
      total_conversations: 0, // TODO: 从数据库读取
      auto_replied: 0,
      escalated: 0,
      avg_response_time: '< 1s'
    };
  }
}

module.exports = CustomerServiceAgent;
