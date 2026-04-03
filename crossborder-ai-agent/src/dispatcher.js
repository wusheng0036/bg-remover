/**
 * 多机器人调度器 - 统一分配任务给 4 个 Agent
 * 
 * 使用方式：
 * 1. 建一个飞书群，拉入 4 个机器人
 * 2. 用户在群里发消息
 * 3. 调度器根据关键词分配给对应机器人处理
 * 4. 处理结果由原机器人回复到群里
 */

const CustomerServiceAgent = require('./agents/customer-service');
const ListingOptimizerAgent = require('./agents/listing-optimizer');
const CompetitorMonitorAgent = require('./agents/competitor-monitor');
const DataAnalystAgent = require('./agents/data-analyst');

class AgentDispatcher {
  constructor(config = {}) {
    this.name = '调度中心';
    this.agents = {};
    this.chatId = config.chatId || 'default';
    
    // 初始化 4 个 Agent
    this.initAgents();
    
    // 关键词路由规则
    this.routes = {
      customerService: ['客服', '回复', '买家', 'customer', 'reply', 'message', 'where is my', 'shipping', 'refund'],
      listingOptimizer: ['优化', 'listing', '标题', '描述', '文案', 'optimize', 'title', 'description', 'copywriting'],
      competitorMonitor: ['监控', '竞品', '对手', '价格', 'monitor', 'competitor', 'price', 'track'],
      dataAnalyst: ['报表', '数据', '分析', '销售', 'report', 'data', 'analytics', 'sales', 'revenue']
    };
    
    console.log(`✅ ${this.name} 初始化完成`);
    console.log(`   群聊 ID: ${this.chatId}`);
    console.log(`   已加载 Agent: ${Object.keys(this.agents).length} 个`);
  }
  
  // 初始化所有 Agent
  initAgents() {
    // 客服 Agent
    this.agents.customerService = new CustomerServiceAgent({
      platform: 'amazon',
      language: 'en'
    });
    
    // 运营 Agent
    this.agents.listingOptimizer = new ListingOptimizerAgent({
      platform: 'amazon',
      language: 'zh',
      aiModel: 'deepseek'
    });
    
    // 监控 Agent
    this.agents.competitorMonitor = new CompetitorMonitorAgent({
      platform: 'amazon',
      checkInterval: 3600000
    });
    
    // 数据 Agent
    this.agents.dataAnalyst = new DataAnalystAgent({
      platform: 'amazon',
      currency: 'USD',
      timezone: 'Asia/Shanghai'
    });
    
    console.log(`📦 已加载 Agent: ${Object.keys(this.agents).length}/4`);
  }
  
  // 判断消息应该分配给哪个 Agent
  classifyMessage(content) {
    const lowerContent = content.toLowerCase();
    let scores = {
      customerService: 0,
      listingOptimizer: 0,
      competitorMonitor: 0,
      dataAnalyst: 0
    };
    
    // 计算每个 Agent 的匹配分数
    for (const [agent, keywords] of Object.entries(this.routes)) {
      keywords.forEach(keyword => {
        if (lowerContent.includes(keyword.toLowerCase())) {
          scores[agent] += 1;
        }
      });
    }
    
    // 找出分数最高的 Agent
    let bestMatch = 'customerService'; // 默认客服
    let maxScore = 0;
    
    for (const [agent, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestMatch = agent;
      }
    }
    
    console.log(`🔍 消息分类结果: ${bestMatch} (分数：${maxScore})`);
    return bestMatch;
  }
  
  // 分配任务给对应 Agent
  async dispatch(message) {
    const { content, sender, timestamp, chatId } = message;
    
    console.log(`\n📨 [调度中心] 收到消息`);
    console.log(`   发送者：${sender}`);
    console.log(`   群聊：${chatId || this.chatId}`);
    console.log(`   内容：${content}`);
    
    // 1. 分类消息
    const targetAgent = this.classifyMessage(content);
    
    // 2. 分配给对应 Agent
    const agent = this.agents[targetAgent];
    if (!agent) {
      return {
        type: 'text',
        content: `⚠️  抱歉，${targetAgent} 功能还在开发中，敬请期待！`
      };
    }
    
    console.log(`   🎯 分配给：${agent.name || targetAgent}`);
    
    // 3. 执行任务
    try {
      const result = await agent.handle_message({
        content,
        sender,
        timestamp,
        chatId: chatId || this.chatId
      });
      
      console.log(`   ✅ 任务完成`);
      return result;
      
    } catch (error) {
      console.error(`   ❌ 任务失败:`, error.message);
      return {
        type: 'text',
        content: `⚠️  处理出错：${error.message}\n\n请稍后再试或联系管理员。`
      };
    }
  }
  
  // 获取所有 Agent 状态
  getStatus() {
    return {
      chatId: this.chatId,
      agents: Object.keys(this.agents).map(name => ({
        name,
        status: 'online',
        loaded: true
      })),
      routes: this.routes,
      timestamp: new Date().toISOString()
    };
  }
  
  // 帮助信息
  getHelp() {
    return `🤖 跨境电商 AI 助手 - 功能列表

📋 可用指令：
• 客服相关 - "买家问物流怎么回复？" / "设置自动回复"
• Listing 优化 - "帮我优化这个标题..." / "写商品描述"
• 竞品监控 - "监控这个竞品" / "价格有变化吗？"
• 数据分析 - "生成销售报表" / "分析这个品类"

💡 使用技巧：
• 直接在群里说需求就行，我会自动分配
• 说"状态"可以查看系统运行情况
• 说"帮助"再次查看此说明

📊 当前状态：${Object.keys(this.agents).length}/4 个 Agent 就绪
`;
  }
}

module.exports = AgentDispatcher;
