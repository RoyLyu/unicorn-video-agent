import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FinalDemoPath } from "./final-demo-path";

describe("FinalDemoPath", () => {
  it("renders the four final demo steps", () => {
    const html = renderToStaticMarkup(createElement(FinalDemoPath));

    expect(html).toContain("Step 1: Quick Demo");
    expect(html).toContain("Step 2: AI Generate");
    expect(html).toContain("Step 3: Showcase");
    expect(html).toContain("Step 4: Export");
    expect(html).toContain("/quick-demo");
  });
});
