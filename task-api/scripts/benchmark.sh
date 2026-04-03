#!/bin/bash
#===============================================================================
# Task API 压力测试脚本
# 测试并发性能、极限负载
#===============================================================================

set -e

API_URL="${API_URL:-http://localhost:8000}"
CONCURRENT="${CONCURRENT:-50}"
REQUESTS="${REQUESTS:-1000}"

# 颜色
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Task API 压力测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "目标: $API_URL"
echo "并发: $CONCURRENT"
echo "请求数: $REQUESTS"
echo ""

# 检查依赖
if ! command -v ab &> /dev/null && ! command -v hey &> /dev/null; then
    echo -e "${YELLOW}安装测试工具...${NC}"
    if command -v apt-get &> /dev/null; then
        apt-get update -qq && apt-get install -y -qq apache2-utils 2>/dev/null || true
    fi
fi

# 创建测试数据
echo -e "${BLUE}创建测试任务...${NC}"
for i in {1..10}; do
    curl -s -X POST "${API_URL}/tasks/" \
        -H "Content-Type: application/json" \
        -d "{\"title\": \"压力测试任务 $i\", \"priority\": \"high\"}" > /dev/null
done
echo -e "${GREEN}✓ 测试数据创建完成${NC}"
echo ""

# 测试 1: 简单压力测试
echo -e "${BLUE}测试 1: GET /tasks 压力测试${NC}"
if command -v ab &> /dev/null; then
    ab -n $REQUESTS -c $CONCURRENT -k "${API_URL}/tasks/" 2>&1 | tail -20
elif command -v hey &> /dev/null; then
    hey -n $REQUESTS -c $CONCURRENT "${API_URL}/tasks/"
else
    echo -e "${YELLOW}使用 curl 进行简单测试...${NC}"
    time for i in $(seq 1 100); do
        curl -s "${API_URL}/tasks/" > /dev/null
    done
fi

echo ""
echo -e "${BLUE}测试 2: POST 创建任务压力测试${NC}"
time for i in $(seq 1 50); do
    curl -s -X POST "${API_URL}/tasks/" \
        -H "Content-Type: application/json" \
        -d "{\"title\": \"并发测试 $i\"}" > /dev/null &
    if [[ $((i % 10)) -eq 0 ]]; then
        wait
    fi
done
wait
echo -e "${GREEN}✓ POST 测试完成${NC}"

echo ""
echo -e "${BLUE}测试 3: 大数据量测试${NC}"
# 创建大量任务
for i in $(seq 1 100); do
    curl -s -X POST "${API_URL}/tasks/" \
        -H "Content-Type: application/json" \
        -d "{\"title\": \"大数据量测试任务 $i\", \"description\": \"$(head -c 1000 /dev/urandom | base64)\"}" > /dev/null
done
echo -e "${GREEN}✓ 创建 100 个大任务完成${NC}"

# 测试大数据列表查询
echo "测试大数据列表查询..."
time curl -s "${API_URL}/tasks/?limit=100" | wc -c
echo -e "${GREEN}✓ 大数据查询完成${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  压力测试完成${NC}"
echo -e "${GREEN}========================================${NC}"
