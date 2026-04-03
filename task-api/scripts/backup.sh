#!/bin/bash
#===============================================================================
# Task API 自动备份脚本
# 支持：定时备份、保留策略、压缩、远程同步
#===============================================================================

set -euo pipefail

# 配置
BACKUP_DIR="${BACKUP_DIR:-/opt/task-api/backups}"
DATA_DIR="${DATA_DIR:-/opt/task-api/data}"
DB_FILE="${DATA_DIR}/tasks.db"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
REMOTE_SYNC="${REMOTE_SYNC:-}"  # 可选：远程同步目标，如 user@host:/path
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="task-api_backup_${DATE}"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[BACKUP]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"; }
error() { echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"; }

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 检查数据库文件
if [[ ! -f "$DB_FILE" ]]; then
    error "数据库文件不存在: $DB_FILE"
    exit 1
fi

# 创建备份
log "开始备份数据库..."
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}.db"

# 使用 SQLite 的在线备份功能（不锁表）
sqlite3 "$DB_FILE" ".backup '${BACKUP_PATH}'"

if [[ ! -f "$BACKUP_PATH" ]]; then
    error "备份失败"
    exit 1
fi

log "数据库备份完成: $BACKUP_PATH"

# 压缩备份
log "压缩备份文件..."
gzip "$BACKUP_PATH"
BACKUP_PATH="${BACKUP_PATH}.gz"
log "压缩完成: $BACKUP_PATH"

# 计算文件大小
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
log "备份大小: $BACKUP_SIZE"

# 远程同步（如果配置了）
if [[ -n "$REMOTE_SYNC" ]]; then
    log "同步到远程服务器..."
    if rsync -avz --progress "$BACKUP_PATH" "$REMOTE_SYNC/"; then
        log "远程同步完成"
    else
        warn "远程同步失败"
    fi
fi

# 清理旧备份
log "清理 ${RETENTION_DAYS} 天前的备份..."
DELETED=$(find "$BACKUP_DIR" -name "task-api_backup_*.db.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
log "已清理 $DELETED 个旧备份"

# 显示备份统计
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "task-api_backup_*.db.gz" | wc -l)
BACKUP_TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "备份统计: ${BACKUP_COUNT} 个文件, 总大小: ${BACKUP_TOTAL_SIZE}"

log "备份流程完成!"

# 输出备份信息（用于其他脚本调用）
echo "{\"backup_path\": \"${BACKUP_PATH}\", \"size\": \"${BACKUP_SIZE}\", \"timestamp\": \"${DATE}\"}"
