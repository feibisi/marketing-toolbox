#!/usr/bin/env python3
"""统一版权信息为: Modiqi Digital Marketing Workbench © 2026"""

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SHARED = ROOT / 'shared'

# 需要替换的模式
REPLACEMENTS = [
    # 工具页面旧版权
    ('© 2025 Modiqi Digital Consulting', 'Modiqi Digital Marketing Workbench © 2026'),
    # 启动页旧年份   
    ('Modiqi Digital Marketing Workbench &copy; 2025', 'Modiqi Digital Marketing Workbench &copy; 2026'),
    ('Modiqi Workbench &copy; 2025', 'Modiqi Digital Marketing Workbench &copy; 2026'),
]

def process_file(filepath):
    """处理单个文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for old, new in REPLACEMENTS:
            content = content.replace(old, new)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"  错误: {filepath} - {e}")
        return False

def main():
    print("=== 统一版权信息 ===")
    print("目标: Modiqi Digital Marketing Workbench © 2026")
    print()
    
    modified = 0
    total = 0
    
    for html_file in ROOT.rglob('*.html'):
        # 跳过 shared 目录
        if SHARED in html_file.parents:
            continue
        
        total += 1
        if process_file(html_file):
            print(f"  [修改] {html_file.relative_to(ROOT)}")
            modified += 1
    
    print()
    print(f"=== 完成 ===")
    print(f"检查文件: {total}")
    print(f"修改文件: {modified}")

if __name__ == '__main__':
    main()
