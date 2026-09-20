# CodeGraph 在仓库可验证 as-is 中的作用

[总览与下一步](../../README.md) · 研究依据 · 候选机制与边界，尚无同题实测排名 · [研究索引](../README.md)

核验日期：2026-09-15。只阅读上游 README、官方文档和源码，未安装、执行或实测 CodeGraph。源码固定到 [main 的 58c07e8745dbba64c748fbcd8497c0c946e270d6](https://github.com/colbymchenry/codegraph/commit/58c07e8745dbba64c748fbcd8497c0c946e270d6)；以下实现细节不等于某个已发布安装包的保证。

替代工具及横测建议见[Codegraph 同类比较](codegraph-tools-comparison.md)。本文继续维护用户已有工具的基线定位；源码索引与知识正文的职责不因提供者切换而改变。

## 结论

**建议把 CodeGraph 用作持续更新的代码结构索引与证据定位工具，由另一个 as-is 维护流程产出可复用的语义说明与证据记录。** 第一版只描述仓库可验证的现状：代码、已提交配置、schema、迁移、文档、测试，以及明确版本和环境下取得的测试结果。线上是否部署、实际运行配置、仓库外业务意图均标为范围外或未知，无需为第一版另行收集。

这是一项设计判断：上游图模型的核心是文件、符号及调用、导入、继承等关系，附源码位置和部分边的来源；它没有因此自动成为带审阅状态的业务事实库。[图模型](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/site/src/content/docs/core-concepts/knowledge-graph.md)、[数据库结构](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/src/db/schema.sql)。

## 已核验的能力与边界

| 能力 | 上游实际提供 | 对 as-is 的用途与限制 |
|---|---|---|
| 探索代码 | `codegraph_explore` 接收自然语言或符号/文件名，返回按文件分组的带行号源码、调用路径、影响概览；MCP 默认只列出此工具，其他工具可配置开启 | 帮助找到实现位置、跨文件流程和接口。结果经过筛选与容量限制，不能把一次回答当作全仓覆盖证明。[MCP 文档](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/site/src/content/docs/reference/mcp-server.md)、[工具参数](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/src/mcp/tools.ts#L1330-L1347) |
| 依赖影响 | `impact` 沿已存储的依赖边寻找可能受影响符号；MCP 默认深度 2，参数限制为 1–10 | 为 plan 和 tasks 提供检查范围候选；受图覆盖及遍历深度约束，不能保证所有影响都被发现。[遍历实现](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/src/graph/traversal.ts#L513-L605)、[MCP 实现](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/src/mcp/tools.ts#L2524-L2568) |
| 相关测试 | `codegraph affected` 沿 import 依赖查找测试文件，默认深度 5 | 给出回归测试候选；找到测试文件不能证明测试已运行，也不能证明业务验收完整。[affected 文档](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/site/src/content/docs/guides/affected-tests.md) |
| 动态调用补全 | 对回调、事件、部分框架和接口分派合成连接，标记 `provenance: heuristic` 及 wiring site | 可提示静态抽取遗漏的连接；语义说明必须保留推断属性，不能升级为已实测路径。[解析文档](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/site/src/content/docs/core-concepts/resolution.md) |
| 增量维护 | watcher、增量 sync、pending/stale 提示、连接时 catch-up | 减少代码索引漂移；不会自动证明手写 as-is 概述仍正确。[索引文档](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/site/src/content/docs/guides/indexing.md) |

## 新鲜度不能只相信宣传语

README 写有 “The index is never stale”，但具体实现允许首次 catch-up 等待 **3 秒**后先返回查询，后台继续同步；catch-up 失败也会提供可能陈旧的 best-effort 结果。因此，生成正式 as-is 前应确认同步成功，不能以“没有 pending 项”单独证明整个索引已追上工作树。[README](https://github.com/colbymchenry/codegraph#4-no-more-syncing)、[超时默认值](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/src/mcp/tools.ts#L795-L813)、[等待与失败处理](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/src/mcp/tools.ts#L1520-L1564)。

索引范围也有明确限制：支持的源码类型、忽略规则、默认跳过的依赖/构建目录及超过 1 MB 的文件。配置可调整部分范围。**未入图不代表仓库不存在**；配置、schema、迁移、Markdown 文档等是否被完整覆盖，需要逐类核对，必要时直接读取原文件。[索引范围](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/site/src/content/docs/guides/indexing.md#what-gets-indexed)、[配置文档](https://github.com/colbymchenry/codegraph/blob/58c07e8745dbba64c748fbcd8497c0c946e270d6/site/src/content/docs/getting-started/configuration.md)。

## 第一版建议另行维护的内容

以下为本项目的设计建议，不是 CodeGraph 已承诺的功能：

- **语义归纳**：模块职责、仓库内可观察的业务规则、状态变化、接口契约、数据约束及例外；每项链接到源码或文档证据。文档与实现冲突时并列记录，保留“文档声明”与“实现证据”的区别。
- **证据范围**：repo、commit、工作树改动状态、文件路径/符号/行号、验证时间、索引配置与状态；文件 hash 可用于定位未提交修改。
- **结论类型**：直接证据、基于证据的推断、未知。已提交默认配置不等于运行时配置，存在迁移不等于迁移已执行，测试代码不等于测试通过。
- **测试结果**：命令、revision、环境、结果和输出证据；未执行时如实写“未验证”。
- **更新规则**：代码变化后先同步图，再用依赖影响与证据链接筛选需要重审的 as-is 条目，重新核验相关声明。若影响图不完整，扩展检查范围。

下游可这样使用：**spec** 读取现有行为、约束及未知项；**plan** 读取实现入口、依赖和仓库证据；**tasks** 引用具体文件、影响候选及验证方法。图负责快速检索，维护后的 as-is 负责稳定、可追溯地表达“在这个仓库版本下知道什么”。
