# 決策卡 6：雲端 Agent 的 Jira 寫入

- 問題：使用者希望 AI 能直接建立 Jira issue，但 Copilot cloud agent 可能在非互動環境執行，無法保證每次工具呼叫前都停下來等人確認。
- 選項：授權 Rovo connector 直接寫；維持 Jira 唯讀、人工建票；AI 產生草稿，再由 GitHub Actions `workflow_dispatch` 加受保護的 Environment reviewer 核准後寫入。
- 取捨：直接授權 connector 操作最順，但 prompt 中要求先詢問不是技術權限閘；人工建票安全但無法自動化；受保護的 workflow 多一步操作，卻可將專用 Jira token 限定在單一專案，並由 GitHub Environment 在 secrets 釋出前要求核准。
- 選擇與理由：AI 可整理並填入 Jira issue 草稿；實際寫入只能由人啟動 `create-jira-issue` workflow，且必須先由 `jira-write` Environment 的指定 reviewer 核准。Jira API token 只存於該 Environment，使用僅有目標專案必要 Browse Projects / Create Issues 權限的服務帳號，不給編輯、刪除或管理權限。
- 公開資料注意：CartPilot GitHub repository 為公開；人工核准摘要會呈現完整 issue 欄位。只用公開或自造內容，不能輸入真實個資、客戶內容或機密。
- 何時會改：若 GitHub Environment reviewer 無法套用於該 workflow / repo，或 Jira 服務帳號無法做到專案級最小權限，維持人工建票，不退回無核准的直接寫入。
