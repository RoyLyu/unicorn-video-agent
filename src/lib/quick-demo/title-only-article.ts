import {
  ArticleInputSchema,
  type ArticleInput
} from "@/lib/schemas/production-pack";

export const TITLE_ONLY_DEMO_SOURCE_NAME = "Title-only Demo";
export const TITLE_ONLY_DEMO_SOURCE_URL =
  "https://example.com/title-only-demo";
export const TITLE_ONLY_WARNING =
  "该项目由标题生成，事实信息需要人工核验。";

export const quickDemoContentTypes = [
  {
    value: "ipo",
    label: "IPO / 上市分析",
    defaultTags: ["IPO", "上市", "资本市场"]
  },
  {
    value: "financing",
    label: "融资 / 独角兽分析",
    defaultTags: ["融资", "独角兽", "一级市场"]
  },
  {
    value: "industry_trend",
    label: "行业趋势",
    defaultTags: ["行业趋势", "产业观察"]
  },
  {
    value: "growth_case",
    label: "公司增长案例",
    defaultTags: ["公司增长", "商业模式"]
  },
  {
    value: "policy_macro",
    label: "政策 / 宏观影响",
    defaultTags: ["政策", "宏观", "产业影响"]
  }
] as const;

export type QuickDemoContentType = (typeof quickDemoContentTypes)[number]["value"];

type CreateTitleOnlyArticleInput = {
  title: string;
  contentType: QuickDemoContentType;
  industryTagsText?: string;
  today?: Date;
};

export function createTitleOnlyArticleInput({
  title,
  contentType,
  industryTagsText = "",
  today = new Date()
}: CreateTitleOnlyArticleInput): ArticleInput {
  const contentTypeConfig = getQuickDemoContentType(contentType);
  const normalizedTitle = title.trim();
  const industryTags = parseQuickDemoIndustryTags(
    industryTagsText,
    contentType
  );

  return ArticleInputSchema.parse({
    title: normalizedTitle,
    rawText: buildTitleOnlyBrief(normalizedTitle, contentTypeConfig.label),
    sourceUrl: TITLE_ONLY_DEMO_SOURCE_URL,
    publishDate: formatLocalDate(today),
    sourceName: TITLE_ONLY_DEMO_SOURCE_NAME,
    industryTags,
    targetDurations: [90, 180]
  });
}

export function parseQuickDemoIndustryTags(
  tagsText: string,
  contentType: QuickDemoContentType
): string[] {
  const parsedTags = tagsText
    .split(/[，,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (parsedTags.length > 0) {
    return parsedTags;
  }

  return [...getQuickDemoContentType(contentType).defaultTags];
}

export function buildQuickDemoShowcaseUrl(projectId: string): string {
  return `/projects/${projectId}/showcase`;
}

function getQuickDemoContentType(contentType: QuickDemoContentType) {
  const config = quickDemoContentTypes.find((item) => item.value === contentType);

  if (!config) {
    throw new Error(`Unsupported quick demo content type: ${contentType}`);
  }

  return config;
}

function buildTitleOnlyBrief(title: string, contentTypeLabel: string): string {
  return [
    `标题：${title}`,
    `内容类型：${contentTypeLabel}`,
    "这是由标题生成的演示 brief，用于快速展示 AI Agent 如何把一个选题转化为视频号生产包。",
    "该 brief 不代表真实事实，不应被视为正式采访、公告、财报、招股书或新闻报道。",
    "所有公司名、数字、上市信息、市场数据都需要人工核验后，才可以进入正式发布流程。",
    "本内容仅用于 Title-only Demo，不构成投资建议。"
  ].join("\n");
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
