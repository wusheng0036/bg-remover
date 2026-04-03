#!/usr/bin/env python3
"""
JSON 数据拉取、筛选、排序、导出工具
示例：拉取 GitHub 公开用户数据
"""

import json
import csv
import urllib.request
from datetime import datetime
from typing import List, Dict, Any


def fetch_json_data(url: str) -> List[Dict[str, Any]]:
    """从 URL 拉取 JSON 数据"""
    print(f"📡 正在拉取数据: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; DataFetcher/1.0)'
    }
    
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode('utf-8'))
            print(f"✅ 成功获取 {len(data) if isinstance(data, list) else 1} 条数据")
            return data if isinstance(data, list) else [data]
    except Exception as e:
        print(f"❌ 获取数据失败: {e}")
        return []


def filter_data(data: List[Dict], min_followers: int = 0, active_only: bool = False) -> List[Dict]:
    """
    筛选数据
    - min_followers: 最少关注者数量
    - active_only: 只保留有公开仓库的用户
    """
    filtered = []
    
    for item in data:
        # 检查关注者数量
        followers = item.get('followers', 0)
        if followers < min_followers:
            continue
            
        # 检查是否有公开仓库
        if active_only and item.get('public_repos', 0) == 0:
            continue
            
        filtered.append(item)
    
    print(f"🔍 筛选后剩余 {len(filtered)} 条数据 (过滤条件: followers>={min_followers}, active_only={active_only})")
    return filtered


def sort_data(data: List[Dict], sort_by: str = 'followers', reverse: bool = True) -> List[Dict]:
    """
    排序数据
    - sort_by: 排序字段
    - reverse: True=降序, False=升序
    """
    sorted_data = sorted(
        data,
        key=lambda x: x.get(sort_by, 0) or 0,
        reverse=reverse
    )
    print(f"📊 已按 '{sort_by}' {'降序' if reverse else '升序'}排列")
    return sorted_data


def export_to_csv(data: List[Dict], filename: str, fields: List[str] = None):
    """导出数据到 CSV 文件"""
    if not data:
        print("⚠️ 没有数据可导出")
        return
    
    # 如果没有指定字段，使用所有字段
    if fields is None:
        fields = list(data[0].keys())
    
    # 过滤出存在的字段
    available_fields = [f for f in fields if f in data[0]]
    
    # 只保留指定字段的数据
    filtered_data = []
    for item in data:
        filtered_item = {k: v for k, v in item.items() if k in available_fields}
        filtered_data.append(filtered_item)
    
    with open(filename, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=available_fields)
        writer.writeheader()
        writer.writerows(filtered_data)
    
    print(f"💾 数据已导出到: {filename} ({len(data)} 行, {len(available_fields)} 列)")


def display_preview(data: List[Dict], limit: int = 5):
    """显示数据预览"""
    if not data:
        print("⚠️ 没有数据可显示")
        return
    
    print(f"\n📋 数据预览 (前 {min(limit, len(data))} 条):")
    print("-" * 80)
    
    for i, item in enumerate(data[:limit], 1):
        print(f"\n[{i}] {item.get('login', 'N/A')}")
        print(f"    关注者: {item.get('followers', 0)}")
        print(f"    仓库数: {item.get('public_repos', 0)}")
        print(f"    类型: {item.get('type', 'N/A')}")


def main():
    """主程序"""
    print("=" * 60)
    print("🚀 JSON 数据处理工具")
    print("=" * 60)
    
    # 示例 1: 拉取 GitHub 用户数据
    # 使用 GitHub API 获取用户列表（公开接口，无需认证）
    url = "https://api.github.com/users"
    
    # 拉取数据
    raw_data = fetch_json_data(url)
    
    if not raw_data:
        print("❌ 未能获取数据，程序退出")
        return
    
    # 显示原始数据信息
    print(f"\n📦 原始数据字段: {', '.join(raw_data[0].keys())}")
    
    # 筛选数据：只保留有关注者的用户
    filtered_data = filter_data(raw_data, min_followers=0, active_only=False)
    
    # 排序数据：按关注者数量降序
    sorted_data = sort_data(filtered_data, sort_by='followers', reverse=True)
    
    # 显示预览
    display_preview(sorted_data, limit=5)
    
    # 导出到 CSV
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"github_users_{timestamp}.csv"
    
    # 选择要导出的字段
    export_fields = ['login', 'id', 'followers', 'public_repos', 'type', 'html_url']
    export_to_csv(sorted_data, filename, fields=export_fields)
    
    print("\n" + "=" * 60)
    print("✨ 处理完成!")
    print("=" * 60)


if __name__ == "__main__":
    main()
