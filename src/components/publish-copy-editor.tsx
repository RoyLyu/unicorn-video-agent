import type { PublishCopyRecord } from "@/db/repositories/publish-copy-repository";

export function PublishCopyEditor({
  publishCopy,
  onChange
}: {
  publishCopy: PublishCopyRecord;
  onChange: (publishCopy: PublishCopyRecord) => void;
}) {
  return (
    <section className="panel">
      <h2>发布文案编辑器</h2>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="coverTitle">封面标题</label>
          <input
            id="coverTitle"
            value={publishCopy.coverTitle}
            onChange={(event) =>
              onChange({ ...publishCopy, coverTitle: event.target.value, isManual: true })
            }
          />
        </div>
        <div className="field">
          <label htmlFor="tags">标签建议</label>
          <input
            id="tags"
            value={publishCopy.tags.join("，")}
            onChange={(event) =>
              onChange({
                ...publishCopy,
                tags: event.target.value
                  .split(/[，,]/)
                  .map((tag) => tag.trim())
                  .filter(Boolean),
                isManual: true
              })
            }
          />
        </div>
        <div className="field field--full">
          <label htmlFor="titleCandidates">视频号标题候选</label>
          <textarea
            id="titleCandidates"
            value={publishCopy.titleCandidates.join("\n")}
            onChange={(event) =>
              onChange({
                ...publishCopy,
                titleCandidates: event.target.value
                  .split("\n")
                  .map((title) => title.trim())
                  .filter(Boolean),
                isManual: true
              })
            }
          />
        </div>
        <div className="field field--full">
          <label htmlFor="publishText">发布文案</label>
          <textarea
            id="publishText"
            value={publishCopy.publishText}
            onChange={(event) =>
              onChange({ ...publishCopy, publishText: event.target.value, isManual: true })
            }
          />
        </div>
        <div className="field field--full">
          <label htmlFor="riskNotice">风险提示</label>
          <textarea
            id="riskNotice"
            value={publishCopy.riskNotice}
            onChange={(event) =>
              onChange({ ...publishCopy, riskNotice: event.target.value, isManual: true })
            }
          />
        </div>
      </div>
    </section>
  );
}
