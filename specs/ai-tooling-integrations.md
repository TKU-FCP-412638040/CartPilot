# 雲端 AI 工具整合

## 背景與目的

讓 AI 工作、CI 與部署驗證都在雲端完成，不要求開發者在本機啟動服務或執行命令。repo 可追蹤的規則與程式放 GitHub；使用者 OAuth、Jira site、repository rulesets 與 deployment secrets 由 GitHub / Atlassian 管理頁設定。

## 已確認的官方整合方式

- **Copilot context 與 Skill**：`AGENTS.md`、`.github/copilot-instructions.md` 和 `.github/skills/<skill-name>/SKILL.md` 存在 GitHub repo，供相容的雲端 Copilot agent 載入。Skills 是任務型流程，不取代常駐專案指示。
- **雲端 Agent 執行環境**：Copilot 可在 cloud sandbox 或 GitHub Actions-based session 工作；兩者不是同一種環境。`copilot-setup-steps.yml` 只適用 Actions-based session，不適用 cloud sandbox。此專案目前以 cloud sandbox 執行 Agent、GitHub-hosted Actions 執行 CI。
- **CI**：GitHub Actions 執行 `npm ci`、`npm run lint`、`npm run build`，以及 Jira workflow helper 的 Node.js 內建測試。本 repo 尚無前端測試或 AI 評估 runner，不能把 helper 測試說成產品功能測試。
- **Branch protection**：Workflow 能提供 PR check，但設定 required status checks 屬於 GitHub repository ruleset / branch protection 設定，不會只因加入 workflow 自動生效。
- **Jira（建議）**：在 GitHub Copilot cloud sandbox 使用 GitHub 管理的 Atlassian Rovo connector，透過 connector 設定頁登入與核准；connector 不適用於 GitHub Actions-based session。由於它依使用者既有 Atlassian 權限，必須確認 site 與資料範圍。
- **Jira MCP（替代方案）**：GitHub cloud agent 的 repository MCP 設定不支援自訂遠端 MCP OAuth。GitHub 文件提供以 Atlassian API token / secret 設定 MCP 的替代方式，但 token 權限較廣、需要維護輪替；除非 Rovo connector 不可用且管理員完成最小權限評估，否則不採用。不可將 token 放入 repo 檔案。
- **Agent Hooks**：Hooks 可自動執行命令，且各 harness 的支援方式不同。現階段不依賴 Preview Hooks 作為必要安全邊界；品質 gate 放在 GitHub Actions 與 repository ruleset。

## 雲端端到端流程

1. 人類確認需求、優先順序、規格與 Jira project；AI 先讀 repo 指示、產品規格與決策卡。
2. 由 GitHub Copilot cloud agent 在 cloud sandbox 拆解工作；如需 Jira，使用已核准的 Atlassian Rovo connector 查詢。AI 草擬 Jira issue，寫入一律經過人工啟動與 Environment 核准。
3. AI 按規格實作並在雲端 Agent 環境回饋修正，建立 PR；不直接推送至受保護分支、不自動合併。
4. GitHub-hosted Actions 自動執行 lint/build；設定 repository ruleset 後，成功的 `lint-and-build` check 才成為合併必要條件。
5. 在 GitHub PR 使用 Copilot code review 或人工 review；修正意見後重新跑 CI。
6. 人類依規格完成產品驗收。部署平台設定完成前不啟動部署；設定後由 GitHub Actions deploy 至 Preview，Production 使用 GitHub Environment approval gate。
7. PR / 發佈後的缺陷回饋到規格、Skill、評估題及 CI；沒有評估執行器時只報告人工評估，不假稱自動評估。

## 雲端啟用清單（需 GitHub / Jira 管理者）

### GitHub Copilot cloud sandbox 與 Jira

