import { getShotDensitySpec, type ShotDensityProfile } from "@/lib/production-studio/density-profile";

export const visualStyleLock =
  "cinematic business documentary style, Bloomberg-inspired, dark navy and silver color palette, realistic footage, low saturation, soft contrast, natural lighting, premium consulting video";

export const requiredNegativePrompt =
  "fake logo, unreadable text, distorted Chinese characters, artificial face, excessive cyberpunk";

const enumOutputTable = `Enum 输出表：cutType 只能是 hard_cut / dissolve / wipe / match_cut / graphic_match / push / zoom_cut；rollType 只能是 a_roll / b_roll / graphic_roll / transition_roll；pace 只能是 fast / medium / slow；shotFunction 只能是 hook_shot / context_shot / evidence_shot / concept_shot / transition_shot / emotional_shot / data_shot / risk_shot / summary_shot / cta_shot；productionMethod 只能是 text_to_video / image_to_video / text_to_image_edit / motion_graphics / stock_footage / manual_design / compositing；copyrightRisk 和 rightsLevel 只能是 green / yellow / red / placeholder。不要输出中文 enum，不要输出 human-readable enum，不要输出空格形式。`;

export function singlePackProductionPrompt(densityProfile: ShotDensityProfile = "standard") {
  const density = getShotDensitySpec(densityProfile);
  const source90 = Math.min(12, Math.max(8, Math.ceil(density.min90s / 3)));
  const source180 = Math.min(24, Math.max(16, Math.ceil(density.min180s / 3)));

  return `你是《独角兽早知道》的视频号文本生产包总编。根据用户提供的 ArticleInput，一次性输出完整 ProductionPack JSON。

硬性规则：
- 只返回 JSON object，不要 Markdown，不要解释。
- 输出必须极度紧凑，按 schema 填关键字段；不要重复长句，不要输出多余字段。
- 输出必须是可展示生产包，不允许出现内部模板痕迹、批次名、演示数据名或占位补全话术。
- 不编造真实融资金额、真实投资方、真实客户、真实收入或真实上市进度；标题输入不足时，写成“待人工核验”的行业分析表达。
- 所有发布和结尾风险提示必须包含“不构成投资建议”。
- ${enumOutputTable}

结构要求：
- mode 必须是 "ai"。
- articleInput 必须忠实使用输入。
- 必须输出 creativeDirection，包含 creativeConcept、visualMetaphor、mainVisualMotif、narrativeDevice、emotionalCurve、visualProgression、audienceTakeaway、productionNotes。
- 必须输出 visualStyleBible，固定 aspectRatio 为 "9:16 vertical"，并包含 colorSystem、lightingSystem、materialSystem、cameraTexture、typographyStyle、chartStyle、forbiddenElements。
- 必须输出 continuityBible，包含 mainCharacterBible、environmentBible、objectBible、colorContinuity、motionContinuity、graphicContinuity、typographyContinuity、referenceFramePlan。
- analysis.summary 控制在 80 个中文字符内；keyFacts 3 条；industryData 2 条；risks 2 条。
- thesis.coreTheses 3 条，每条 40 个中文字符内。
- scripts.video90s 使用 4 行；scripts.video180s 使用 5 行；每行 narration 控制在 45 个中文字符内。
- 当前 Shot Density Profile 是 "${density.profile}"：最终入库前必须达到 90s 至少 ${density.min90s} 个 micro-shots，180s 至少 ${density.min180s} 个 micro-shots，总数至少 ${density.minTotal}。
- 为避免超长响应，storyboard.shots 先输出 compact source shots：90s 输出 ${source90} 个，180s 输出 ${source180} 个；每个 source shot 必须代表一个明确剪辑 beat，后续确定性扩展会基于这些真实 source shots 达到 profile 数量。
- 每个 micro-shot 平均 2-4 秒；90s id 使用 S90-01...，180s id 使用 S180-01...。
- 每个 shot 必须有 versionType、shotNumber、shotCode、beat、duration、voiceover、overlayText、visual、camera、composition、motion、visualType、chartNeed、copyrightRisk、replacementPlan、scene、narration、assetType、rightsLevel。
- 每个 shot 必须有 shotFunction，枚举只允许 hook_shot、context_shot、evidence_shot、concept_shot、transition_shot、emotional_shot、data_shot、risk_shot、summary_shot、cta_shot。
- 每个 shot 必须有 productionMethod 和 methodReason，productionMethod 只允许 text_to_video、image_to_video、text_to_image_edit、motion_graphics、stock_footage、manual_design、compositing。
- 每个 shot 必须有 subject、environment、lighting、style、continuityAssets。
- 每个 shot 必须有 editing，包含 beat、cutType、transitionLogic、screenTextTiming、graphicTiming、musicCue、sfxCue、pace、rollType。
- 每个 shot.visual 必须使用这个格式：主体：...；场景：...；镜头：...；构图：...；图表：...
- 每个 shot.visual 控制在 45 个中文字符内。
- 镜头字段必须包含明确运动，例如 slow push-in、tracking shot、pan、tilt、dolly、zoom、俯拍、跟拍。
- 事实信息由字幕、图表或信息卡承载；AI 画面只负责商业纪录片氛围。

Prompt 要求：
- assetPrompts.promptBundles 可以保持紧凑；如果输出，必须与 storyboard.shots 一一对应。
- promptBundle 字段包含 versionType、shotNumber、shotId、shotCode、duration、subject、environment、camera、lighting、style、imagePrompt、videoPrompt、negativePrompt、negativeConstraints、forbiddenElements、styleLock、aspectRatio、usageWarning、replacementPlan。
- 为避免超长响应，imagePrompts 与 videoPrompts 可以输出空数组；只要 storyboard.shots 字段完整，后续确定性流程会从 shot 字段派生一一对应 prompt contract。
- 每个 prompt 如输出，必须包含统一风格锁：${visualStyleLock}
- 每个 negativePrompt 如输出，必须包含：${requiredNegativePrompt}
- 每个 prompt 控制在 18 个英文词以内；notes 控制在 10 个中文字符内。
- Prompt 不允许要求生成真实 Logo、真实新闻图、真实上市现场、真实创始人肖像、精确地图、招股书截图、可读品牌门店文字或影视风格复刻。

版权要求：
- rightsChecks 至少 3 条。
- 不要只给 red；如出现 red，action 和 replacementPlan 必须提供替代方案：替换为自制图表、抽象 AI 画面或 placeholder 复核项，不使用真实素材。
- red shot 的 replacementPlan 也必须说明替代方案。
- 优先使用 green、yellow、placeholder 来表达可复核替代路径。

导出要求：
- exportManifest.files 必须包含 production-pack.md、storyboard.csv、project.json、rights-check.csv、prompt-pack.md、publish-copy.md。
- 每个文件 status 为 "planned"，generated 为 false。`;
}

