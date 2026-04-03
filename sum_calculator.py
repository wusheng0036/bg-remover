#!/usr/bin/env python3
"""
累加和计算器
输入一个数字 n，输出 1～n 的累加和
"""

def sum_1_to_n(n):
    """计算 1 到 n 的累加和"""
    # 使用高斯公式: n * (n + 1) / 2
    # 时间复杂度 O(1)，比循环更高效
    return n * (n + 1) // 2


def sum_1_to_n_loop(n):
    """使用循环计算 1 到 n 的累加和（备用方法）"""
    total = 0
    for i in range(1, n + 1):
        total += i
    return total


def main():
    # 获取用户输入
    try:
        n = int(input("请输入一个正整数 n: "))
        
        if n < 1:
            print("❌ 请输入大于等于 1 的整数")
            return
        
        # 计算累加和
        result = sum_1_to_n(n)
        
        # 显示结果
        print(f"\n✅ 1 到 {n} 的累加和为: {result}")
        
        # 显示计算过程（当 n 较小时）
        if n <= 20:
            formula = " + ".join(str(i) for i in range(1, n + 1))
            print(f"📝 计算过程: {formula} = {result}")
        
    except ValueError:
        print("❌ 请输入有效的整数")
    except KeyboardInterrupt:
        print("\n\n已取消")


if __name__ == "__main__":
    main()
