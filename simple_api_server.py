#!/usr/bin/env python3
"""
极简 HTTP API 服务
支持传参、返回 JSON 结果
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
from datetime import datetime


class APIHandler(BaseHTTPRequestHandler):
    """API 请求处理器"""
    
    def log_message(self, format, *args):
        """自定义日志格式"""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")
    
    def send_json_response(self, data, status=200):
        """发送 JSON 响应"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False, indent=2).encode())
    
    def parse_query(self, path):
        """解析 URL 参数"""
        parsed = urllib.parse.urlparse(path)
        return urllib.parse.parse_qs(parsed.query)
    
    def do_GET(self):
        """处理 GET 请求"""
        path = self.path
        
        # 根路径 - API 文档
        if path == '/' or path == '/api':
            self.send_json_response({
                "message": "🚀 极简 HTTP API 服务",
                "version": "1.0",
                "endpoints": {
                    "/api/sum": "计算累加和 (参数: n)",
                    "/api/hello": "打招呼 (参数: name, 可选)",
                    "/api/time": "获取当前时间",
                    "/api/echo": "回显参数 (任意参数)",
                    "/api/calc": "简单计算 (参数: a, b, op)"
                },
                "usage": "GET /api/sum?n=100"
            })
            return
        
        # 累加和 API
        if path.startswith('/api/sum'):
            params = self.parse_query(path)
            try:
                n = int(params.get('n', ['0'])[0])
                if n < 1:
                    self.send_json_response({"error": "n 必须大于等于 1"}, 400)
                    return
                result = n * (n + 1) // 2
                self.send_json_response({
                    "n": n,
                    "sum": result,
                    "formula": f"1+2+...+{n} = {result}"
                })
            except ValueError:
                self.send_json_response({"error": "参数 n 必须是整数"}, 400)
            return
        
        # 打招呼 API
        if path.startswith('/api/hello'):
            params = self.parse_query(path)
            name = params.get('name', ['World'])[0]
            self.send_json_response({
                "message": f"Hello, {name}! 👋",
                "timestamp": datetime.now().isoformat()
            })
            return
        
        # 获取时间 API
        if path.startswith('/api/time'):
            now = datetime.now()
            self.send_json_response({
                "datetime": now.isoformat(),
                "date": now.strftime("%Y-%m-%d"),
                "time": now.strftime("%H:%M:%S"),
                "timestamp": int(now.timestamp())
            })
            return
        
        # 回显 API
        if path.startswith('/api/echo'):
            params = self.parse_query(path)
            # 将列表值转换为单值（如果有多个值，保留列表）
            result = {}
            for k, v in params.items():
                result[k] = v[0] if len(v) == 1 else v
            self.send_json_response({
                "received_params": result,
                "count": len(result)
            })
            return
        
        # 计算器 API
        if path.startswith('/api/calc'):
            params = self.parse_query(path)
            try:
                a = float(params.get('a', ['0'])[0])
                b = float(params.get('b', ['0'])[0])
                op = params.get('op', ['+'])[0]
                
                operations = {
                    '+': ('add', a + b),
                    '-': ('subtract', a - b),
                    '*': ('multiply', a * b),
                    'x': ('multiply', a * b),
                    '/': ('divide', a / b if b != 0 else float('inf')),
                    '%': ('modulo', a % b if b != 0 else float('inf')),
                    '**': ('power', a ** b)
                }
                
                if op in operations:
                    op_name, result = operations[op]
                    if result == float('inf'):
                        self.send_json_response({"error": "除数不能为 0"}, 400)
                        return
                    self.send_json_response({
                        "a": a,
                        "b": b,
                        "operation": op_name,
                        "operator": op,
                        "result": result
                    })
                else:
                    self.send_json_response({
                        "error": f"不支持的操作符: {op}",
                        "supported": list(operations.keys())
                    }, 400)
            except ValueError:
                self.send_json_response({"error": "参数 a 和 b 必须是数字"}, 400)
            return
        
        # 404 未找到
        self.send_json_response({
            "error": "Not Found",
            "path": path,
            "hint": "访问 / 查看 API 文档"
        }, 404)
    
    def do_POST(self):
        """处理 POST 请求"""
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            body = json.loads(post_data.decode())
        except json.JSONDecodeError:
            body = {"raw": post_data.decode()}
        
        self.send_json_response({
            "method": "POST",
            "path": self.path,
            "received_body": body,
            "timestamp": datetime.now().isoformat()
        })


def run_server(port=8080):
    """启动服务器"""
    server = HTTPServer(('0.0.0.0', port), APIHandler)
    print(f"=" * 50)
    print(f"🚀 HTTP API 服务已启动")
    print(f"📍 地址: http://localhost:{port}")
    print(f"📖 文档: http://localhost:{port}/")
    print(f"=" * 50)
    print(f"\n可用接口:")
    print(f"  GET  /api/sum?n=100      - 计算 1~n 累加和")
    print(f"  GET  /api/hello?name=Tom - 打招呼")
    print(f"  GET  /api/time           - 获取当前时间")
    print(f"  GET  /api/echo?foo=bar   - 回显参数")
    print(f"  GET  /api/calc?a=10&b=5&op=* - 简单计算")
    print(f"  POST /api/xxx            - 接收 JSON 数据")
    print(f"\n按 Ctrl+C 停止服务\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
        server.shutdown()


if __name__ == "__main__":
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    run_server(port)