1. 在 GitHub 確認目前方案與組織政策允許 Copilot cloud agent / cloud sandbox；在 repository 的 Copilot 設定允許使用 cloud agent。
2. 由有 Jira 權限的管理者建立或指定一個只讀 Jira 帳號，只能讀取 CartPilot 專案所需 issue / 欄位。不要直接使用有管理權限的個人 Atlassian 帳號授權 Agent。
3. 由使用者在 GitHub Copilot connectors / integrations 設定找到 Atlassian Rovo、完成登入及授權，只授權預定 Jira site。若 connector 無法限制到單一 site 或唯讀範圍，先不要連線，改採 GitHub Issues 或請管理者另設權限隔離方案。
4. 啟動 Copilot cloud sandbox session，而非 Actions-based Agent session；在該 session 執行只讀測試，確認它實際呼叫 Atlassian connector、只看得到核准專案、無法新增或修改 issue。
5. AI 產生 Jira 草稿後，由人啟動 `create-jira-issue` GitHub Actions workflow；`jira-write` Environment 必須先設定 required reviewer。Reviewer 核准後，workflow 才取得 Environment secret 並建立 issue。
6. Jira 建立帳號限制為目標專案的 Create Issues 權限；不授予編輯、刪除、管理專案或其他產品權限。服務帳號及 token 建立、輪替需由 Atlassian 管理者完成。

### GitHub CI 與合併門檻

1. 在 repository 的 Actions 設定確認允許 workflow 執行；workflow 檔案位於 `.github/workflows/ci.yml`。
2. 等待至少一次 PR workflow 成功，確認 status check 名稱為 `lint-and-build`。
3. 由 repository admin 在 default branch 的 Rulesets / Branch protection 設定要求 pull request，並將 `lint-and-build` 設為 required status check；視團隊政策設定至少一位 reviewer、過期核准失效及管理員是否可 bypass。
4. 建立測試 PR 確認未通過 CI 時無法合併；不要只以 workflow 顯示綠燈代替 ruleset 驗證。

### 人工核准後建立 Jira issue

1. 在 GitHub repository 建立名為 `jira-write` 的 Environment，先加入另一位 reviewer、啟用 Prevent self-review，再將 `JIRA_EMAIL`、`JIRA_API_TOKEN` 設為 Environment secrets。workflow 已指定 `https://jenny312198.atlassian.net`、Cloud ID 與 Project Key `CART`，不必再建立 Jira variables。
2. 目前為個人 Jira site，由帳號持有人建立 scoped API token，只選 Jira app 的 `write:issue:jira` / `read:issue:jira` granular scopes，不選 `delete:issue:jira`、管理權限或其他產品權限。Token scopes 限定 API 能力，但不會自動限制 Project Key 範圍；仍需使用者的 Browse Projects / Create Issues Jira permissions，workflow 也固定只對 `JIRA_PROJECT_KEY` 建立 issue。
3. 人類檢查 AI 草擬的 issue summary、description 和 issue type，再從 Actions 手動執行 `Create Jira issue (approved)` workflow。
4. 此 repo 是公開 repo，workflow run summary 會顯示待建立的 issue 內容以供 reviewer 檢查。只輸入公開或自造資料，不得輸入真實個資、客戶內容、密碼、token 或機密。Reviewer 在 Environment approval 畫面確認內容與執行者後，workflow 才建立一筆 issue；執行結果僅回報新 issue key，不輸出 token。
5. 確認目前 GitHub plan 支援 private repository 的 Environment required reviewers；未設定 reviewer 或所需 Environment secret 時 workflow 不得成功，不能改用 prompt / repository secret 繞過核准。

### Preview 與 Production 部署

1. Vercel 為目標平台；在 Vercel 將 GitHub repository 連到 Vercel project，Framework preset 設為 Vite、Root Directory 設為 `frontend`，Production Branch 設為 `main`。
2. 保留 Vercel Git integration 的 PR Preview deployments；fork PR 依 Vercel authorization 保護，不要關閉 Git Fork Protection。
3. 要求 Production 人工核准時，在 Vercel Project Settings → Environments → Production → Branch Tracking 關閉 **Auto-assign Custom Production Domains**。`main` 的 Production build 會先成為 staged deployment，不自動接管正式網域。
4. 人類在 Vercel Deployments 檢查 staged deployment，經 Vercel UI 明確執行 Promote to Production 才切換正式網域；確認 preview / production environment variables 分開管理。
5. 合併一個測試 PR，確認有 Preview URL；合併到 `main` 後確認 Production deployment 為 staged 且正式網域未改變，再於 Vercel UI 人工核准 promote。

## 本次整合範圍

