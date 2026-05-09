import type { FactCheckRecord } from "@/db/repositories/fact-check-repository";
import type { FactCheckStatus } from "@/lib/review/review-schemas";

const factCheckStatuses: FactCheckStatus[] = [
  "pending",
  "verified",
  "needs_review",
  "rejected"
];

export function FactCheckTable({
  factChecks,
  onChange
}: {
  factChecks: FactCheckRecord[];
  onChange: (items: FactCheckRecord[]) => void;
}) {
  return (
    <section className="panel">
      <h2>事实核验表</h2>
      <div className="table-wrap">
        <table>
          <caption>Fact checks</caption>
          <thead>
            <tr>
              <th>类型</th>
              <th>项目</th>
              <th>值</th>
              <th>来源</th>
              <th>状态</th>
              <th>备注</th>
            </tr>
          </thead>
          <tbody>
            {factChecks.map((item, index) => (
              <tr key={item.id}>
                <td>{item.itemType}</td>
                <td>{item.label}</td>
                <td>
                  <input
                    value={item.value}
                    onChange={(event) =>
                      updateFactCheck(factChecks, index, { value: event.target.value }, onChange)
                    }
                  />
                </td>
                <td>
                  <input
                    value={item.sourceUrl}
                    onChange={(event) =>
                      updateFactCheck(
                        factChecks,
                        index,
                        { sourceUrl: event.target.value },
                        onChange
                      )
                    }
                  />
                </td>
                <td>
                  <select
                    value={item.status}
                    onChange={(event) =>
                      updateFactCheck(
                        factChecks,
                        index,
                        { status: event.target.value as FactCheckStatus },
                        onChange
                      )
                    }
                  >
                    {factCheckStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    value={item.notes}
                    onChange={(event) =>
                      updateFactCheck(factChecks, index, { notes: event.target.value }, onChange)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function updateFactCheck(
  factChecks: FactCheckRecord[],
  index: number,
  patch: Partial<FactCheckRecord>,
  onChange: (items: FactCheckRecord[]) => void
) {
  onChange(
    factChecks.map((item, currentIndex) =>
      currentIndex === index ? { ...item, ...patch } : item
    )
  );
}
