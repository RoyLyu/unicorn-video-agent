const inputs = [
  "公众号文章标题",
  "公众号文章正文",
  "文章链接",
  "发布日期",
  "来源",
  "行业标签",
  "目标时长：90s / 180s"
];

const outputs = [
  "核心摘要",
  "核心观点",
  "90s 视频号脚本",
  "180s 视频号脚本",
  "分镜表",
  "图表建议",
  "AI 图像 Prompt",
  "AI 视频 Prompt",
  "素材搜索线索",
  "版权风险表",
  "封面文案",
  "发布文案",
  "Markdown / CSV / JSON 导出包"
];

const outOfScope = [
  "不自动抓取公众号全文",
  "不自动下载网络素材",
  "不自动发布视频号",
  "不自动生成完整成片",
  "不使用未确认版权的新闻图、视频片段、影视片段、音乐和字体"
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Batch 00</p>
        <h1>独角兽早知道 Video Agent MVP</h1>
        <p className="summary">
          将公众号财经文章转化为微信视频号生产包，包括观点、脚本、分镜、素材
          Prompt、搜索线索、版权风险和发布文案。
        </p>
        <div className="status-row" aria-label="项目状态">
          <span>Next.js + TypeScript</span>
          <span>Zod Schema</span>
          <span>Docs First</span>
        </div>
      </section>

      <section className="content-grid" aria-label="MVP 范围">
        <article>
          <h2>第一版输入</h2>
          <ul>
            {inputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article>
          <h2>第一版输出</h2>
          <ul>
            {outputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article>
          <h2>不做什么</h2>
          <ul>
            {outOfScope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
