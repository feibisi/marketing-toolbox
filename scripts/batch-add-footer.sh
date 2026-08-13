#!/bin/bash
# 批量添加/替换 modiqi-footer 脚本
# 规则：工具页面使用标准 modiqi-footer

set -euo pipefail

cd "$(dirname "$0")/.." || exit 1

# 处理计数
replaced=0
added=0
skipped=0

# 标准页脚 HTML
FOOTER='        <!-- Footer -->
        <footer class="modiqi-footer">
            <img src="../shared/images/modiqi-logo-r.png" alt="Modiqi" class="footer-logo">
            <span>© 2025 Modiqi Digital Consulting</span>
        </footer>'

echo "========================================="
echo "Modiqi Footer 批量处理脚本"
echo "========================================="
echo ""

# 类型1: 替换 canvas-footer
echo ">>> 处理类型1: 替换 canvas-footer..."
for file in $(rg -l "canvas-footer" -g "*.html" . 2>/dev/null); do
    # 跳过 index.html 和 shared 目录
    if [[ "$file" == *"index.html"* ]] || [[ "$file" == *"/shared/"* ]]; then
        continue
    fi
    
    # 已有 modiqi-footer 则跳过
    if rg -q "modiqi-footer" "$file"; then
        echo "  [跳过] $file (已有 modiqi-footer)"
        ((skipped++))
        continue
    fi
    
    echo "  [替换] $file"
    
    # 使用 sed 替换整个 canvas-footer 块
    # 首先删除 canvas-footer 块，然后在 </main> 前添加标准页脚
    sed -i '' '/<footer class="canvas-footer">/,/<\/footer>/d' "$file"
    sed -i '' "s|</main>|$FOOTER\n    </main>|" "$file"
    
    ((replaced++))
done
echo ""

# 类型2: 添加缺失的页脚
echo ">>> 处理类型2: 添加缺失的 modiqi-footer..."
for file in $(rg -l "paper-a3" -g "*.html" . 2>/dev/null); do
    # 跳过 index.html 和 shared 目录
    if [[ "$file" == *"index.html"* ]] || [[ "$file" == *"/shared/"* ]]; then
        continue
    fi
    
    # 已有任何 footer 则跳过
    if rg -q "<footer" "$file"; then
        # 检查是否是 modiqi-footer
        if ! rg -q "modiqi-footer" "$file"; then
            echo "  [警告] $file 有非标准页脚，需手动检查"
        fi
        continue
    fi
    
    echo "  [添加] $file"
    
    # 在 </main> 前添加标准页脚
    sed -i '' "s|    </main>|\n$FOOTER\n    </main>|" "$file"
    
    ((added++))
done
echo ""

echo "========================================="
echo "处理完成!"
echo "  替换: $replaced 个文件"
echo "  添加: $added 个文件"
echo "  跳过: $skipped 个文件"
echo "========================================="
