import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DemoModeBanner } from "./demo-mode-banner";

describe("DemoModeBanner", () => {
  it("renders the fixed public demo warning", () => {
    const html = renderToStaticMarkup(createElement(DemoModeBanner));

    expect(html).toContain("当前为 Demo Mode");
    expect(html).toContain("内容为模拟数据");
    expect(html).toContain("不构成投资建议");
    expect(html).toContain("不代表真实公司分析");
  });
});
