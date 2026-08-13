---
description: How to ensure footer compliance across all tools
---

This workflow describes how to audit and fix footer issues in the Modiqi Digital Marketing Workbench.

# 1. Audit Missing Footers
Run the following command to find HTML files in toolkits that match the pattern but might be missing the `modiqi-footer` class.
Note: You might need to use `rg --files-without-match "modiqi-footer" -g "*.html"` or similar depending on the environment.

# 2. Add Standard Footer
For each file identified, append the standard footer HTML just before the closing `</main>` tag.

Standard Footer HTML:
```html
        <footer class="modiqi-footer">
            <img src="../shared/images/modiqi-logo-r.png" alt="Modiqi Logo" class="footer-logo"
                title="点击隐藏/显示工具栏 (Toggle Toolbar)">
            <div class="copyright">Modiqi Digital Strategy Workbench &copy; 2026</div>
        </footer>
```

# 3. Verify core.js Injection
Ensure `shared/js/core.js` has the `injectFooter()` method updated with the correct year (2026).
This serves as a fallback for tools where static footer might be missing.

# 4. Check Index Pages
Index pages (`index.html` in root and subdirectories) should use `<footer class="site-footer">` instead of `modiqi-footer`.
Ensure the copyright year is updated to 2026 in these files as well.
