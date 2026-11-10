# 离线设计库

以下命令从 APDR 仓库根目录执行；业务项目路径作为显式参数传入。Python 脚本使用本地数据，无需付费 API。

## UI UX Pro Max

原始说明：`vendor/ui-ux-pro-max/SKILL.md`。其安装示例可能使用 `.claude/skills/` 路径，在 APDR 中采用本页路径。

新页面或新的产品视觉方向：

```bash
python3 vendor/ui-ux-pro-max/scripts/search.py "enterprise dashboard tablet" --design-system -p "Project"
```

聚焦一个交互问题：

```bash
python3 vendor/ui-ux-pro-max/scripts/search.py "touch target feedback" --domain ux --json
```

按实际框架查实现规则，例如：

```bash
python3 vendor/ui-ux-pro-max/scripts/search.py "responsive table overflow" --stack html-tailwind --json
```

检查结果的领域、命中数量与适用平台。没匹配时缩小或改写一次查询；仍无匹配则注明，不能把空结果当成推荐。默认不使用 `--persist`、`--force`；需要落盘时明确指向业务项目，先读现有设计规范，避免覆盖已批准内容。

字体与图标的目录元数据不等于字体文件和图标资源已经安装；实际使用资源时仍按其许可与项目离线要求处理。不要为触屏系统引入不必要的大动效或在线字体依赖。

## Mobile UI/UX Pro Max

源目录：`vendor/mobile-uiux-pro-max/`。按目标平台读取 `rules/system/platform-conventions.md`、所用框架的 `frameworks/<name>/_index.md`，再读取相关组件或交互文件。通用 token、排版和状态规则见 `design-system/` 与 `rules/`。

适用于原生手机/平板；Web、桌面和工业触控只借用适合的原则。不要把 SwiftUI、Compose、Flutter、React Native 的 API、点击单位和导航规则混用。

代码静态启发式检查：

```bash
python3 vendor/mobile-uiux-pro-max/quality-checks/validators/run_all.py "/absolute/path/to/app/src" --json
```

审阅 stderr；该上游 runner 会捕获个别 validator 异常，零退出码不证明所有检查都运行。出现 `errored` 时将相关检查标为未执行，不采用其总分作为通过证据。验证器按文本模式扫描，不能证明运行时对比度、触控命中、屏幕阅读器或状态覆盖。

## 复用现有视觉技能

- `vendor/anthropic-skills/frontend-design/SKILL.md`：产品对应的字体、配色、布局和自我审阅。
- `vendor/taste-skill/design-taste-frontend/SKILL.md`：固定版本的 Taste 新版；展示页面走 page，后台/分析/设置等操作型界面读 `references/app-screens.md` 后走 app。脚本、设计库、组件资产和浏览器检查均已随包安装。
- `skills/open-design/SKILL.md`：将已经选定的设计方向统一为 tokens。
- `vendor/awesome-design-skills/`：现有组件规范。

四者与新库共用一份已批准的视觉规范，不分别产出互相覆盖的设计系统。

## 可执行入口

`node scripts/design-tools.mjs status` 检查 5 个 Skill、当前 Node/浏览器和 detector 的安装状态及引擎校验值。工具脚本从自身位置定位 APDR，调用时 cwd 可设为授权的业务项目。

```bash
node scripts/design-tools.mjs search "touch target feedback" --domain ux --json
node scripts/design-tools.mjs mobile-check "/absolute/path/to/app/src" --json
node scripts/design-tools.mjs detect "/absolute/path/to/web/src" --json
node scripts/design-tools.mjs taste-draw --app --kind smb-admin --brief "enterprise operations tablet" --out "/absolute/path/to/project/.taste-skill"
node scripts/design-tools.mjs taste-lint "/absolute/path/to/project/src" --app --json
```

入口中的 mobile-check 会将上游验证器异常转为失败。Taste 的抽样历史写入显式 `--out` 所在项目，不改用户全局历史。后台已有批准的视觉系统时，沿用它，只选择本次需要的组件/布局规则，不为小修改重新抽取全套风格。

浏览器核验默认继续使用 APDR preview 的可见隔离浏览器。需要明确的自动化检查时，可用 `taste-inspect <url-or-file> --automated --app --out <project-evidence-dir> --json`；它使用独立的 headless 浏览器和临时 profile，在多个宽度输出截图与报告。工具退出码是上游规则结果，必须结合品牌和批准规范审阅误报。它不证明真实触控手势或实机操作已经验证。

入口额外检查请求宽度与实际布局视口是否一致，并生成 `apdr-report.json`。移动浏览器可能围绕固定宽度内容扩展布局视口，导致原始探针报告“无溢出”；遇到该情况标记失败并要求 preview 复核，不能声称小屏布局通过。原始 `report.json` 保留，便于区分上游发现与 APDR 补充检查。
