# 设计阶段的项目知识调查

本项目的业务范围来自 `Intent.md`。项目权威与操作入口为 `CLAUDE.md`；架构原则在 `docs/architecture/clarified-architecture/clarified-architecture-en.md`，项目结构规则在 `docs/architecture/architecture-spec.md`。按项目既有权威关系处理冲突，ADR 的 Accepted 状态不自动高于上位文件。

Wiki 入口是 `openwiki/index.md`，ADR 入口是 `docs/architecture/adr/README.md`。在 brainstorming 提出工程方案前：

1. 根据当前需求检索相关 Wiki 和 ADR，沿索引读取相关原文，检查 ADR 状态、适用范围与替代关系。
2. 用源码和测试核实 Wiki 所述现状；区分已实现行为、目标决定及尚未验证的说法。
3. 使用本会话实际可用的搜索和读取工具定位影响范围；Codegraph 不可用时直接搜索及读源码，不推测工具存在。
4. 在设计草稿中简要列出实际查阅的依据、采用的约束、资料冲突和未解决缺口。路径存在或检索命中不等于正文已读。
5. 关键原文缺失时明确说明影响，形成有边界的草稿或请求补充；不要将未检索表述为没有资料。上游资料变更后复核受影响部分。