1. Repo instructions、流程 Skill、PR 範本、GitHub Actions lint/build CI 與人工核准後建立 Jira issue 的 workflow 已在 repo 內設定。
2. Cloud sandbox 與 GitHub-hosted Actions 為不同環境；本流程不要求本機服務。若帳號介面提供 cloud sandbox，應選該環境執行 coding agent。
3. Atlassian Rovo connector、GitHub Copilot cloud agent 存取權、repository ruleset、Copilot review / 授權方案和 Vercel 專案連結，必須由具相應權限的人在 GitHub / Atlassian / Vercel 管理頁設定；repo commit 不能代替帳號授權。
4. 不將 Jira token、OAuth secret、deployment secret 寫入 Git；Jira workflow 未完成 reviewer / secret 設定前無法寫入；Production promote 必須在 Vercel UI 人工執行。
5. 不加入 `copilot-setup-steps.yml`：它只供 Actions-based Agent session 使用，而本設計選擇 cloud sandbox；如日後改用 Actions-based session，另依官方支援範圍評估。

## 驗收標準

1. Copilot cloud agent 可從 repo instructions / Skill 取得專案規則及前端 lint/build 命令。
2. PR 與 push 由 GitHub-hosted Actions 執行 Jira workflow helper 測試、依賴安裝、lint 與 build；一般 CI 權限為唯讀且不使用 secrets。
3. Repository ruleset 要求 `lint-and-build` 成功後才能合併。
4. Jira issue 只能經手動啟動且受 `jira-write` Environment reviewer 保護的 workflow 建立；token 僅有指定專案必要的 Browse Projects / Create Issues 權限。
5. PR 會產生 Vercel Preview；`main` 的 Production deployment 先 staged，必須經 Vercel UI 人工 Promote 才能切換正式網域。
6. GitHub / Atlassian secrets 只透過官方設定介面管理，不進 repo。
7. 現有產品行為不變。

## 開放問題

- Jira Cloud site URL、project key、issue type、workflow 欄位及管理員是否可啟用 Atlassian Rovo connector。
- GitHub Copilot plan / organization policy 是否允許 cloud agent 與 Atlassian Rovo connector。
- GitHub 預設分支與管理者是否能將 `lint-and-build` 設為 required status check。
- Vercel 專案是否已連結 GitHub repo，及是否可停用 main 合併後的自動 Production 部署。
- 是否新增前端測試與 AI 評估執行器；目前只有 lint/build。

## 官方參考

- [決策卡 5：雲端專用 AI 執行環境](../decisions/005-cloud-only-agent-runtime.md)
- [決策卡 6：雲端 Agent 的 Jira 寫入](../decisions/006-approval-gated-jira-writes.md)
- [GitHub Copilot on GitHub：Cloud sandboxes 與 Actions-based sessions](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github)
- [GitHub Copilot：MCP server scopes 與限制](https://docs.github.com/en/copilot/concepts/customizations/mcp)
- [GitHub Copilot：Connectors](https://docs.github.com/en/copilot/concepts/customizations/copilot-connectors)
- [GitHub Copilot：Supported connectors](https://docs.github.com/en/copilot/reference/supported-connectors)
- [GitHub Copilot：Configuring MCP servers](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/configure-mcp-servers)
- [GitHub Copilot：Cloud agent development environment](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/customize-the-agent-environment)
- [GitHub Copilot：VS Code repository instructions](https://docs.github.com/en/copilot/how-tos/copilot-in-your-ide/customize-copilot/configure-custom-instructions/add-repository-instructions-in-your-ide)
- [VS Code：Agent Skills](https://code.visualstudio.com/docs/agent-customization/agent-skills)
- [GitHub Actions：Building and testing Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [GitHub Actions：GITHUB_TOKEN 權限](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)
- [GitHub：Protected branches 與 required status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Vercel：Deploying GitHub projects](https://vercel.com/docs/git/vercel-for-github)
- [Vercel：Promoting deployments](https://vercel.com/docs/deployments/promoting-a-deployment)
- [Atlassian：Remote MCP Server setup](https://support.atlassian.com/atlassian-ai-gateway/docs/get-started-with-the-atlassian-remote-mcp-server/)
