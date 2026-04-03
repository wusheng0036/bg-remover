#!/bin/bash
#===============================================================================
# Task API 快速启动脚本
# 无需安装，直接运行，适合开发和测试
#===============================================================================

set -e

# 颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 配置
PORT="${PORT:-8000}"
WORKERS="${WORKERS:-1}"
HOST="${HOST:-0.0.0.0}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="${SCRIPT_DIR}/venv"
PID_FILE="${SCRIPT_DIR}/app.pid"
LOG_DIR="${SCRIPT_DIR}/logs"

# 日志函数
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 Python
check_python() {
    if ! command -v python3 &> /dev/null; then
        error "Python3 未安装"
        exit 1
    fi
    
    local version=$(python3 --version 2>&1 | awk '{print $2}')
    info "Python 版本: $version"
}

# 创建虚拟环境
setup_venv() {
    if [[ ! -d "$VENV_DIR" ]]; then
        info "创建虚拟环境..."
        python3 -m venv "$VENV_DIR"
    fi
    
    # 激活虚拟环境
    source "${VENV_DIR}/bin/activate"
    
    # 安装依赖
    if [[ ! -f "${VENV_DIR}/.installed" ]] || [[ "requirements.txt" -nt "${VENV_DIR}/.installed" ]]; then
        info "安装依赖..."
        pip install -q --upgrade pip
        pip install -q -r requirements.txt
        touch "${VENV_DIR}/.installed"
        success "依赖安装完成"
    fi
}

# 检查端口
check_port() {
    if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1; then
        error "端口 ${PORT} 已被占用"
        lsof -Pi :${PORT} -sTCP:LISTEN
        exit 1
    fi
}

# 启动服务
start() {
    info "启动 Task API 服务..."
    info "端口: ${PORT}, 工作进程: ${WORKERS}"
    
    check_python
    check_port
    setup_venv
    
    # 创建日志目录
    mkdir -p "$LOG_DIR"
    
    # 设置环境变量
    export PYTHONPATH="${SCRIPT_DIR}"
    export DATABASE_URL="sqlite:///${SCRIPT_DIR}/data/tasks.db"
    
    # 创建数据目录
    mkdir -p "${SCRIPT_DIR}/data"
    
    success "服务启动成功！"
    info "访问地址: http://${HOST}:${PORT}"
    info "API 文档: http://${HOST}:${PORT}/docs"
    info "按 Ctrl+C 停止服务"
    echo ""
    
    # 启动服务（前台运行）
    uvicorn src.main:app \
        --host "$HOST" \
        --port "$PORT" \
        --workers "$WORKERS" \
        --reload \
        --log-level info
}

# 后台启动
daemon() {
    info "后台启动 Task API 服务..."
    
    check_python
    check_port
    setup_venv
    
    mkdir -p "$LOG_DIR"
    export PYTHONPATH="${SCRIPT_DIR}"
    export DATABASE_URL="sqlite:///${SCRIPT_DIR}/data/tasks.db"
    mkdir -p "${SCRIPT_DIR}/data"
    
    # 后台启动
    nohup uvicorn src.main:app \
        --host "$HOST" \
        --port "$PORT" \
        --workers "$WORKERS" \
        --log-level info \
        > "${LOG_DIR}/app.log" 2>&1 &
    
    local pid=$!
    echo $pid > "$PID_FILE"
    
    sleep 2
    
    if ps -p $pid > /dev/null; then
        success "服务已后台启动 (PID: $pid)"
        info "访问地址: http://${HOST}:${PORT}"
        info "查看日志: tail -f ${LOG_DIR}/app.log"
        info "停止服务: ./quickstart.sh stop"
    else
        error "启动失败"
        exit 1
    fi
}

# 停止服务
stop() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            info "停止服务 (PID: $pid)..."
            kill $pid 2>/dev/null || true
            sleep 1
            success "服务已停止"
        else
            warn "服务未运行"
        fi
        rm -f "$PID_FILE"
    else
        warn "未找到 PID 文件"
    fi
}

# 查看状态
status() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p $pid > /dev/null 2>&1; then
            success "服务运行中 (PID: $pid)"
            info "访问地址: http://${HOST}:${PORT}"
            ps -f -p $pid --no-headers 2>/dev/null
        else
            warn "服务未运行"
        fi
    else
        info "服务未启动"
    fi
}

# 查看日志
logs() {
    local lines="${1:-50}"
    if [[ -f "${LOG_DIR}/app.log" ]]; then
        tail -n "$lines" "${LOG_DIR}/app.log"
    else
        warn "暂无日志文件"
    fi
}

# 实时监控日志
tail_logs() {
    if [[ -f "${LOG_DIR}/app.log" ]]; then
        info "正在监控日志 (按 Ctrl+C 退出)..."
        tail -f "${LOG_DIR}/app.log"
    else
        warn "暂无日志文件"
    fi
}

# 测试 API
test_api() {
    local base_url="http://${HOST}:${PORT}"
    
    info "测试 API..."
    
    # 测试根路径
    echo -e "\n1. 测试根路径:"
    curl -s "${base_url}/" | python3 -m json.tool 2>/dev/null || curl -s "${base_url}/"
    
    # 测试健康检查
    echo -e "\n2. 测试健康检查:"
    curl -s "${base_url}/health" | python3 -m json.tool 2>/dev/null || curl -s "${base_url}/health"
    
    # 测试创建任务
    echo -e "\n3. 创建任务:"
    curl -s -X POST "${base_url}/tasks/" \
        -H "Content-Type: application/json" \
        -d '{"title":"测试任务","description":"快速启动测试","priority":"high"}' \
        | python3 -m json.tool 2>/dev/null
    
    # 测试获取任务列表
    echo -e "\n4. 获取任务列表:"
    curl -s "${base_url}/tasks/" | python3 -m json.tool 2>/dev/null || curl -s "${base_url}/tasks/"
    
    echo ""
    success "测试完成"
}

# 帮助信息
help() {
    cat <<EOF
Task API 快速启动脚本

用法: $0 <命令> [选项]

命令:
    start       前台启动服务 (开发模式，带热重载)
    daemon      后台启动服务
    stop        停止服务
    status      查看服务状态
    logs [N]    查看最近 N 行日志
    tail        实时监控日志
    test        测试 API 接口
    help        显示帮助

环境变量:
    PORT        服务端口 (默认: 8000)
    WORKERS     工作进程数 (默认: 1)
    HOST        监听地址 (默认: 0.0.0.0)

示例:
    ./quickstart.sh start           # 前台启动
    PORT=8080 ./quickstart.sh start # 使用 8080 端口
    ./quickstart.sh daemon          # 后台启动
    ./quickstart.sh test            # 测试 API

EOF
}

# 主程序
case "${1:-start}" in
    start)
        start
        ;;
    daemon)
        daemon
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    logs)
        logs "${2:-50}"
        ;;
    tail)
        tail_logs
        ;;
    test)
        test_api
        ;;
    help|--help|-h)
        help
        ;;
    *)
        error "未知命令: $1"
        help
        exit 1
        ;;
esac
