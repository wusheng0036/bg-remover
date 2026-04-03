#!/bin/bash
#===============================================================================
# Task API 一键部署脚本
# 功能：安装、启动、停止、重启、状态查看、日志管理
# 作者：风火轮
# 版本：1.0.0
#===============================================================================

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="task-api"
APP_VERSION="1.0.0"
APP_DIR="/opt/${APP_NAME}"
APP_USER="${APP_NAME}"
APP_PORT="${APP_PORT:-8000}"
APP_WORKERS="${APP_WORKERS:-4}"
LOG_DIR="${APP_DIR}/logs"
PID_FILE="${APP_DIR}/${APP_NAME}.pid"
VENV_DIR="${APP_DIR}/venv"
PYTHON="${VENV_DIR}/bin/python"
PIP="${VENV_DIR}/bin/pip"
UVICORN="${VENV_DIR}/bin/uvicorn"

# 日志文件
LOG_FILE="${LOG_DIR}/app.log"
ERROR_LOG="${LOG_DIR}/error.log"
ACCESS_LOG="${LOG_DIR}/access.log"

#===============================================================================
# 工具函数
#===============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 未安装"
        return 1
    fi
    return 0
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :${port} -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_error "端口 ${port} 已被占用"
        lsof -Pi :${port} -sTCP:LISTEN
        return 1
    fi
    return 0
}

# 检查服务是否运行
is_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# 获取进程ID
get_pid() {
    if [[ -f "$PID_FILE" ]]; then
        cat "$PID_FILE"
    fi
}

#===============================================================================
# 安装函数
#===============================================================================

cmd_install() {
    log_info "开始安装 ${APP_NAME} v${APP_VERSION}..."
    
    # 检查系统要求
    log_info "检查系统要求..."
    check_command python3 || { log_error "需要 Python 3.8+"; exit 1; }
    check_command pip3 || { log_error "需要 pip3"; exit 1; }
    
    # 检查 Python 版本
    local py_version=$(python3 --version 2>&1 | awk '{print $2}')
    log_info "Python 版本: ${py_version}"
    
    # 创建应用目录
    log_info "创建应用目录..."
    sudo mkdir -p "$APP_DIR"
    sudo mkdir -p "$LOG_DIR"
    sudo mkdir -p "${APP_DIR}/data"
    
    # 创建用户（如果不存在）
    if ! id "$APP_USER" &>/dev/null; then
        log_info "创建用户 ${APP_USER}..."
        sudo useradd -r -s /bin/false "$APP_USER"
    fi
    
    # 设置权限
    sudo chown -R "${APP_USER}:${APP_USER}" "$APP_DIR"
    
    # 复制项目文件
    log_info "复制项目文件..."
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    sudo cp -r "${SCRIPT_DIR}/src" "$APP_DIR/"
    sudo cp -r "${SCRIPT_DIR}/config" "$APP_DIR/"
    sudo cp "${SCRIPT_DIR}/requirements.txt" "$APP_DIR/"
    sudo cp "${SCRIPT_DIR}/.env.example" "$APP_DIR/.env"
    
    # 创建虚拟环境
    log_info "创建 Python 虚拟环境..."
    sudo python3 -m venv "$VENV_DIR"
    
    # 安装依赖
    log_info "安装 Python 依赖..."
    sudo "$PIP" install --upgrade pip
    sudo "$PIP" install -r "${APP_DIR}/requirements.txt"
    sudo "$PIP" install gunicorn
    
    # 创建日志文件
    sudo touch "$LOG_FILE" "$ERROR_LOG" "$ACCESS_LOG"
    sudo chown -R "${APP_USER}:${APP_USER}" "$LOG_DIR"
    
    # 创建备份脚本
    log_info "创建备份脚本..."
    sudo cp "${SCRIPT_DIR}/scripts/backup.sh" "${APP_DIR}/backup.sh"
    sudo chmod +x "${APP_DIR}/backup.sh"
    
    # 创建定时任务（每天凌晨 3 点备份）
    sudo tee /etc/cron.d/${APP_NAME}-backup > /dev/null <<EOF
# Task API 自动备份
0 3 * * * ${APP_USER} ${APP_DIR}/backup.sh >> ${LOG_DIR}/backup.log 2>&1
EOF
    sudo chmod 644 /etc/cron.d/${APP_NAME}-backup
    
    # 创建 systemd 服务文件
    log_info "创建系统服务..."
    sudo tee /etc/systemd/system/${APP_NAME}.service > /dev/null <<EOF
[Unit]
Description=Task API Service
After=network.target

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=PATH=${VENV_DIR}/bin
Environment=PYTHONPATH=${APP_DIR}
Environment=APP_PORT=${APP_PORT}
Environment=DATABASE_URL=sqlite:///${APP_DIR}/data/tasks.db
ExecStart=${UVICORN} src.main:app --host 0.0.0.0 --port ${APP_PORT} --workers ${APP_WORKERS}
ExecReload=/bin/kill -HUP \$MAINPID
KillMode=mixed
TimeoutStopSec=5
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    
    # 创建环境变量文件
    sudo tee "${APP_DIR}/.env" > /dev/null <<EOF
# Task API 配置
APP_NAME=Task API
APP_VERSION=${APP_VERSION}
DEBUG=false
DATABASE_URL=sqlite:///${APP_DIR}/data/tasks.db
HOST=0.0.0.0
PORT=${APP_PORT}
EOF
    
    # 设置权限
    sudo chown -R "${APP_USER}:${APP_USER}" "$APP_DIR"
    sudo chmod 600 "${APP_DIR}/.env"
    
    log_success "安装完成！"
    log_info "安装目录: ${APP_DIR}"
    log_info "日志目录: ${LOG_DIR}"
    log_info "服务名称: ${APP_NAME}"
    log_info ""
    log_info "使用方法:"
    log_info "  sudo ./deploy.sh start    # 启动服务"
    log_info "  sudo ./deploy.sh status   # 查看状态"
    log_info "  sudo ./deploy.sh logs     # 查看日志"
}

