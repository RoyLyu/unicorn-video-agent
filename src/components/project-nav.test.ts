import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProjectNav } from "./project-nav";

describe("ProjectNav", () => {
  it("includes the Showcase entry for dynamic project pages", () => {
    const html = renderToStaticMarkup(
      createElement(ProjectNav, { projectId: "project-1" })
    );

    expect(html).toContain("Showcase");
    expect(html).toContain("/projects/project-1/showcase");
    expect(html).toContain("Production Studio");
    expect(html).toContain("/projects/project-1/production-studio");
  });
});
