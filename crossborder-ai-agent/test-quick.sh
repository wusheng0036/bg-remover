#!/bin/bash
# 快速测试脚本

echo "🧪 跨境电商 AI 助手 - 快速测试"
echo "============================================================"
echo ""

# 测试 1：客服
echo "📋 测试 1：客服 Agent"
echo "============================================================"
node -e "
const Dispatcher = require('./src/dispatcher.js');
const d = new Dispatcher();
d.dispatch({ content: '买家问 where is my order 怎么回复？', sender: 'test' })
  .then(r => console.log('✅ 客服测试通过\n'));
"

sleep 1

# 测试 2：运营
echo "📋 测试 2：运营 Agent"
echo "============================================================"
node -e "
const Dispatcher = require('./src/dispatcher.js');
const d = new Dispatcher();
d.dispatch({ content: '优化这个标题：Wireless Headphones', sender: 'test' })
  .then(r => console.log('✅ 运营测试通过\n'));
"

sleep 1

# 测试 3：监控
echo "📋 测试 3：监控 Agent"
echo "============================================================"
node -e "
const Dispatcher = require('./src/dispatcher.js');
const d = new Dispatcher();
d.dispatch({ content: '监控这个竞品：amazon.com/dp/B08XXX', sender: 'test' })
  .then(r => console.log('✅ 监控测试通过\n'));
"

sleep 1

# 测试 4：数据
echo "📋 测试 4：数据 Agent"
echo "============================================================"
node -e "
const Dispatcher = require('./src/dispatcher.js');
const d = new Dispatcher();
d.dispatch({ content: '生成销售周报', sender: 'test' })
  .then(r => console.log('✅ 数据测试通过\n'));
"

echo "============================================================"
echo "✅ 所有测试完成！"