#===============================================================================
# 启动函数
#===============================================================================

cmd_start() {
    log_info "启动 ${APP_NAME}..."
    
    if is_running; then
        log_warn "服务已经在运行 (PID: $(get_pid))"
        return 0
    fi
    
    # 检查端口
    if ! check_port "$APP_PORT"; then
        log_error "端口 ${APP_PORT} 被占用，无法启动"
        exit 1
    fi
    
    # 确保日志目录存在
    sudo mkdir -p "$LOG_DIR"
    sudo chown -R "${APP_USER}:${APP_USER}" "$LOG_DIR"
    
    # 启动服务
    log_info "启动服务 (端口: ${APP_PORT}, 工作进程: ${APP_WORKERS})..."
    
    sudo -u "$APP_USER" bash -c "
        cd ${APP_DIR}
        source ${VENV_DIR}/bin/activate
        export PYTHONPATH=${APP_DIR}
        export DATABASE_URL=sqlite:///${APP_DIR}/data/tasks.db
        
        nohup gunicorn src.main:app \
            -w ${APP_WORKERS} \
            -k uvicorn.workers.UvicornWorker \
            --bind 0.0.0.0:${APP_PORT} \
            --access-logfile ${ACCESS_LOG} \
            --error-logfile ${ERROR_LOG} \
            --capture-output \
            --enable-stdio-inheritance \
            --daemon \
            --pid ${PID_FILE}
    "
    
    # 等待服务启动
    sleep 2
    
    if is_running; then
        local pid=$(get_pid)
        log_success "服务启动成功！PID: ${pid}"
        log_info "访问地址: http://localhost:${APP_PORT}"
        log_info "API 文档: http://localhost:${APP_PORT}/docs"
    else
        log_error "服务启动失败，请检查日志"
        cmd_logs
        exit 1
    fi
}

#===============================================================================
# 停止函数
#===============================================================================

cmd_stop() {
    log_info "停止 ${APP_NAME}..."
    
    if ! is_running; then
        log_warn "服务未运行"
        return 0
    fi
    
    local pid=$(get_pid)
    log_info "正在停止进程 ${pid}..."
    
    # 优雅停止
    sudo kill -TERM "$pid" 2>/dev/null || true
    
    # 等待进程结束
    local count=0
    while is_running && [[ $count -lt 10 ]]; do
        sleep 1
        ((count++))
    done
    
    # 强制停止
    if is_running; then
        log_warn "进程未响应，强制停止..."
        sudo kill -KILL "$pid" 2>/dev/null || true
        sleep 1
    fi
    
    # 清理 PID 文件
    sudo rm -f "$PID_FILE"
    
    if ! is_running; then
        log_success "服务已停止"
    else
        log_error "停止失败"
        exit 1
    fi
}

#===============================================================================
# 重启函数
#===============================================================================

cmd_restart() {
    log_info "重启 ${APP_NAME}..."
    cmd_stop
    sleep 2
    cmd_start
}

#===============================================================================
# 状态函数
#===============================================================================

cmd_status() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  ${APP_NAME} 服务状态${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    if is_running; then
        local pid=$(get_pid)
        echo -e "状态: ${GREEN}运行中${NC}"
        echo "PID: ${pid}"
        echo "端口: ${APP_PORT}"
        echo "安装目录: ${APP_DIR}"
        echo "日志目录: ${LOG_DIR}"
        echo ""
        
        # 显示进程信息
        echo "进程信息:"
        ps -f -p "$pid" --no-headers 2>/dev/null | head -1
        echo ""
        
        # 显示资源使用
        echo "资源使用:"
        ps -o pid,ppid,%cpu,%mem,vsz,rss,etime -p "$pid" --no-headers 2>/dev/null
        echo ""
        
        # 测试服务
        echo "服务测试:"
        if curl -s "http://localhost:${APP_PORT}/health" > /dev/null 2>&1; then
            echo -e "  健康检查: ${GREEN}通过${NC}"
            curl -s "http://localhost:${APP_PORT}/health" | python3 -m json.tool 2>/dev/null || true
        else
            echo -e "  健康检查: ${RED}失败${NC}"
        fi
    else
        echo -e "状态: ${RED}未运行${NC}"
        echo "端口: ${APP_PORT}"
        echo "安装目录: ${APP_DIR}"
    fi
    
    echo ""
    echo -e "${BLUE}========================================${NC}"
}