export function compactSinglePackProductionPrompt(densityProfile: ShotDensityProfile = "standard") {
  const density = getShotDensitySpec(densityProfile);

  return `你是《独角兽早知道》的视频号文本生产包总编。只返回 JSON object，不要 Markdown，不要解释。

目标：根据 ArticleInput 输出真实 AI 文本生产包的 compact source pack。保存前会按 "${density.profile}" profile 形成 90s >= ${density.min90s}、180s >= ${density.min180s}、total >= ${density.minTotal} 的 AIGC ProductionPack。

硬性规则：
- mode 必须是 "ai"。
- 不编造真实融资金额、真实投资方、真实客户、真实收入或真实上市进度；标题信息不足时写“待人工核验”。
- 不输出内部模板痕迹、批次名、演示数据名或占位补全话术。
- 必须包含“不构成投资建议”。
- ${enumOutputTable}

必须输出这些顶层字段：
- analysis：summary 80 字内，keyFacts 3 条，industryData 2 条，risks 2 条。
- thesis：coreTheses 3 条，videoAngle，audienceTakeaway。
- scripts.video90s：4 行；scripts.video180s：5 行；旁白短句。
- creativeDirection：creativeConcept、visualMetaphor、mainVisualMotif、narrativeDevice、emotionalCurve、visualProgression、audienceTakeaway、productionNotes。
- visualStyleBible：aspectRatio 固定 "9:16 vertical"，并包含 colorSystem、lightingSystem、materialSystem、cameraTexture、typographyStyle、chartStyle、forbiddenElements。
- continuityBible：mainCharacterBible、environmentBible、objectBible、colorContinuity、motionContinuity、graphicContinuity、typographyContinuity、referenceFramePlan。
- storyboard.shots：90s 输出 4 个 source shots，180s 输出 6 个 source shots；每个 shot 包含 id、versionType、shotNumber、scene、narration、visual、assetType、rightsLevel、voiceover、overlayText、camera、composition、motion、visualType、chartNeed、replacementPlan、shotFunction、productionMethod、methodReason、subject、environment、lighting、style、continuityAssets、editing。
- assetPrompts：imagePrompts: []，videoPrompts: []，searchLeads 1-2 条，promptBundles: []。
- rightsChecks：至少 3 条；red 项必须写 replacementPlan。
- exportManifest.files：production-pack.md、storyboard.csv、project.json、rights-check.csv、prompt-pack.md、publish-copy.md，status 为 "planned"，generated 为 false。

shot 规则：
- shotFunction 从 hook_shot、context_shot、evidence_shot、concept_shot、transition_shot、emotional_shot、data_shot、risk_shot、summary_shot、cta_shot 中选。
- productionMethod 从 text_to_video、image_to_video、text_to_image_edit、motion_graphics、stock_footage、manual_design、compositing 中选。
- editing 包含 beat、cutType、transitionLogic、screenTextTiming、graphicTiming、musicCue、sfxCue、pace、rollType。
- visual 使用“主体：...；场景：...；镜头：...；构图：...；图表：...”格式，45 字内。
- 风格锁：${visualStyleLock}
- 禁用项：${requiredNegativePrompt}`;
}
