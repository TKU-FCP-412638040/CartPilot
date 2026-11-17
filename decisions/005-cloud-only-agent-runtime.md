# 決策卡 5：雲端專用 AI 執行環境

- 問題：如何讓 AI、驗證與部署流程都不依賴開發者本機服務或命令？
- 選項：本機 VS Code Agent 加雲端 CI；GitHub Copilot cloud sandbox Agent 加 GitHub-hosted CI；GitHub Actions-based Agent session
- 取捨：本機 Agent 不符合不在本機執行的要求；Actions-based Agent 支援 setup workflow，但 GitHub 管理的 connectors 不適用該 session 類型；cloud sandbox 可使用 Copilot cloud customizations / connectors，而 GitHub-hosted Actions 可獨立執行 CI。
- 選擇與理由：使用 GitHub Copilot cloud sandbox 執行需求分析、設計與程式變更，使用 GitHub-hosted Actions 執行 lint/build；Jira 優先評估 GitHub 管理的 Atlassian Rovo connector。這不要求本機啟動服務或執行程式。GitHub Copilot 授權、組織政策、connector 與 repository ruleset 仍需管理者在 GitHub / Atlassian 設定。
- 安全界線：Cloud agent 工具可能在非互動環境執行；prompt 中要求「先確認」不是技術權限閘。Jira 初始採唯讀 connector / 帳號；任何 AI 寫入都透過受保護且可稽核的人工核准 workflow。Vercel 管理部署環境變數；Production deployment 需先 staged，再由人類明確 Promote。
- 何時會改：若 connector 不支援唯讀權限、方案政策不允許 cloud sandbox，或需要將雲端 Agent 執行本身強制放在 GitHub Actions runner，需先比較可用功能、權限模型與成本，再更新決策卡。