#===============================================================================
# 日志函数
#===============================================================================

cmd_logs() {
    local lines="${1:-50}"
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  应用日志 (最近 ${lines} 行)${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    if [[ -f "$LOG_FILE" ]]; then
        echo -e "${YELLOW}--- 应用日志 ---${NC}"
        tail -n "$lines" "$LOG_FILE" 2>/dev/null || echo "暂无日志"
        echo ""
    fi
    
    if [[ -f "$ERROR_LOG" ]]; then
        echo -e "${RED}--- 错误日志 ---${NC}"
        tail -n "$lines" "$ERROR_LOG" 2>/dev/null || echo "暂无错误日志"
        echo ""
    fi
    
    if [[ -f "$ACCESS_LOG" ]]; then
        echo -e "${GREEN}--- 访问日志 ---${NC}"
        tail -n "$lines" "$ACCESS_LOG" 2>/dev/null || echo "暂无访问日志"
    fi
    
    echo ""
    echo -e "${BLUE}========================================${NC}"
}

# 实时日志
cmd_tail() {
    echo -e "${BLUE}正在监控日志 (按 Ctrl+C 退出)...${NC}"
    tail -f "$LOG_FILE" "$ERROR_LOG" "$ACCESS_LOG" 2>/dev/null
}

#===============================================================================
# 卸载函数
#===============================================================================

cmd_uninstall() {
    log_warn "即将卸载 ${APP_NAME}..."
    read -p "确认卸载? [y/N] " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "取消卸载"
        return 0
    fi
    
    # 停止服务
    cmd_stop 2>/dev/null || true
    
    # 禁用 systemd 服务
    sudo systemctl disable "${APP_NAME}.service" 2>/dev/null || true
    sudo rm -f "/etc/systemd/system/${APP_NAME}.service"
    sudo systemctl daemon-reload
    
    # 删除应用目录
    log_info "删除应用目录..."
    sudo rm -rf "$APP_DIR"
    
    # 删除用户（可选）
    if id "$APP_USER" &>/dev/null; then
        log_info "删除用户 ${APP_USER}..."
        sudo userdel "$APP_USER" 2>/dev/null || true
    fi
    
    log_success "卸载完成"
}

#===============================================================================
# 更新函数
#===============================================================================

cmd_update() {
    log_info "更新 ${APP_NAME}..."
    
    local was_running=false
    if is_running; then
        was_running=true
        cmd_stop
    fi
    
    # 备份数据
    if [[ -f "${APP_DIR}/data/tasks.db" ]]; then
        log_info "备份数据库..."
        sudo cp "${APP_DIR}/data/tasks.db" "${APP_DIR}/data/tasks.db.bak.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # 重新安装
    cmd_install
    
    # 如果之前在运行，重新启动
    if [[ "$was_running" == true ]]; then
        cmd_start
    fi
    
    log_success "更新完成"
}

#===============================================================================
# 帮助信息
#===============================================================================

show_help() {
    cat <<EOF
${APP_NAME} v${APP_VERSION} 部署脚本

用法: $0 <命令> [选项]

命令:
    install     一键安装服务
    start       启动服务
    stop        停止服务
    restart     重启服务
    status      查看服务状态
    logs [N]    查看最近 N 行日志 (默认 50)
    tail        实时监控日志
    update      更新服务
    uninstall   卸载服务
    help        显示帮助

环境变量:
    APP_PORT        服务端口 (默认: 8000)
    APP_WORKERS     工作进程数 (默认: 4)

示例:
    sudo $0 install          # 安装服务
    sudo APP_PORT=8080 $0 start    # 使用 8080 端口启动
    $0 logs 100              # 查看最近 100 行日志
    $0 tail                  # 实时监控日志

EOF
}

#===============================================================================
# 主程序
#===============================================================================

main() {
    local cmd="${1:-help}"
    
    case "$cmd" in
        install)
            cmd_install
            ;;
        start)
            cmd_start
            ;;
        stop)
            cmd_stop
            ;;
        restart)
            cmd_restart
            ;;
        status)
            cmd_status
            ;;
        logs)
            cmd_logs "${2:-50}"
            ;;
        tail)
            cmd_tail
            ;;
        update)
            cmd_update
            ;;
        uninstall)
            cmd_uninstall
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $cmd"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
