# 決策卡 4：Copilot 與 CI 整合

> 更新：本卡最初將 Jira MCP 視為使用者授權的本機 VS Code 設定。使用者後續要求所有工作都在雲端執行；雲端架構以 [決策卡 5](./005-cloud-only-agent-runtime.md) 為準，Jira 寫入核准方式以 [決策卡 6](./006-approval-gated-jira-writes.md) 為準。

- 問題：先把哪些外部工具接進 AI 協作工作流，才能改善每次變更的品質，又不擴大權限風險？
- 選項：直接接上所有 Jira MCP 與 Preview Hooks；只補文件；先啟用 repo instructions 與唯讀 GitHub Actions CI，延後需要外部帳號授權或 hook 行為尚未明確的整合
- 取捨：全量整合能減少手動步驟，但 Jira MCP 權限可跨多個 Atlassian 產品，Hooks 可自動執行命令且仍在 Preview；單補文件不能驗證程式變更。Repo instructions 與 lint/build CI 不需服務憑證，能先建立穩定的品質回饋。
- 選擇與理由：新增 `.github/copilot-instructions.md` 串接既有 `AGENTS.md` / 規格，並加入 GitHub Actions 執行 `npm ci`、lint、build，權限只有 `contents: read`。初版延後 Jira connector 與 Hooks；雲端執行方式和 Jira 寫入後續分別由決策卡 5、6 定義。
- 何時會改：Jira site、專案欄位與核准流程明確後，評估 Atlassian MCP；Hook 有明確守護對象、事件與安全失敗行為後，再立獨立決策卡。CI 跑通後由 repo 管理者決定是否將 check 設為 required。
