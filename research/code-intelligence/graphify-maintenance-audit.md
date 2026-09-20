# Graphify：增量维护、新鲜度与 hooks 核验

[总览与下一步](../../README.md) · 研究依据 · 候选机制与边界，尚无同题实测排名 · [研究索引](../README.md)

核验日期：2026-09-15。对象：[Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify)，固定源码提交 [`fe66389083369c3159aa391117185c8f58b4d07c`](https://github.com/Graphify-Labs/graphify/tree/fe66389083369c3159aa391117185c8f58b4d07c)，当时默认分支 `v8`。

范围：读取官方源码、随包流程与测试文件；未安装、未运行 Graphify，未执行外部 Skill 的指令。以下区分已实现的机制与基于源码的适配判断，不把源码测试数量作为实测通过证据。

## 1. 先分清三个“更新”入口

| 入口 | 源码中的实际路径 | 对本项目的含义 |
|---|---|---|
| `graphify update [path]` | 调用 `watch._rebuild_code`，完整扫描范围内的代码结构；不调用 LLM；显式调用等待重建锁 | 可作为本地结构图刷新，不等于整个混合知识图已刷新 |
| `graphify extract <path>` | 有旧 `graph.json` 时默认走增量检测、缓存、抽取和图合并；`--force` 改为全量扫描；`--code-only` 跳过语义抽取 | 更适合程序化接入混合图维护，仍需处理抽取失败与保留旧图 |
| Agent 中 `/graphify --update` | Skill 检测变化，再编排 AST、必要的语义抽取、合并和后续导出；纯代码变化明确跳过语义阶段 | 是宿主执行的流程约定，不能当作与 CLI 同义的原子命令 |

依据：[CLI update](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cli.py#L2403)、[CLI extract 增量入口](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cli.py#L3411)、[随包 update 流程](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/skills/codex/references/update.md#L5)。

## 2. 文件检测覆盖磁盘现状，提交号不是全部基线

- `detect_incremental` 比较当前扫描结果与 manifest，而非只比较 Git 提交，因此能覆盖扫描范围内未提交修改和未跟踪新文件；忽略规则、支持类型与扫描范围仍会限制覆盖。
- manifest 区分 `ast_hash` 与 `semantic_hash`，避免一次 AST 刷新把尚未做的语义抽取标为完成。先比较时间戳，必要时比较完整文件 MD5；加入了时间戳倒退与同一时间粒度内改写的保护。
- 这是带 stat 快速路径的变化检测，不是每次查询对每个源文件重新哈希；人为保留旧时间戳的特殊改写仍应作为试点用例。

依据：[detect_incremental](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/detect.py#L2439)、[manifest 写入](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/detect.py#L2181)。前两点为源码机制，第三点为边界判断。

## 3. 删除、改名与忽略规则已有专门处理

- manifest 中消失的路径按磁盘是否仍存在，区分真正删除与新排除；旧图还会按自身 `source_file` 补充清理候选，避免只有 manifest 才能识别陈旧来源。
- AST 重建会检查当前范围内的旧来源，即使 hooks 只传入改名后的路径，也可识别已经消失的旧路径。范围外节点被保留。
- 对“文件仍存在，只是扫描没收集到”的情况采用保留并报告，防止路径错误或过滤异常导致大量节点被误删；这意味着保留结果未必仍在当前预期范围内。
- `.graphifyignore`／显式排除在重建时参与清理；`.gitignore` 对完整刷新和增量 hook 的处理有区别，后者可保留先前有意纳入的被忽略目录。

依据：[图来源补充清理](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cli.py#L219)、[重建来源核对与忽略策略](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/watch.py#L726)。

## 4. 增量调用关系不能只测“改过的文件有新节点”

post-commit 的 `changed_paths` 模式只重新抽取命中的文件，并把未改文件的 AST 符号和成员关系作为只读解析上下文，以恢复“已改调用方 → 未改被调用方”的连接。[解析上下文实现](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/watch.py#L1612)

**源码推断：**这段实现未将未修改的调用方自动加入重解析任务；若改动被调用方导致符号 ID 或解析结果变化，旧调用边可因端点消失而被移除。应实测“只改接口／callee、caller 不动”能否重新连接。显式完整 `update` 与仅按提交文件增量更新应分别测试。

还需区分 AST 和语义层：完整 AST 刷新保留其未负责重抽的语义层；但当前 `_reconcile_existing_graph` 的增量分支将重建来源加入节点删除集合，后续来源删除条件没有 tier 限制。**据此不能承诺所有入口都保留同一代码文件的语义节点**；应以代码同时拥有两层节点的样本验证。[节点合并实现](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/watch.py#L795)

## 5. 缓存较完整，但 Markdown 元数据需要单独核验

缓存按内容与相对路径生成 SHA256 键；AST 缓存按抽取器版本隔离，语义缓存支持 prompt 指纹和普通／deep 命名空间。截断结果、无节点且无超边的语义结果视为未命中；旧格式语义缓存允许回退使用，同时报告旧格式命中。[缓存实现](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cache.py#L968)

**与 ADR 的直接关联：**`.md` 抽取缓存的 `file_hash` 刻意排除 YAML frontmatter。因此只修改 `status`、`reviewed`、`tags` 等，虽然完整文件 manifest 可检测到变化，语义抽取仍可能命中原缓存。是否另有步骤覆盖所有所需元数据，需在试点核验；我们的 ADR 状态和替代关系应直接读取权威原文，不能只依赖抽取缓存。[Markdown 缓存键](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cache.py#L429)

## 6. 失败保护会有意保留旧图

- AST `update` 的缩图保护按丢失节点来源判断：正常删除、成功重抽来源允许减少；未解释的减少拒绝覆盖，失败来源不能解释节点消失。
- `extract` 对不完整抽取保留缩图检查。语义来源原来有多个节点、新结果变少时，会报告未验证缩减并使该来源下次重试；整体图变小时可能拒绝覆盖。合法内容删减也可能触发，须人工判断，不能固定加 `--allow-partial`。
- 失败／截断／异常零节点来源不被正常盖上完成标记；拒绝写图时不继续盖 manifest。已读取路径也包含临时文件原子替换、重建锁与待处理路径队列。

依据：[AST 缩图检查](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/watch.py#L1120)、[语义缩减处理](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cli.py#L171)、[extract 写入门槛](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cli.py#L4430)、[重建队列](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/watch.py#L1347)。

**适配结论：**文件仍能查询、节点数量未减少、命令完成，都不能单独证明事实已更新；应记录本次更新模式、失败来源、待语义刷新项与实际受检状态。

## 7. Watch 与 MCP reload 解决的是不同问题

| 机制 | 已实现 | 不能据此推导 |
|---|---|---|
| `graphify watch` | 防抖；代码事件触发 AST 重建；任意受监听文件删除也触发清理；存活非代码变化写 `needs_update` | 文档变化后语义图自动完成重抽 |
| `graphify check-update` | 提示 `needs_update`；实现故意始终返回成功 | exit 0 表示没有待处理工作 |
| MCP 图缓存 | 每次选择图时按 `graph.json` 的 `mtime_ns + size` 热加载，支持多个项目上下文 | 图所依据的源码、ADR、未提交工作区均已验证为最新 |

依据：[watch 与 check-update](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/watch.py#L2125)、[MCP 缓存](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/serve.py#L121)、[逐请求选图](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/serve.py#L1752)。

## 8. Git hooks 有实际写入和附带安装行为

`graphify hook install` 同时安装 post-commit、post-checkout，并注册 graph.json 的 merge driver、修改 `.gitattributes`。两个 hook 以分离后台进程重建派生图和报告，已有工作记忆时还会尝试刷新 `LESSONS.md`；读取到的 hook 脚本未调用 `git add`。后台启动成功不能当作重建成功。[hooks 安装与脚本](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/hooks.py#L849)

post-commit 触发文件来自提交差异，抽取读的是运行时磁盘；它不是提交候选快照验证。post-checkout 对真正分支切换触发；linked worktree 默认跳过，rebase／merge／cherry-pick 中也有跳过保护。[hook 触发条件](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/hooks.py#L355)

**merge driver 是结构 union：**接收 base/current/other，但实现只载入 current 和 other，使用 `networkx.compose` 后写回。源码推断：一边删除的节点可能因另一边仍有它而被带回，冲突属性也不是基于原始需求的决策合并。[merge driver 实现](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cli.py#L2551)

建议首轮显式更新派生图，暂不安装默认 hooks／merge driver；以后如需自动化，用本项目统一脚本触发并报告结果，不在 Git 事件里更新 ADR 或权威 As-Is 正文。

## 9. Agent hooks 应保持为导航辅助

PreToolUse guard 主要提醒先查图；严格模式可对每会话第一次、已索引的源码 Read 返回拒绝并引导先查询，之后降为提醒。它以目标文件 mtime、`needs_update` 等条件判断是否应弱化提醒，不是全仓证据校验。[Agent guard 源码](https://github.com/Graphify-Labs/graphify/blob/fe66389083369c3159aa391117185c8f58b4d07c/graphify/cli.py#L804)

我们的适配应保留 Spec／Plan 对原始 ADR、规范、源码和验证结果的直接读取；不启用强制“查图后才能读原文”。这与 Git hooks 是两类不同事件机制。

## 10. 最小试点验收

1. 同一基线分别执行首次构图、无变化重跑、代码增量、文档增量，记录时间、模型调用与实际输出差异。
2. 测未提交修改、未跟踪文件、改名、纯删除、忽略规则变化、切分支和独立 worktree。
3. 测“caller 改／callee 不改”和反向情况；确认旧边清除且新边补回。
4. 测同文件 AST＋语义两层、只改 ADR frontmatter、真实文档删减、抽取失败后的重试。
5. MCP 保持运行时改源码但不重建、再只做 AST 更新，检查 Agent 是否能区分图文件新鲜与语义待刷新。
6. 仅在上述通过后，再决定是否采用 watcher 或自定义 hook 适配；不能把已有防护实现描述当作试点已通过。
