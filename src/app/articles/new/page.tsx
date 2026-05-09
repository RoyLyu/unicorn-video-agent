import { PageHeader } from "@/components/page-header";
import { demoArticle } from "@/lib/demo-data";

export default function NewArticlePage() {
  return (
    <main className="content-stack">
      <PageHeader
        title="新建文章"
        description="静态表单用于确认 Batch 01 输入体验，不绑定 Server Action，不提交数据。"
      />

      <section className="panel">
        <form className="form-grid">
          <div className="field">
            <label htmlFor="title">公众号文章标题</label>
            <input id="title" name="title" defaultValue={demoArticle.title} />
          </div>
          <div className="field">
            <label htmlFor="url">文章链接</label>
            <input id="url" name="url" defaultValue={demoArticle.url} />
          </div>
          <div className="field">
            <label htmlFor="publishedAt">发布日期</label>
            <input
              id="publishedAt"
              name="publishedAt"
              type="date"
              defaultValue={demoArticle.publishedAt}
            />
          </div>
          <div className="field">
            <label htmlFor="source">来源</label>
            <input id="source" name="source" defaultValue={demoArticle.source} />
          </div>
          <div className="field">
            <label htmlFor="tags">行业标签</label>
            <input id="tags" name="tags" defaultValue={demoArticle.tags.join("，")} />
          </div>
          <div className="field">
            <label htmlFor="duration">目标时长</label>
            <select id="duration" name="duration" defaultValue="90">
              <option value="90">90s</option>
              <option value="180">180s</option>
            </select>
          </div>
          <div className="field field--full">
            <label htmlFor="body">公众号文章正文</label>
            <textarea id="body" name="body" defaultValue={demoArticle.body} />
          </div>
          <div className="form-actions">
            <button className="ghost-button" type="button" disabled>
              Batch 01 不提交数据
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
