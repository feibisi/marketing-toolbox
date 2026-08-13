#!/bin/bash
# 脚本: 为缺少 modiqi-footer 的工具页面批量添加页脚
# 规则: 工具页面使用 modiqi-footer，启动页 (index.html) 使用 site-footer

set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

# 定义页脚 HTML (注意不同目录层级需要调整路径)
FOOTER_LEVEL1='        <!-- Footer -->
        <footer class="modiqi-footer">
            <img src="../shared/images/modiqi-logo-r.png" alt="Modiqi" class="footer-logo">
            <span>© 2025 Modiqi Digital Consulting</span>
        </footer>'

# 找出所有使用 paper-a3 但缺少 modiqi-footer 的工具页面
echo "检查缺少页脚的工具页面..."
rg -l "paper-a3" -g "*.html" . | while read f; do
    # 排除 index.html 和 shared 目录
    if [[ "$f" == *"index.html"* ]] || [[ "$f" == *"/shared/"* ]]; then
        continue
    fi
    
    # 检查是否已有 modiqi-footer
    if ! rg -q "modiqi-footer" "$f"; then
        echo "缺少页脚: $f"
    fi
done

echo ""
echo "总计需要添加页脚的文件数量:"
rg -l "paper-a3" -g "*.html" . | while read f; do
    if [[ "$f" == *"index.html"* ]] || [[ "$f" == *"/shared/"* ]]; then
        continue
    fi
    if ! rg -q "modiqi-footer" "$f"; then
        echo "$f"
    fi
done | wc -l
