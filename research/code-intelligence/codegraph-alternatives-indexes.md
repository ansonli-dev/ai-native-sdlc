# Codegraph 替代调查：本地代码索引与检索

[总览与下一步](../../README.md) · 研究依据 · 候选机制与边界，尚无同题实测排名 · [研究索引](../README.md)

核验日期：2026-09-15。范围为本地代码索引、Agent 查询和影响调查；仅阅读一手文档与固定提交源码，未安装运行或测量准确率、速度、Token 消耗。

**2026-09-16 选型更新：用户因 star 太少明确不考虑 codebase-memory-mcp，该工具已排除，继续沿用 Codegraph/原文读取。** 以下能力事实和原始试点建议作为历史研究保留，不触发安装或对测；当前安排见[工具选型页](../../docs/tools/existing-tools-reuse-plan.md#a1-shortlist)。

## 1. 结论

- **DeusData/codebase-memory-mcp 是本组最值得与 Codegraph 对测的替代候选**：持久结构图、调用路径、变更影响、全文和向量排序均有实际实现；能否替换取决于目标仓库的解析质量和新鲜度测试。
- **johnhuang316/code-index-mcp 是较轻的文件／符号查询选项**：有基础调用者元数据，但不是完整的图遍历、影响分析替代品；其自动更新主要覆盖文件清单。
- **cocoindex-io/cocoindex-code 是自然语言语义检索补充**：按 AST 感知方式切块并建立向量索引，没有在本次核验接口中发现持久调用图或影响遍历；不因使用 AST 就归入结构图替代品。

上述为本项目场景的选型判断，以下列源码能力为依据。As-Is 事实、ADR 决定和 Spec／Plan 的权威仍留在文档及原始来源中。

## 2. 身份与许可证

| 项目 | 本轮源码 SHA | 实际许可证文件 | 版本说明 |
|---|---|---|---|
| [DeusData/codebase-memory-mcp](https://github.com/DeusData/codebase-memory-mcp) | `2058d49a04b785315c9f5bb56b6e2365822b576b` | [MIT][cbm-license]；内嵌 Nomic 派生向量另有 [Apache-2.0 NOTICE][cbm-nomic] | 比较固定源码，不将主分支能力等同已发布二进制 |
| [johnhuang316/code-index-mcp](https://github.com/johnhuang316/code-index-mcp) | `d395cbf99e8e3e8bc280255a76a84a9ac6cb5528` | [MIT][cim-license] | [pyproject.toml][cim-package] 为 `2.17.1`，不据此断言包已发布 |
| [cocoindex-io/cocoindex-code](https://github.com/cocoindex-io/cocoindex-code) | `47605cf099456ae117bbade9a66c2d5a0f82e416` | [Apache-2.0][ccc-license] | [pyproject.toml][ccc-package] 使用 VCS 动态版本 |

**名称消歧**：本报告的 Code Index MCP 明确指 `johnhuang316/code-index-mcp`，包的 Homepage 也指向该仓库。另一个 [trondhindenes/code-index-mcp](https://github.com/trondhindenes/code-index-mcp) 是 Go／Zoekt 文本搜索包装器；[Consiliency/Code-Index-MCP](https://github.com/Consiliency/Code-Index-MCP) 是另一个独立项目。不能把这些项目的功能或许可证合并到一个产品名下。本轮未确认 `jmylchreest/code-index-mcp` 或 `jxnl/code-index-mcp` 是上述产品的官方归属。

## 3. 横向比较

| 维度 | codebase-memory-mcp | johnhuang316/code-index-mcp | cocoindex-code |
|---|---|---|---|
| 索引单位 | 项目、包、目录、文件、模块、类、函数、方法、接口、类型、路由、资源等图节点。[数据模型][cbm-readme] | 文件记录和符号记录；符号带起止行、签名、文档及 `called_by`。[存储][cim-store] | `CodeChunk`：路径、语言、代码、起止行、向量；默认 `chunk_size=1000`，带最小块和重叠设置。[索引器][ccc-index] |
| 关系 | `IMPORTS`、`CALLS`、`CALL_REFERENCE`、`USAGE`、`IMPLEMENTS`、`TESTS` 等；调用、函数值引用、未能证明唯一目标的使用分开。[关系说明][cbm-readme] | 构建时收集调用并按符号 ID、唯一短名／后缀解析 `called_by`；能力依语言策略。[构建器][cim-builder] | 索引表与查询不包含函数间调用／依赖边。[索引器][ccc-index]、[查询][ccc-query] |
| 精确／全文查询 | `search_graph` 结构条件／BM25；`search_code` 类 grep；只读 Cypher 子集。[工具接口][cbm-readme] | `find_files`、literal／regex／fuzzy 文本搜索、文件摘要、符号正文；调用 rg／ugrep 等已有搜索器。[接口][cim-readme] | 向量搜索为主；另有结构模式 `ccc grep`，但当前 README 明示它依赖尚待发布的 CocoIndex 功能，不计为已发布能力。[CLI 说明][ccc-readme] |
| 自然语言／向量 | 有向量与多信号排序；实际为静态 Nomic token 向量、未登录词随机向量和算法组合，并非运行完整 Nomic 模型。[实现][cbm-semantic]、[派生说明][cbm-nomic] | 未在核验的主接口中发现向量／embedding 查询；Agent 把自然语言转换为搜索条件，不算服务自身的语义检索。[接口][cim-readme] | 查询和代码块经过 embedding 后按向量距离检索，可按语言、路径过滤。[查询][ccc-query] |
| 调用图／影响 | `trace_path`、`detect_changes`、`query_graph` 有专用入口；属于直接替代所需能力。[工具接口][cbm-readme] | 可返回基础 `called_by`；未在接口中发现通用多跳遍历或 diff→影响闭包工具。[接口][cim-readme]、[构建器][cim-builder] | 未发现调用路径／变更影响工具；召回相似片段不能证明依赖关系。[MCP][ccc-server] |
| 本地接入 | 本地原生二进制；MCP、CLI、可选 UI。CLI 单次运行不启动 watcher；MCP 会使用共享协调进程。[运行说明][cbm-readme] | Python ≥3.10、MCP、watchdog、tree-sitter；`code-index-mcp` 命令启动服务，不是同等功能的多子命令查询 CLI。[包定义][cim-package] | Python ≥3.11、`ccc` CLI、MCP、后台进程、SQLite 向量表及 CocoIndex 状态存储。[包定义][ccc-package]、[索引器][ccc-index] |
| 模型／服务依赖 | 正常索引查询不需 API key 或独立语言服务器；内嵌向量，不加载完整神经模型。[语义实现][cbm-semantic] | 不需 embedding 模型或 LLM API；原生搜索工具可选但影响 regex 等能力。[README][cim-readme] | 必须配置 embedding；`[full]`／`[embeddings-local]` 可使用本地 SentenceTransformers，也可通过 LiteLLM 接服务。[包定义][ccc-package] |

## 4. 新鲜度：本地工作区是关键区别

### codebase-memory-mcp

- watcher 比较 Git HEAD，以及 `git status --porcelain -uall -z` 加逐文件大小／mtime 的 dirty 签名；覆盖已暂存、未暂存和未忽略的新文件变化；重命名条目也参与签名。**非 Git 项目当前跳过自动轮询**，不能泛称任意目录自动更新。[watcher 源码][cbm-watch]
- 实际增量管线有 SHA-256 输入 manifest、删除／新增分类和受影响依赖闭包；普通内容变更不只依据 commit。重命名通过旧路径删除与新路径发现反映，不能据此宣称跨重命名保留稳定符号身份。[增量实现][cbm-incr]
- watcher 是轮询，不是每次读取的严格快照屏障；dirty 签名自身不是完整内容 hash。进行 As-Is 或影响结论前仍要核验索引状态和实际来源。源码中的 hash manifest 增强实际索引管线，不应被解释成 watcher 能察觉所有保持 size／mtime 的外部写入。

### johnhuang316/code-index-mcp

- watchdog 观察创建、修改、删除和移动事件，回调实质调用 **shallow index rebuild**；尽管附近存在“deep index manager”旧注释，执行代码更新的是文件清单。[回调][cim-project]、[watcher][cim-watch]
- 因而 dirty 内容变化、新建未跟踪文件和改名能触发文件清单刷新，但符号／`called_by` 需要显式 `build_deep_index`。这与“完整符号图实时增量维护”有明显差别；调用分析前必须单独安排 deep 重建。[README][cim-readme]
- 文件排除规则、watcher 未运行或移动目标被排除都会影响发现范围；自动监控不能代替明确的更新后核验。本轮没有执行改名、删除和并发读写测试。

### cocoindex-code

- 输入从本地目录 `walk_dir` 获取并读取当前文本，不局限 Git 提交；符合 include／exclude 和 `.gitignore` 规则的 dirty／未跟踪文件均可进入处理。[索引器][ccc-index]、[文件匹配][ccc-walk]
- 每文件处理是 CocoIndex memoized computation；更新时重新枚举输入，维护目标行。改名体现为输入路径变化，不是保留结构图节点身份；删除传播的具体时序仍需目标仓库试验。[索引器][ccc-index]
- MCP `search(refresh_index=True)` 默认先等待 index 再查询；CLI `ccc search` 需要 `--refresh` 才显式刷新；也可单独执行 `ccc index`。不能把“有后台进程”当成后台持续监听所有文件。[MCP 实现][ccc-server]、[CLI 说明][ccc-readme]

## 5. 解析范围与风险

**Codebase Memory 的 Hybrid LSP 是自有静态类型解析层。** 固定提交 README 写 162 种 tree-sitter grammar；搜索缓存仍有 158，不能混用。Hybrid LSP 针对部分语言在原生 C 中实现类型／目标解析，**不启动 tsserver、pyright、gopls 等真实 language server**。grammar 数量不等于每种语言的跨文件调用解析完整度，也不等于与真实编译器／IDE 解析结果一致。[官方解释][cbm-readme]

Code Index MCP README 区分 10 种专用解析策略与其他文件类型的 fallback；后者仅有基础文件／元数据能力，不能计为同质量调用追踪覆盖。[语言说明][cim-readme] CocoIndex 的 AST 感知切块旨在召回代码片段，不能产生代码图所需的关系正确性保证。[索引器][ccc-index]

三个工具的查询结果都只支持候选证据定位；空结果不能直接变成“没有调用者／没有依赖”的 As-Is 事实。工具自报的速度、Token 节省比例及其他基准不构成本项目的横评成绩。

## 6. 建议试点

1. 将 **Codegraph 与 codebase-memory-mcp** 放在同一仓库、同一工作区和同一题集上：查定义、跨文件调用者、多跳影响、框架间接调用、配置／路由来源、无法解析时的明确输出。
2. 分别修改未暂存文件、新增未跟踪文件、改名、删除和切换分支，比较正常刷新后结果；加入关闭／重启服务与非 Git 目录。记录结果版本、遗漏、误报、索引耗时和常驻内存。
3. CocoIndex 只增加“知道行为描述、不知道符号名”题集，验证它相对现有 Codegraph 查询是否有实际召回增益；没有增益就不加第二套索引。
4. Code Index MCP 留作较轻文件／符号服务备选。采用 CBM 时不直接启用其 ADR 写入为新的权威；仍让 `docs/adr/` 承担既定决定记录，索引作为派生缓存。

[cbm-license]: https://github.com/DeusData/codebase-memory-mcp/blob/2058d49a04b785315c9f5bb56b6e2365822b576b/LICENSE
[cbm-readme]: https://github.com/DeusData/codebase-memory-mcp/blob/2058d49a04b785315c9f5bb56b6e2365822b576b/README.md
[cbm-watch]: https://github.com/DeusData/codebase-memory-mcp/blob/2058d49a04b785315c9f5bb56b6e2365822b576b/src/watcher/watcher.c
[cbm-incr]: https://github.com/DeusData/codebase-memory-mcp/blob/2058d49a04b785315c9f5bb56b6e2365822b576b/src/pipeline/pipeline_incremental.c
[cbm-semantic]: https://github.com/DeusData/codebase-memory-mcp/blob/2058d49a04b785315c9f5bb56b6e2365822b576b/src/semantic/semantic.c
[cbm-nomic]: https://github.com/DeusData/codebase-memory-mcp/blob/2058d49a04b785315c9f5bb56b6e2365822b576b/vendored/nomic/NOTICE
[cim-license]: https://github.com/johnhuang316/code-index-mcp/blob/d395cbf99e8e3e8bc280255a76a84a9ac6cb5528/LICENSE
[cim-package]: https://github.com/johnhuang316/code-index-mcp/blob/d395cbf99e8e3e8bc280255a76a84a9ac6cb5528/pyproject.toml
[cim-readme]: https://github.com/johnhuang316/code-index-mcp/blob/d395cbf99e8e3e8bc280255a76a84a9ac6cb5528/README.md
[cim-store]: https://github.com/johnhuang316/code-index-mcp/blob/d395cbf99e8e3e8bc280255a76a84a9ac6cb5528/src/code_index_mcp/indexing/sqlite_store.py
[cim-builder]: https://github.com/johnhuang316/code-index-mcp/blob/d395cbf99e8e3e8bc280255a76a84a9ac6cb5528/src/code_index_mcp/indexing/sqlite_index_builder.py
[cim-project]: https://github.com/johnhuang316/code-index-mcp/blob/d395cbf99e8e3e8bc280255a76a84a9ac6cb5528/src/code_index_mcp/services/project_management_service.py
[cim-watch]: https://github.com/johnhuang316/code-index-mcp/blob/d395cbf99e8e3e8bc280255a76a84a9ac6cb5528/src/code_index_mcp/services/file_watcher_service.py
[ccc-license]: https://github.com/cocoindex-io/cocoindex-code/blob/47605cf099456ae117bbade9a66c2d5a0f82e416/LICENSE
[ccc-package]: https://github.com/cocoindex-io/cocoindex-code/blob/47605cf099456ae117bbade9a66c2d5a0f82e416/pyproject.toml
[ccc-readme]: https://github.com/cocoindex-io/cocoindex-code/blob/47605cf099456ae117bbade9a66c2d5a0f82e416/README.md
[ccc-index]: https://github.com/cocoindex-io/cocoindex-code/blob/47605cf099456ae117bbade9a66c2d5a0f82e416/src/cocoindex_code/indexer.py
[ccc-query]: https://github.com/cocoindex-io/cocoindex-code/blob/47605cf099456ae117bbade9a66c2d5a0f82e416/src/cocoindex_code/query.py
[ccc-server]: https://github.com/cocoindex-io/cocoindex-code/blob/47605cf099456ae117bbade9a66c2d5a0f82e416/src/cocoindex_code/server.py
[ccc-walk]: https://github.com/cocoindex-io/cocoindex-code/blob/47605cf099456ae117bbade9a66c2d5a0f82e416/src/cocoindex_code/file_walk.py
