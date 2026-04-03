/**
 * 跨境电商 AI 运营助手 - 主入口
 * 
 * 基于 OpenClaw + 飞书，为跨境电商卖家提供 AI 自动化服务
 */

const path = require('path');
const fs = require('fs');

// 加载环境变量
const envPath = path.join(__dirname, '../config/.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

console.log('🚀 跨境电商 AI 运营助手 启动中...');
console.log('📅 启动时间:', new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
console.log('🔧 Node 版本:', process.version);

// 检查必要的环境变量
const requiredEnv = ['OPENCLAW_GATEWAY_URL', 'FEISHU_APP_ID', 'FEISHU_APP_SECRET'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.warn('⚠️  警告：以下环境变量未配置:', missingEnv.join(', '));
  console.warn('   请编辑 config/.env 文件完成配置');
}

// 模拟 OpenClaw 消息处理
function handleMessage(message) {
  const { content, sender, timestamp } = message;
  
  console.log(`\n📨 收到消息 [${sender}] @ ${timestamp}`);
  console.log(`   内容：${content}`);
  
  // 简单的关键词路由
  if (content.includes('客服') || content.includes('回复')) {
    return handleCustomerService(message);
  } else if (content.includes('listing') || content.includes('商品')) {
    return handleListingOptimize(message);
  } else if (content.includes('竞品') || content.includes('监控')) {
    return handleCompetitorMonitor(message);
  } else {
    return {
      type: 'text',
      content: `🤖 收到你的指令："${content}"\n\n目前支持的功能：\n• 客服自动化 - 自动回复买家消息\n• Listing 优化 - 生成商品标题/描述\n• 竞品监控 - 追踪对手动态\n\n试试说："帮我优化这个商品描述..." 或 "设置客服自动回复"`
    };
  }
}

// 客服 Agent
function handleCustomerService(message) {
  return {
    type: 'text',
    content: '🤖 客服 Agent 已就绪！\n\n请提供：\n1. 店铺平台（亚马逊/Shopify/Etsy）\n2. 商品类目\n3. 常见问题列表\n\n我会自动生成回复模板~'
  };
}

// Listing 优化 Agent
function handleListingOptimize(message) {
  return {
    type: 'text',
    content: '✍️ Listing 优化 Agent 已就绪！\n\n请提供：\n1. 商品名称\n2. 核心卖点\n3. 目标关键词\n\n我会帮你生成高转化标题和描述~'
  };
}

// 竞品监控 Agent
function handleCompetitorMonitor(message) {
  return {
    type: 'text',
    content: '🕵️ 竞品监控 Agent 已就绪！\n\n请提供：\n1. 竞品店铺/商品链接\n2. 监控频率（每天/每周）\n3. 关注指标（价格/销量/评论）\n\n我会持续追踪并预警~'
  };
}

// 导出给 OpenClaw 使用
module.exports = {
  handleMessage,
  handleCustomerService,
  handleListingOptimize,
  handleCompetitorMonitor
};

// 如果是直接运行，启动一个简单的测试
if (require.main === module) {
  console.log('\n✅ 服务已启动！');
  console.log('📝 测试模式 - 输入消息测试回复 (输入 "quit" 退出)\n');
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  function prompt() {
    readline.question('📥 输入消息：', (input) => {
      if (input.toLowerCase() === 'quit') {
        console.log('👋 再见！');
        readline.close();
        process.exit(0);
      }
      
      const response = handleMessage({
        content: input,
        sender: 'test-user',
        timestamp: new Date().toISOString()
      });
      
      console.log('\n📤 回复:', response.content);
      console.log('─'.repeat(50));
      prompt();
    });
  }
  
  prompt();
}
