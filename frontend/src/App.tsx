import { useState } from 'react'
import './App.css'

const faqs = [
  {
    question: '如何查詢訂單目前的配送狀態？',
    answer:
      '會員中心及即時物流查詢目前尚未實作，正式查詢方式待確認。此示範頁不能查詢真實訂單，請勿輸入真實訂單編號或個人資料。',
    status: '查詢流程待確認',
  },
  {
    question: '付款失敗應該怎麼辦？',
    answer:
      '建議先確認付款資訊是否正確，並檢查銀行或支付工具是否有異常；若仍無法完成付款，可聯繫客服協助處理。實際支援的付款方式與處理流程待確認。',
    status: '政策待確認',
  },
  {
    question: '購買商品後可以申請退貨嗎？',
    answer:
      '是否符合退貨條件需依平台退貨政策及商品類型判斷；正式退貨期限、適用條件與例外商品待確認。',
    status: '政策待確認',
  },
]

function App() {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()
  const matchingFaqs = faqs.filter(({ question, answer }) => {
    return (
      question.toLowerCase().includes(normalizedQuery) ||
      answer.toLowerCase().includes(normalizedQuery)
    )
  })

  return (
    <main className="faq-page">
      <header className="page-header">
        <p className="brand">CartPilot</p>
        <h1>常見問題</h1>
        <p className="intro">輸入關鍵字，快速尋找相關問題與答案。</p>
      </header>

      <section className="search-section" aria-label="搜尋常見問題">
        <label htmlFor="faq-search">搜尋問題或答案</label>
        <input
          id="faq-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="例如：訂單、搜尋"
          aria-describedby="search-help"
        />
        <p id="search-help" className="search-help">
          可輸入問題或答案中的任意字詞。
        </p>
      </section>

      <p className="demo-notice">
        示範內容：以下為自造資料，不代表正式客服政策或服務承諾。
      </p>

      <section className="results-section" aria-label="常見問題搜尋結果">
        <p className="results-status" role="status" aria-live="polite">
          {normalizedQuery
            ? `找到 ${matchingFaqs.length} 個相關問題`
            : `共 ${matchingFaqs.length} 個示範問題`}
        </p>
        {matchingFaqs.length > 0 ? (
          <ul className="faq-list">
            {matchingFaqs.map(({ question, answer, status }) => (
              <li className="faq-card" key={question}>
                <div className="faq-card-heading">
                  <h2>{question}</h2>
                  {status && <span className="faq-status">{status}</span>}
                </div>
                <p>{answer}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">找不到相關問題，請試試其他關鍵字。</p>
        )}
      </section>
    </main>
  )
}

export default App
