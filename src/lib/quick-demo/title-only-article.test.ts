import { describe, expect, it } from "vitest";

import { ArticleInputSchema } from "@/lib/schemas/production-pack";

import {
  buildQuickDemoShowcaseUrl,
  createTitleOnlyArticleInput,
  parseQuickDemoIndustryTags
} from "./title-only-article";

describe("title-only quick demo article input", () => {
  it("constructs a valid ArticleInput from a title-only brief", () => {
    const input = createTitleOnlyArticleInput({
      title: "虚构家庭医疗公司冲刺上市",
      contentType: "ipo",
      industryTagsText: "家庭医疗，IPO",
      today: new Date("2026-05-11T10:00:00+09:00")
    });

    expect(() => ArticleInputSchema.parse(input)).not.toThrow();
    expect(input.title).toBe("虚构家庭医疗公司冲刺上市");
    expect(input.sourceName).toBe("Title-only Demo");
    expect(input.sourceUrl).toBe("https://example.com/title-only-demo");
    expect(input.publishDate).toBe("2026-05-11");
  });

  it("falls back to content-type default tags when industry tags are empty", () => {
    expect(parseQuickDemoIndustryTags("", "industry_trend")).toEqual([
      "行业趋势",
      "产业观察"
    ]);
  });

  it("always uses both 90s and 180s target durations", () => {
    const input = createTitleOnlyArticleInput({
      title: "虚构消费品牌增长样本",
      contentType: "growth_case",
      industryTagsText: "",
      today: new Date("2026-05-11T10:00:00+09:00")
    });

    expect(input.targetDurations).toEqual([90, 180]);
  });

  it("marks the rawText as a title-only demo brief with investment disclaimer", () => {
    const input = createTitleOnlyArticleInput({
      title: "虚构政策变化影响创新企业融资",
      contentType: "policy_macro",
      industryTagsText: "",
      today: new Date("2026-05-11T10:00:00+09:00")
    });

    expect(input.rawText).toContain("这是由标题生成的演示 brief");
    expect(input.rawText).toContain("不代表真实事实");
    expect(input.rawText).toContain("公司名、数字、上市信息、市场数据都需要人工核验");
    expect(input.rawText).toContain("不构成投资建议");
  });

  it("builds the Showcase redirect URL after successful generation", () => {
    expect(buildQuickDemoShowcaseUrl("project-abc")).toBe(
      "/projects/project-abc/showcase"
    );
  });
});
