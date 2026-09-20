# 研究资料索引

[返回当前方案与下一步](../README.md) · [工具筛选工作稿](../docs/tools/existing-tools-reuse-plan.md)

研究笔记保存外部材料、核验版本与能力边界。它们说明“为什么这样判断”，不直接规定本项目“必须这样实现”。早期建议按当前步骤级记录、复用优先和统一筛选原则理解；候选入围与采用结论由工具选型页维护。

2026-09-16 已完成 A1 定向复核：见[知识](tools/tool-reuse-knowledge.md#a1-comparison)、[SDD](tools/tool-reuse-sdd.md#a1-sdd)、[宿主](tools/tool-reuse-agents.md#a1-hosts)、[检索](code-intelligence/codegraph-tools-comparison.md#a1-retrieval)、[检查](tools/tool-reuse-validation.md#a1-validation)。后续用户已确认 OpenWiki 试用符合预期，并排除 codebase-memory-mcp；以[当前选择](../docs/tools/existing-tools-reuse-plan.md#a1-shortlist)为准，历史研究保留，完整流程验证尚待推进。

## 1. 方法对照

| 资料 | 回答什么问题 |
| --- | --- |
| [SDD 的 Plan 与 Tasks](method/sdd-plan-task-comparison.md) | 不同框架怎样区分方案与工作清单 |
| [Spec 与 Design 交叉核验](method/sdd-spec-design-crosscheck.md) | Spec 一词在各框架的边界，以及我们的三产物选择 |
| [Anthropic SDLC Playbook 对照](method/anthropic-playbook-sdd-comparison.md) | 开发产物与步骤如何衔接 |
| [Playbook 差异与覆盖审计](method/anthropic-playbook-gap-audit.md) | 初次审计的主动差异与九项缺口，以及澄清后已补充的设计和后置边界 |
| [Loop 与 Graph Engineering](method/loop-and-graph-engineering.md) | 局部反馈、节点交接及按需协作有什么借鉴价值 |

## 2. 按能力调查工具

| 资料 | 覆盖范围 |
| --- | --- |
| [仓库知识与 As-Is](tools/tool-reuse-knowledge.md) | OpenWiki、CodeWiki 等知识维护候选及证据机制 |
| [SDD 与执行方法](tools/tool-reuse-sdd.md) | OpenSpec、Spec Kit、Superpowers、BMAD、Agent OS |
| [Agent 宿主](tools/tool-reuse-agents.md) | OpenCode、Pi、Goose、Aider、OpenHands SDK 的能力与边界 |
| [确定性工具](tools/tool-reuse-validation.md) | 初始化、文档检查、验证、ADR 与 hooks 的复用候选 |

## 3. 代码理解与混合资料图

先读[Codegraph 同类横评](code-intelligence/codegraph-tools-comparison.md)，需要核对细节时再进入专题。

| 资料 | 覆盖范围 |
| --- | --- |
| [已有 Codegraph 的定位](code-intelligence/codegraph-as-is-role.md) | 它能为 As-Is 提供什么、不能替代什么 |
| [结构图候选](code-intelligence/codegraph-alternatives-graph.md) | GitNexus、Code-Graph-RAG |
| [本地索引与检索](code-intelligence/codegraph-alternatives-indexes.md) | codebase-memory-mcp、code-index-mcp、CocoIndex Code |
| [语义导航与搜索](code-intelligence/codegraph-alternatives-semantic.md) | Serena、SCIP、Zoekt 等相邻能力 |
| [Graphify 专项研究](code-intelligence/graphify-assessment.md) | 代码/SQL/文档关联、Wiki 及条件适配成本 |
| [Graphify 维护审计](code-intelligence/graphify-maintenance-audit.md) | 增量更新、缓存、MCP 新鲜度和 hooks 的源码边界 |

Graphify 是候选之一；用户提供链接及专题核验深度均不表示优先采用。

## 4. 执行与宿主机制

| 资料 | 覆盖范围 |
| --- | --- |
| [Anthropic 编码可靠性材料](execution/anthropic-coding-reliability-harness-notes.md) | 上下文、验证与长任务执行的官方阅读资料 |
| [Git hooks 的边界](execution/git-hooks-sdlc-boundaries.md) | Git 事件检查与本地开发流程的关系 |
| [OMP 与 Claude hooks 兼容性](execution/omp-claude-hooks-compatibility.md) | 指定 OMP 版本的本地源码核验；需要宿主适配时再读 |
| [Claude 原生阶段控制](execution/claude-native-stage-controls.md) | Skills、子代理、权限、Plan mode、hooks 与运行状态的边界；补充两类技能调用 Hook 协议，配套[上下文插件设计](../docs/tools/project-context-hook-plugin-design.md)及[全流程评估](../docs/tools/superpowers-full-workflow-assessment.md) |

目前共 20 份专题笔记。方法细则分别回到 `docs/method/`、`docs/knowledge/`；工具采用回到 `docs/tools/`；后续产品化安排回到 `docs/roadmap/`。
