# 仓库知识与 As-Is：OpenWiki 及替代工具复用调查

[总览与下一步](../../README.md) · 研究依据 · 能力核验不等于已入围或采用 · [研究索引](../README.md)

**当前决定：用户已测试 OpenWiki 并确认符合预期，后续知识维护按 OpenWiki 推进。** 下文保留此前来源调查与候选比较；“未测试/待入围”指当时研究状态，当前选择以[用户反馈](#user-tool-decision)和[工具选型页](../../docs/tools/existing-tools-reuse-plan.md)为准。

核验日期：2026-09-15。本文按用户举例，将 OpenWiki 理解为 [langchain-ai/openwiki](https://github.com/langchain-ai/openwiki)。范围为仓库内可验证现状；依据官方仓库、文档及部分实现源码，未安装、生成 Wiki 或进行效果评测。采用顺序是本项目判断。

本次重新读取的 `main` 仍为 `fd8794bc43f4583ba54cbf8d3ca883c37447dbfa`（提交时间 2026-09-15 00:26:35 UTC），与前次基线相同；下面新增的是对行为语义与流程边界的核验，没有发现需要切换读取版本的变化。[固定提交](https://github.com/langchain-ai/openwiki/commit/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa)

## 1. 结论

**OpenWiki 是 As-Is 知识页与来源维护的候选；Codegraph 是用户已有的源码检索和影响调查基线。** 两者可以形成待比较的组合，但尚未确定采用。需按统一需求比较其他知识工具与现有调查方式；没有核验到二者开箱即用的专用集成。

**若采用 OpenWiki，可以把知识页生成、来源关联、变化检测和逐页恢复交给它，不需要再实现一套同类维护系统。** 它的调查指令本身已经要求业务行为、端到端流程、状态生命周期、异常和测试，符合 As-Is 的主要内容方向；实际是否足以支持某个项目的 Spec/Plan，仍需真实案例验证。

本方法只保留薄约定：页要回答“当前行为与边界、如何工作、约束/异常/未知、来源与验证入口”；Spec/Plan 按本次问题选择并核验关键依据；知识使用前和实现后按影响维护。原八类内容作为调查提示，不再要求每页八章、逐项 N/A、人工 Claim 编号或第二套元数据。

## 2. OpenWiki 能直接承接什么

| 已核验能力 | 实现依据 | 本项目用途与边界 |
| --- | --- | --- |
| 仓库内 Markdown Wiki、初始化及更新 | [固定 README](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/README.md) | `code` 模式在 `openwiki/` 维护知识；初次 `--init`，后续 `--update`。重复 init 会重建既有生成页与 Claims，不应作为普通更新入口 |
| 用户维护的调查要求 | [INSTRUCTIONS 示例](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/openwiki/INSTRUCTIONS.md)、[文件维护规则](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/README.md#how-it-stays-yours) | 在 `openwiki/INSTRUCTIONS.md` 写近期重点、四个内容问题、证据区分和已知缺口。它是用户维护的输入指引，正常运行不重写；是否实际满足仍要抽查 |
| 围绕行为和流程组织语义知识 | [规划与页面提示](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/agent/repository-prompts.ts)、[Claims 内容标准](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/claims/guidance.ts) | 内置要求按系统、运行领域和跨系统流程组织，追踪调用、数据、异常、配置与测试；Claim 可跨组件引用，不鼓励符号清单。因此无须另造“行为 As-Is 生成器”，但提示要求不等于实际语义完整 |
| 结论与版本化证据关联 | [RepositoryEvidenceResolver](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/claims/evidence/repository/resolver.ts) | `repo://` 定位文件或行范围，读取当前文件内容并计算 SHA-256；行范围使用上下文锚点辅助重定位。Claims 侧文件和页面一起保存 |
| 已引用证据变化检测 | [Claims preflight](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/claims/brains/code/preflight.ts) | 对持久化 Claim 的来源逐一解析，区分 stale 与 unresolved；这是来源状态检查，不能证明自然语言结论成立 |
| 实际源文件状态检查 | [状态及变化窗口实现](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/agent/utils.ts) | 来源指纹包含 HEAD、纳入范围的已跟踪/未跟踪文件、工作区内容和 Git 状态；变化窗口包括本地变化。不能把此指纹当成任意暂存快照的内容证明或跨仓库完整快照 |
| 可恢复的逐页更新 | [运行核心](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/generation/repository-run.ts)、[运行说明](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/openwiki/workflows/repository-generation.md) | 持久队列、逐页完成边界及来源变化处理可以复用；最终出现 `sourceChanged` 或未完成页时仍有复核工作 |
| 宿主驱动的 MCP 生命周期 | [协议定义](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/integrations/core/protocol.ts) | 可由已有 coding Agent 调查和写页，OpenWiki 管理 begin/submit_plan/next_page/submit_page/finish 等流程；协议中的 plan 是 Wiki 页面安排，不是业务 `plan.md` |

运行接入还有两点需要明确：它会维护根目录 AGENTS.md/CLAUDE.md 的 OPENWIKI 管理区块；应保留其他内容，项目接入时核对与现有入口的关系。当前源码 package.json 为 0.5.2、Node.js 要求为 >=22.22.0，这只标识读取基线，不表示所有候选能力均已在安装目标的发布版验证。[README](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/README.md)、[package.json](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/package.json)

## 3. 不能由 OpenWiki 自动保证的事

1. **证据支持结论。** 指纹和引用检查确认来源的位置与变化；仍需阅读源码判断前置条件、异常分支和边界。页面 `verified` 表示其工具流程所完成的校验，不能直接映射为全部现状正确或测试通过；引用测试源文件也不代表执行过该测试。[Claims 机制](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/openwiki/concepts/grounded-claims.md)
2. **事实依赖完整。** 已引用代码不变，新的调用方、配置或注册仍可能改变结论。工具会提供变更路径和跨页一致性调查要求，但问题未命中的既有 Claims 默认保留；不能把自动保留理解为 Agent 已重新阅读过其完整语义。必要时用直接检索或已有 Codegraph 补充影响调查，无需自建另一套事实依赖图。[规划提示](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/agent/repository-prompts.ts)、[保留与复核规则](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/claims/guidance.ts)
3. **ADR 已实现。** 仓库中的 accepted ADR 证明采用决定；代码/本地结果才能证明实现。Spec、Plan 必须直接读取适用 ADR，不能只读 Wiki 的转述。
4. **对当前 Spec/Plan 已经够用。** 工具支持所需语义方向，但无法仅凭“Wiki 已生成”确认本次业务流程、关键例外和验证入口都已解释到位。以真实开发问题抽查：能否找到现状、作出有依据的 Design、确定修改和检查位置。缺口按需调查，在原页补充值得长期复用的结论；本次专用分析留在 Spec/Plan。
5. **生产状态或跨仓库事实完整。** 首轮只采用 code 模式的仓库证据。当前 resolver 以单个仓库根为界，多仓库仍需项目入口和仓库标识映射；不把 repo 文档当成线上实况。
6. **持续维护已自动发生。** CLI `--update` 或宿主 MCP 更新须被调用；定时 CI 是另外配置的入口。当前本地流程在知识使用前和实现后按需触发，不需要每次读页全量重建，也不在 Git hooks 内运行 LLM。工具报告中断、未完成或来源变化时，保留该限制，不能报告全库已经最新。[使用与更新入口](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/README.md#quick-start)、[结束时来源变化处理](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/src/generation/repository-run.ts)

以上是从已读机制与本项目需求得出的边界判断，不是声称生态不存在相关扩展。

## 4. 替代与补充候选

| 工具 | 已核验用途 | 建议位置 |
| --- | --- | --- |
| [FSoft-AI4Code/CodeWiki](https://github.com/FSoft-AI4Code/CodeWiki/blob/9ed15bad90170bb4db6b708210e7bc90a130a953/README.md) | 多语言仓库分层文档、依赖关系；自定义输出/关注范围；`generate --update`、`--compare-to`；MCP 接入 | **Wiki 候选**。与 OpenWiki 等比较语义质量、增量范围、成本和引用；原生更新命令存在，不应误写成只能全量重建 |
| [AsyncFuncAI/deepwiki-open](https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/README.md) | 当前英文入口称 DeepWiki-Open / Grok-Wiki，侧重交互 Wiki、图示和代码导览，指向 2.0 产品 | **知识门户候选**。本轮未核验其当前版本满足本地权威 Markdown 与 Claim 维护；旧中文说明/搜索缓存不直接当作最新产品能力 |
| [OpenBMB/RepoAgent](https://github.com/OpenBMB/RepoAgent/blob/825d988127d7bfd757237d9c4e8678d9104030f0/README.md) | 仓库代码文档、差异识别与更新；README 当前说明 Python 支持 | **Python 代码文档备选**。官方示例把生成放入 pre-commit，与本方法的 hook 分工有差异；若采用应另设显式更新入口 |
| [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/README.md) | 代码符号、调用、依赖的索引与查询，提供调查和影响线索 | **保留已有工具**。辅助查到原文，不承担 Topic 语义、ADR 或 Task 权威；详见[既有定位研究](../code-intelligence/codegraph-as-is-role.md) |
| [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/README.md) | 代码/SQL/文档关系图，部分代码设计原因与 ADR 引用；图查询、报告与社区 Wiki 导出 | **混合材料调查候选**。尚未确定入围；Wiki 导出不直接等价于结论及来源复核。分层更新与 frontmatter 缓存边界见[专项研究](../code-intelligence/graphify-assessment.md) |
| [Serena](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/README.md) | MCP 符号级检索、引用查找和编辑；LSP 或 JetBrains 后端；记忆文件 | **按缺口补充**。仅在已有宿主/Codegraph 的语义导航或编辑不足时引入；不再复制一份 Wiki/ADR 记忆权威 |
| [Repomix](https://github.com/yamadashy/repomix/blob/6c5ead0d2b83911d4284be9f3424e7381ae44763/README.md) | 按文件选择、include/ignore 将代码打包成 AI 可读上下文；CLI/MCP，支持压缩 | **按需导出工具**。用于离线交接或范围明确的上下文材料；压缩可能省略实现细节，关键判断仍读取原始源码；不默认把全仓塞给每个阶段 |

CodeWiki 有多个同名项目，本表只评估 FSoft-AI4Code 版本。DeepWiki-Open 也不等同于 Cognition 的托管 DeepWiki；不能跨项目借用能力或许可结论。

## 5. 项目落点与首轮试点

若采用 OpenWiki，项目入口将 `openwiki/index.md`、`openwiki/quickstart.md` 及相关知识页映射为 As-Is 的实际位置，**不再向 `docs/knowledge/topics/` 复制同一正文**。ADR 继续放在现有 ADR 位置；变更材料和实际验证记录继续由 Intent/Spec/Plan/evidence 管理。工具原生维护 Claims、页面来源、生成/核验元数据和队列；不再手工填写另一份 Claim 表、来源指纹、覆盖状态机或下游追踪图。Spec/Plan 只记录实际采用的页/原文引用和重要未解决项。

统一筛选并形成入围候选后，先用同一真实仓库的一个近期需求及其相关流程验证初始化→Spec/Plan 读取→实现→知识更新；不以全仓内容齐全或固定主题数作为开始条件。工具原生 init 包含 quickstart 和页面规划，实际生成规模与缩小范围的有效性也需记录。必要时再增加横切机制，判断能否复用。候选使用相同内容标准，与现有调查方式对照；入围前不预定 OpenWiki 或 CodeWiki 的试用顺序。

| 情景 | 试点应验证的结果 |
| --- | --- |
| 首次生成与下游使用 | 四个问题足以回答当前需求；Spec 能理解现状与边界，Plan 能找到修改/验证入口；关键结论回到源码，未知和文档声明不冒充代码事实 |
| 普通本地修改及新文件 | 无需先 commit 即可识别相关来源变化；更新涉及主题；未涉及主题不无故重写 |
| 引用行移动、删除、重命名 | 正确重定位或要求复核；不把原 Claim 静默当成有效 |
| 只改配置或新增调用方 | 检查未直接修改的相关结论；评估图查询能否补充更新候选 |
| 新 ADR 尚未实现 | 同时保留“已采用决定”与“当前代码事实”，Spec/Plan 仍直读 ADR |
| 中断及运行期间改源码 | 恢复识别来源变化；未完成或漂移状态不得被报告为全部最新 |
| 人工补充与管理区块 | 用户 brief 和无关 Agent 指引保留；必要正文改动可审查；重跑 update 不变相 init |

记录抽查正确率、遗漏种类、额外修改量、耗时、实际模型用量和适配代码量。当前没有这些实测数字，不预估节省比例。

## 6. 固定读取基线与许可

下列 LICENSE 均从对应提交读取。仅表示仓库所声明的许可；实际发布包及依赖随选定版本再次核对。

| 工具 | 固定提交 | LICENSE |
| --- | --- | --- |
| OpenWiki | `fd8794bc43f4583ba54cbf8d3ca883c37447dbfa` | [MIT](https://github.com/langchain-ai/openwiki/blob/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa/LICENSE) |
| FSoft-AI4Code/CodeWiki | `9ed15bad90170bb4db6b708210e7bc90a130a953` | [MIT](https://github.com/FSoft-AI4Code/CodeWiki/blob/9ed15bad90170bb4db6b708210e7bc90a130a953/LICENSE) |
| DeepWiki-Open | `d92819a9c9f3b99416e3580ff235fc9d3adf8b89` | [MIT](https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/LICENSE) |
| RepoAgent | `825d988127d7bfd757237d9c4e8678d9104030f0` | [Apache-2.0](https://github.com/OpenBMB/RepoAgent/blob/825d988127d7bfd757237d9c4e8678d9104030f0/LICENSE) |
| Codegraph | `58c07e8745dbba64c748fbcd8497c0c946e270d6` | [MIT](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/LICENSE) |
| Graphify | `fe66389083369c3159aa391117185c8f58b4d07c` | [Apache-2.0](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/LICENSE)；[NOTICE](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/NOTICE) 保留历史 MIT 部分条款 |
| Serena | `18fa47bfccd9c27d05910a0ea12918276f1a6521` | [当前应用 GPL-3.0-or-later；SolidLSP 组件 MIT](https://github.com/oraios/serena/blob/18fa47bfccd9c27d05910a0ea12918276f1a6521/LICENSE)，不能沿用旧版整体 MIT 印象 |
| Repomix | `6c5ead0d2b83911d4284be9f3424e7381ae44763` | [MIT](https://github.com/yamadashy/repomix/blob/6c5ead0d2b83911d4284be9f3424e7381ae44763/LICENSE) |

Serena 补充核验：上表固定的是开发 HEAD；核验时最新发行版 v1.7.0 仍为 MIT，不能把开发版新能力与发行版旧许可合并使用。版本区别与代码索引候选详见[专项横评](../code-intelligence/codegraph-tools-comparison.md)及[语义导航研究](../code-intelligence/codegraph-alternatives-semantic.md)。

<a id="a1-comparison"></a>

## 7. A1：统一比较与首轮 As-Is 同题名单

**核验日期：2026-09-16。本节最初建议 OpenWiki 宿主 MCP、CodeWiki 细粒度 MCP 均入围；随后经[发布可用性复核](#codewiki-release-check)，FSoft-AI4Code/CodeWiki 收紧为源码条件候选，先验证安装与 MCP 最小运行。** OpenWiki 与现有宿主直接调查仍为首轮对照；RepoAgent、DeepWiki-Open 后置。以下源码比较保留，涉及 CodeWiki 的试验安排以第 8 节前置条件为准。未安装、运行候选或生成项目 Wiki，没有本项目质量、耗时、token 或人工修正数据。

比较对象固定为“现有宿主＋可选的一个知识工具”。基线允许既有 Codegraph、普通搜索和原文读取；两种 Wiki 分开试验，不同时建立两份 As-Is 权威。首轮先判断事实、边界、异常、来源及 Spec/Plan 可用性，再比较完整人工审核后的效率，沿用[路线图质量规则](../../docs/roadmap/action-roadmap.md#1-起点与推进规则)。

### 7.1 本轮版本、许可与成熟度证据

以下是 GitHub 默认分支核验时固定的源码提交及仓库许可，不把包内版本号当成已验证发行包，也不由最近一次提交推断维护承诺。

| 对象 | 2026-09-16 固定读取点 | 许可、版本及维护信号 |
| --- | --- | --- |
| OpenWiki | [`799938757fe54fc895a0c535dd6a3ac9c22fc605`](https://github.com/langchain-ai/openwiki/commit/799938757fe54fc895a0c535dd6a3ac9c22fc605)，提交时间 2026-09-15 19:22:11 UTC | [MIT][a1-ow-license]；[package.json][a1-ow-package] 仍为 0.5.2。相对历史基线新增的一个提交仅改 `openwiki/` 文档及元数据，已有实现判断可复用。[提交差异][a1-ow-diff] |
| FSoft-AI4Code/CodeWiki | [`a08926662eb141322203dac7b73b4839cdf783ba`](https://github.com/FSoft-AI4Code/CodeWiki/commit/a08926662eb141322203dac7b73b4839cdf783ba)，提交时间 2026-09-16 03:04:05 UTC | [MIT][a1-cw-license]；[pyproject.toml][a1-cw-package] 为 1.0.1，分类仍标 Beta。历史基线之后有 7 个提交，含 MCP 变更检测、解析器和 Mermaid 依赖说明调整，不能把旧版读取结论无差别推广到当前源码。[提交差异][a1-cw-diff] |
| RepoAgent | [`825d988127d7bfd757237d9c4e8678d9104030f0`](https://github.com/OpenBMB/RepoAgent/commit/825d988127d7bfd757237d9c4e8678d9104030f0)，提交时间 2024-12-23 11:46:30 UTC，与历史基线相同 | [Apache-2.0][a1-ra-license]；[pyproject.toml][a1-ra-package] 为 0.2.0。默认分支至本轮核验未前进是维护节奏的证据，不足以断言项目已停止维护 |
| DeepWiki-Open | [`d92819a9c9f3b99416e3580ff235fc9d3adf8b89`](https://github.com/AsyncFuncAI/deepwiki-open/commit/d92819a9c9f3b99416e3580ff235fc9d3adf8b89)，提交时间 2026-09-03 20:29:26 UTC，与历史基线相同 | [MIT][a1-dw-license]；[前端包][a1-dw-package]为 0.1.0，[后端包][a1-dw-backend]为 1.0.0；[英文 README][a1-dw-readme]指向 2.0/Grok Wiki 产品。此处只评估该仓库源码，不借用另一个产品的能力或许可 |
| 现有宿主直接调查 | 以 A2 记录的实际宿主、模型、已有 Codegraph 版本及同一源码/工作区为准 | 本路线不新增知识工具许可或运行时；宿主与既有工具仍按实际版本条款使用。尚未选定试点配置，不能预填版本、质量或成本数字 |

### 7.2 会改变入围判断的机制差异

**下表“源码事实”只说明入口与实现；“本项目判断”是推断，不代表已测效果。**

| 比较项 | OpenWiki：源码事实 | CodeWiki：源码事实 | 本项目判断与关键未知 |
| --- | --- | --- | --- |
| 现有宿主能否直接参与 | coding-agent MCP 将调查、规划和写页交给宿主，OpenWiki 管理持久流程；该入口使用宿主模型会话，无须另外配置 OpenWiki provider 凭据。[README][a1-ow-readme] | 细粒度 MCP 提供 `analyze_repo`、组件读取、模块树、写页/编辑工具，由 IDE Agent 写内容；分析配置使用 `not-needed`/`unused`，与需要独立 LLM 配置的 legacy `generate_docs` 分开。[server.py][a1-cw-server]、[analysis.py][a1-cw-analysis] | 两者都可复用现有宿主，不能按“OpenWiki 可复用会话、CodeWiki 必须另买 API”排序。首轮分别固定这两条 MCP 路径，CLI/legacy 不混作同一配置 |
| 本地文件与来源维护 | 页为仓库内 Markdown，Claims 侧文件保存事实及来源版本；resolver 解析文件/行范围和内容摘要，preflight 重新检查持久化证据。[README][a1-ow-readme]、[resolver][a1-ow-resolver]、[preflight][a1-ow-preflight] | 原生输出含 Markdown、`module_tree.json`、`metadata.json`；分析把组件索引和源码快照写入 `.codewiki/sessions/`，组件读取用本次分析缓存的 `node.source_code`，供宿主读文件。[输出约定][a1-cw-readme]、[workspace.py][a1-cw-workspace]、[code_reader.py][a1-cw-reader] | CodeWiki 的文件和组件关联可供审查，但已读路径未证明具备 OpenWiki 同等的逐条 Claim 来源版本校验。OpenWiki 的摘要也只证明引用变化，不能证明结论正确或依赖完整；两者都要回到原始源码抽查 |
| 未提交修改与新增文件 | 来源快照纳入已跟踪、未跟踪文件及工作区内容；变化窗口另含暂存/未暂存路径，未提交变化不会仅因 HEAD 相同而全部跳过。[utils.ts][a1-ow-utils] | **必须区分入口：** CLI `generate --update`/`--compare-to` 比较存储 commit 与 HEAD，二者相同时直接返回无变化；细粒度 MCP `_detect_via_git` 另查 staged、unstaged 和 untracked，排除生成目录。Git 基线不可用时可回落到文件 mtime 检查。[generate.py][a1-cw-generate]、[analysis.py][a1-cw-analysis] | CodeWiki CLI 不符合本地未提交收尾的默认路径，但不能据此排除其 MCP。mtime 路径按时间和限定后缀扫描，不能当成内容指纹；触发回落时须直查删除、重命名及配置变化，不能直接接受“最新” |
| 更新的受影响范围 | Claims preflight 找出已引用证据的 stale/unresolved；宿主还收到变化上下文并参与页面规划。[preflight][a1-ow-preflight]、[运行核心][a1-ow-run] | MCP 按旧 `module_tree` 的组件文件匹配变化路径，再加入父模块与 overview；并重新构建本次依赖图。[analysis.py][a1-cw-analysis] | 二者都不能仅凭该机制证明新调用方/新配置对旧结论的影响已覆盖。CodeWiki 的 `changed_files` 非空但旧模块映射未命中时尤其需复核；不得把模块父子传播解释为已遍历所有调用影响 |
| 中断与运行时来源漂移 | `.run.json`、逐页持久状态及恢复时来源指纹比较存在；页面与 Claims 达到持久边界后推进队列。[运行核心][a1-ow-run] | MCP session 主要存在进程内存，闲置 2 小时过期；工作文件存在不等于会话可恢复。`close_session` 在至少写过一次文档时记录分析时 commit，未见此路径要求全部计划页完成；之后清理 session 工作目录。[session.py][a1-cw-session]、[server.py][a1-cw-server] | OpenWiki 在来源复核及恢复上有直接可测机制优势；CodeWiki 应测试重新分析、部分完成和源文件中途变化，不能把 close 或 metadata 更新直接当成整份文档完成。实际恢复成本仍未知 |
| 配置、文档和业务流程 | 上文已固定核验的规划/写页指令要求跨组件行为、状态、异常、配置和测试；本轮实现未改变。[提交差异][a1-ow-diff] | 当前 Config 默认纳入构建、CI、容器、清单、配置等 artifact；README/docs 的 prose 输入默认关闭，CLI 有 `--with-prose`；细粒度 MCP 的已读 analyze 参数没有该开关。[Config][a1-cw-config]、[generate.py][a1-cw-generate]、[analysis.py][a1-cw-analysis] | 不把 CodeWiki 描述为仅能读函数，也不因图中有配置就认定业务异常与约束齐全。MCP 试验中宿主须按同一调查要求直读适用 ADR、业务材料和关键原文；这不应再生成第二套决定权威 |
| 运行依赖与持续维护 | Node >=22.22.0；包依赖含 LangChain/DeepAgents、MCP、SQLite checkpoint 等，宿主方式没有免除包依赖。[package.json][a1-ow-package] | Python >=3.12；包依赖含 Tree-sitter 多语言解析器、MCP、模型客户端及指向 Git 分支的 `coding-agent-wrapper`，并声明安装期 Node/npm 需求。[pyproject.toml][a1-cw-package] | 两者都要固定源码/安装版本并核对依赖锁定。CodeWiki 的 MCP 无须独立 LLM 配置，不等于轻量无依赖；分支依赖还需记录实际解析提交。是否比现有宿主更省总维护成本尚无实测 |
| 图表校验的额外条件 | Mermaid/jsdom 为可选 peer dependencies；README 区分内置轻量检查与可选解析器校验。[package.json][a1-ow-package]、[README][a1-ow-readme] | Python >=3.12 时当前实现跳过 PythonMonkey 路径，默认 `mermaid-py` 校验会向渲染服务发图表内容；源码说明默认为 mermaid.ink，可通过 `MERMAID_INK_SERVER` 指定服务，`MERMAID_VALIDATE=0` 可禁用。超时后也会跳过后续校验。[utils.py][a1-cw-utils] | 这是实质运行依赖，不预设本地运行等于完全离线。A2 应记录图表校验实际配置；若关闭或跳过，要用独立检查/人工审查覆盖，不能将“未报错”登记为语法校验通过 |

### 7.3 同口径入围判断、成本与退出

本表的成本与排序均为本项目推断；来源事实见上表及本行链接。**不以某仓库自带示例、论文/benchmark 分数或本次源码阅读替代目标项目质量证据。**

| 路线 | 首轮处理与同口径理由 | 适配/维护负担与退出方式 | 最关键未知项 |
| --- | --- | --- | --- |
| 现有宿主＋普通文件读取＋既有 Codegraph | **沿用并作为必测对照。** 不需要先生成全仓 Wiki 就可调查当前主题；新增工具必须证明对判断正确性、遗漏或可维护性有收益 | 新增集成最少；人工/Agent 按影响维护既有 As-Is 原文，投入计入对照。退出新增试验后继续用原路径，不需迁移运行状态 | 真实主题中的遗漏、跨次重查、人工修正与维护负担是否足以支持新增知识工具 |
| OpenWiki 宿主 MCP | **入围待测。** 与本地现状、引用变化复核和中断接续有直接对应机制；首轮价值假设为可审查的持续来源维护 | 增加 Node/MCP 接入、调查说明、Claims 与队列的版本维护和审查；入口映射原生 `openwiki/`，不复制 Topic。退出保留 Markdown 和历史来源，取消 MCP/入口管理区块后由原流程维护；专有 Claim/队列语义不保证迁移到下一工具。[文件归属/卸载入口][a1-ow-readme] | Claims 是否完整支持行为判断；间接影响是否遗漏；实际页面规划规模、人工修改保持及恢复是否可靠 |
| CodeWiki 细粒度 MCP | **入围待测，与 OpenWiki 分开同题。** 结构化依赖分析、模块组织及本地变化检测提供另一条有实质差异的路径，未被本地文件要求排除 | 增加 Python/解析器/MCP 与图表依赖维护；宿主补充原文阅读、完整性和更新判断。显式指定试验输出目录，避免默认 `docs/` 与现有文档混写；退出保留 Markdown/必要来源引用，移除 MCP 配置，session/模块图作可重建材料。[MCP 入口][a1-cw-server]、[输出目录][a1-cw-analysis] | 模块图能否改善跨模块语义质量而不遗漏业务/配置；新增调用方、部分完成和会话重启是否增加人工负担；是否值得承担解析器依赖 |
| RepoAgent | **本轮后置，Python 文档专项再考虑。** 官方当前仅支持 Python；README 存在显式 `run`，并非必须安装 hook，但默认维护示例围绕 pre-commit；已读增量检测入口筛选暂存 Python 文件。[README][a1-ra-readme]、[change_detector.py][a1-ra-change] | Python >=3.11,<4.0、模型配置及自身层级数据；本项目还需核定显式调用时的暂存区副作用和任意本地修改覆盖。可保留生成 Markdown，移除工具/hook；若进入试验，应按实际版本检查这些退出动作。[包声明][a1-ra-package]、[README][a1-ra-readme] | 目标项目尚未限定纯 Python，当前没有相对前两者的必需覆盖优势；维护节奏和工作区语义仍待核验，不值得首轮同时承担 |
| DeepWiki-Open | **本轮后置，交互门户需求出现时复评。** 当前源码接受本地仓库路径，也有 Markdown/JSON 导出，不能写成“只能远程、不能导出”；但缓存/门户为中心的路径尚未证明能维护唯一仓库内 As-Is 及逐条来源变化。[repository.py][a1-dw-repo]、[缓存与导出][a1-dw-io] | 需维护 Next/React 前端和 Python/FastAPI、检索/向量等后端依赖；退出可导出正文，但缓存/页面关联向仓库原文持续维护的接续尚未验证。[前端包][a1-dw-package]、[后端包][a1-dw-backend] | 加入服务、索引和导出环节是否改善本地首版质量；来源漂移/人工编辑保持与当前 2.0 产品的边界未知，门户不是首版必需能力 |

两者入围不代表需同时安装、同时采用或各自全量生成整个仓库。A2 固定相同源码、工作区、调查问题、宿主模型及原文访问条件；按各工具原生入口记录实际生成范围，不能为了表面公平假定都支持单页 init。配置或人工补充会改变结果时，把它们算作候选完整流程的一部分。

### 7.4 首轮待测问题与判据

| 同一案例 | 质量判据及记录内容 |
| --- | --- |
| 一个真实业务流程及异常/配置分支 | 盲抽关键结论回源码；正常路径、失败路径、关键约束与验证入口能支撑同一 Spec/Plan；明确未读/未知，不把文档声明或 accepted ADR 当成代码实现 |
| HEAD 不变，分别产生暂存修改、未暂存修改、未跟踪新文件 | 两条入围 MCP 路径与基线均读取最终工作区；准确指出需要复核的页/结论，不把“commit 没变”解释为知识最新。CodeWiki CLI 仅登记上述源码边界，不混入合格 MCP 结果 |
| 仅加调用方/配置，或删除、重命名、移动引用行 | 除直接变化文件外，检查旧结论是否仍成立；没有工具命中时由同一调查要求补查并计入人工投入，记录漏检而不只记录成功发现的项 |
| 生成中改源码、写一部分后中断/关闭、重启接续 | 不报告未完成页或旧来源为完成；检查哪些页可复用、哪些需重查，以及是否保留人工补充。CodeWiki 重点查 session 丢失/close 后 metadata，OpenWiki 重点查 sourceChanged 与逐页队列 |
| 人工修订一页后再更新，并形成下游 Spec/Plan | 有效人工解释保留或被显式复核；最终一个正文位置，ADR 仍读原文；新增 metadata 不充当业务 Plan、测试结果或工程接受 |

先记录错误/遗漏、证据可追溯性、下游可实施性与人工审核结果；达到相同质量门槛后再比较总耗时、模型用量、人工投入、文档改动量和适配工作。若 Wiki 没有改善质量或维护负担，允许最终沿用直接调查；不为证明新增工具必要而另造一套知识权威。

### 7.5 对总选型页的回写提示

与本轮读取的[总选型页](../../docs/tools/existing-tools-reuse-plan.md)不存在“已采用”层面的冲突：原文仍明确候选未定，本节只推进 A1 名单。需要同步的差异有三项：

1. “尚未完成统一入围”应在总比较完成后改成具体入围状态；不能继续只有 OpenWiki 适配示例而让读者误认为已优先采用。知识层建议为两条 MCP 路径加现状对照。
2. CodeWiki 的更新能力必须按 **CLI 与细粒度 MCP** 分开写；“原生有 update”不足以说明工作区覆盖，“只能按 commit”又会错误排除 MCP。当前固定版本和依赖条件应引用本节。
3. DeepWiki-Open 的后置理由应为本地权威维护链和额外服务未证实必要，不应写成不支持本地路径或无 Markdown 导出。上文历史表说的是“未核验满足本地权威 Markdown 与 Claim 维护”，本节补充后这一边界仍成立。

[a1-ow-license]: https://github.com/langchain-ai/openwiki/blob/799938757fe54fc895a0c535dd6a3ac9c22fc605/LICENSE
[a1-ow-package]: https://github.com/langchain-ai/openwiki/blob/799938757fe54fc895a0c535dd6a3ac9c22fc605/package.json
[a1-ow-diff]: https://github.com/langchain-ai/openwiki/compare/fd8794bc43f4583ba54cbf8d3ca883c37447dbfa...799938757fe54fc895a0c535dd6a3ac9c22fc605
[a1-ow-readme]: https://github.com/langchain-ai/openwiki/blob/799938757fe54fc895a0c535dd6a3ac9c22fc605/README.md
[a1-ow-resolver]: https://github.com/langchain-ai/openwiki/blob/799938757fe54fc895a0c535dd6a3ac9c22fc605/src/claims/evidence/repository/resolver.ts
[a1-ow-preflight]: https://github.com/langchain-ai/openwiki/blob/799938757fe54fc895a0c535dd6a3ac9c22fc605/src/claims/brains/code/preflight.ts
[a1-ow-utils]: https://github.com/langchain-ai/openwiki/blob/799938757fe54fc895a0c535dd6a3ac9c22fc605/src/agent/utils.ts
[a1-ow-run]: https://github.com/langchain-ai/openwiki/blob/799938757fe54fc895a0c535dd6a3ac9c22fc605/src/generation/repository-run.ts
[a1-cw-license]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/LICENSE
[a1-cw-package]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/pyproject.toml
[a1-cw-diff]: https://github.com/FSoft-AI4Code/CodeWiki/compare/9ed15bad90170bb4db6b708210e7bc90a130a953...a08926662eb141322203dac7b73b4839cdf783ba
[a1-cw-readme]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/README.md
[a1-cw-server]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/codewiki/mcp/server.py
[a1-cw-analysis]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/codewiki/mcp/tools/analysis.py
[a1-cw-workspace]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/codewiki/mcp/workspace.py
[a1-cw-reader]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/codewiki/mcp/tools/code_reader.py
[a1-cw-generate]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/codewiki/cli/commands/generate.py
[a1-cw-session]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/codewiki/mcp/session.py
[a1-cw-config]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/codewiki/src/config.py
[a1-cw-utils]: https://github.com/FSoft-AI4Code/CodeWiki/blob/a08926662eb141322203dac7b73b4839cdf783ba/codewiki/src/be/utils.py
[a1-ra-license]: https://github.com/OpenBMB/RepoAgent/blob/825d988127d7bfd757237d9c4e8678d9104030f0/LICENSE
[a1-ra-package]: https://github.com/OpenBMB/RepoAgent/blob/825d988127d7bfd757237d9c4e8678d9104030f0/pyproject.toml
[a1-ra-readme]: https://github.com/OpenBMB/RepoAgent/blob/825d988127d7bfd757237d9c4e8678d9104030f0/README.md
[a1-ra-change]: https://github.com/OpenBMB/RepoAgent/blob/825d988127d7bfd757237d9c4e8678d9104030f0/repo_agent/change_detector.py
[a1-dw-license]: https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/LICENSE
[a1-dw-package]: https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/package.json
[a1-dw-backend]: https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/api/pyproject.toml
[a1-dw-readme]: https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/README.md
[a1-dw-repo]: https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/api/repository.py
[a1-dw-io]: https://github.com/AsyncFuncAI/deepwiki-open/blob/d92819a9c9f3b99416e3580ff235fc9d3adf8b89/api/services/wiki/io.py

<a id="codewiki-release-check"></a>

## 8. CodeWiki 发布可用性复核

**2026-09-16 补充纠正：第 7 节确认的是 FSoft-AI4Code/CodeWiki 的源码机制，尚不足以把它登记为已有可用发行版。其状态收紧为“条件候选（源码试验）”。** 这不表示源码不能运行；本轮仍未安装、构建或启动 MCP。

- **GitHub 发布事实：** 本轮公开 [Releases API](https://api.github.com/repos/FSoft-AI4Code/CodeWiki/releases?per_page=100) 与 [Tags API](https://api.github.com/repos/FSoft-AI4Code/CodeWiki/tags?per_page=100) 均只返回 `assets`；该 [release](https://github.com/FSoft-AI4Code/CodeWiki/releases/tag/assets) 发布于 2025-11-23，上传附件为演示 GIF，未发现版本化软件 release/tag。不能用它证明 1.0.1 已正式发布。
- **版本与官方安装路径：** 默认分支本轮仍固定在 `a08926662eb141322203dac7b73b4839cdf783ba`；[pyproject.toml][a1-cw-package] 中 `version = "1.0.1"` 是源码包声明，官方 [README][a1-cw-readme] 给的是 `pip install git+https://github.com/FSoft-AI4Code/CodeWiki.git` 源码安装路径。安装说明存在不等于本项目环境安装成功。
- **细粒度 MCP 实际位置：** 固定提交的 [server.py][a1-cw-server] 包含 `analyze_repo`、组件读取、写页/编辑等工具及 `python -m codewiki.mcp.server` 启动示例；[构建包清单][a1-cw-package] 明确列入 `codewiki.mcp` 和 `codewiki.mcp.tools`。这是源码与构建配置存在的证据，尚不是 wheel 内容、依赖可安装或服务可运行的实测证据。
- **PyPI 同名包另属一项项目：** 本轮 [PyPI JSON 元数据](https://pypi.org/pypi/codewiki/json) 的 `codewiki` 最新版本为 0.6.5，主页和仓库链接均指向 [PorunC/CodeWiki](https://github.com/PorunC/CodeWiki)。因此 `pip install codewiki` 不能当作 FSoft-AI4Code 版本的官方安装命令，也不能用这个包的发布记录证明 FSoft 已发布。
- **Google Code Wiki 又是另一项产品：** Google [官方公告](https://developers.googleblog.com/ko/introducing-code-wiki-accelerating-your-code-understanding/)区分面向公开仓库的网页预览与计划中的内部仓库 CLI；[官方扩展入口](https://developers.google.com/profile/badges/community/sdlcagents/gca-agents) 当前仍写 Gemini CLI extension waitlist。它与 FSoft 仓库、PorunC/PyPI 包均不相同。网页门户可访问与私有仓库本地扩展可用必须分别核验，不跨产品借用能力或发布结论。

**对 A1/A2 的影响（项目判断）：** FSoft 版本保留为可考察的源码路线，先固定提交及实际解析依赖，在隔离环境完成安装、MCP 启动和最小读取/写页验证，再决定能否进入 A3 同题实测。未通过前沿用现有宿主调查及其他已具备条件的路线；不能将“代码已公开”或包声明 1.0.1 写成“已发布且本项目可用”。此补充优先于第 7 节未细分发行条件的“入围待测”措辞。

<a id="user-tool-decision"></a>

## 9. 用户试用反馈与工具决定（2026-09-16）

本节来源为本次对话中的用户反馈：“我测试过 openwiki 了，符合预期。codebase-memory-mcp star 太少了，不考虑”。这补充了实际试用结论与明确选型决定，不是本轮 Agent 运行测试的记录。

- **OpenWiki：用户已试用认可，作为后续知识维护选择。** 复用已有知识、配置和有效结果，不再为知识工具选型重复横测。试用仓库、版本、CLI/MCP/Skill 入口及具体案例尚未记录；A2 衔接时按需对齐，不将此前源码版本冒充用户安装版本，也不补写质量分数或未报告的通过项。
- **后续验证范围：** 重点是 OpenWiki 与 Intent/Spec/Plan、实现后维护及本地闭环的衔接；已有成果覆盖的场景直接复用，只补必要缺项。单项工具认可不自动表示 A3/A4 全部完成。
- **CodeWiki：** 保留源码研究和后备条件，不安排当前对比；只有出现明确知识维护缺口且需要重新比较时再核验安装/运行。
- **codebase-memory-mcp：已排除。** 按用户给出的 star 偏好移出测试和接入安排，继续沿用 Codegraph/原文读取。不推导其技术质量不合格，不设未经用户指定的 star 下限，也不自动重新纳入。

当前状态统一回写[工具选型页](../../docs/tools/existing-tools-reuse-plan.md#a1-shortlist)与[行动路线图](../../docs/roadmap/action-roadmap.md#resume)；以上决定优先于第 7/8 节较早的试验安排。
