#!/usr/bin/env python3
"""批量添加/替换 modiqi-footer 脚本"""
import os
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# 标准页脚 HTML
STANDARD_FOOTER = '''        <!-- Footer -->
        <footer class="modiqi-footer">
            <img src="../shared/images/modiqi-logo-r.png" alt="Modiqi" class="footer-logo">
            <span>© 2025 Modiqi Digital Consulting</span>
        </footer>'''

def should_skip(filepath):
    """判断是否应跳过此文件"""
    path_str = str(filepath)
    return 'index.html' in path_str or '/shared/' in path_str

def has_modiqi_footer(content):
    """检查是否已有标准 modiqi-footer"""
    return 'modiqi-footer' in content

def has_canvas_footer(content):
    """检查是否有 canvas-footer"""
    return 'canvas-footer' in content

def has_any_footer(content):
    """检查是否有任何 footer 标签"""
    return '<footer' in content

def remove_canvas_footer(content):
    """移除 canvas-footer 块"""
    # 匹配整个 canvas-footer 块
    pattern = r'\s*<footer class="canvas-footer">.*?</footer>\s*'
    return re.sub(pattern, '\n', content, flags=re.DOTALL)

def add_modiqi_footer(content):
    """在 </main> 前添加标准页脚"""
    # 在 </main> 前添加页脚
    pattern = r'(\s*)(</main>)'
    replacement = f'\n{STANDARD_FOOTER}\n\\1\\2'
    return re.sub(pattern, replacement, content, count=1)

def process_file(filepath):
    """处理单个文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 检查是否为 paper-a3 工具页面
    if 'paper-a3' not in content:
        return None, "非工具页面"
    
    # 已有标准页脚则跳过
    if has_modiqi_footer(content):
        return None, "已有 modiqi-footer"
    
    original_content = content
    action = None
    
    # 有 canvas-footer 则替换
    if has_canvas_footer(content):
        content = remove_canvas_footer(content)
        content = add_modiqi_footer(content)
        action = "替换"
    # 没有任何 footer 则添加
    elif not has_any_footer(content):
        content = add_modiqi_footer(content)
        action = "添加"
    else:
        return None, "有其他自定义页脚，需手动检查"
    
    # 写入文件
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return action, "成功"

def main():
    print("=" * 50)
    print("Modiqi Footer 批量处理脚本 (Python)")
    print("=" * 50)
    print()
    
    stats = {"替换": 0, "添加": 0, "跳过": 0, "错误": 0}
    
    # 遍历所有 HTML 文件
    for html_file in BASE_DIR.rglob("*.html"):
        if should_skip(html_file):
            continue
        
        rel_path = html_file.relative_to(BASE_DIR)
        
        try:
            action, message = process_file(html_file)
            if action:
                print(f"  [{action}] {rel_path}")
                stats[action] += 1
            else:
                if "手动" in message:
                    print(f"  [警告] {rel_path} - {message}")
                    stats["错误"] += 1
                else:
                    stats["跳过"] += 1
        except Exception as e:
            print(f"  [错误] {rel_path} - {e}")
            stats["错误"] += 1
    
    print()
    print("=" * 50)
    print("处理完成!")
    print(f"  替换: {stats['替换']} 个文件")
    print(f"  添加: {stats['添加']} 个文件")
    print(f"  跳过: {stats['跳过']} 个文件")
    print(f"  错误: {stats['错误']} 个文件")
    print("=" * 50)

if __name__ == "__main__":
    main()
