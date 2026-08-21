# Claude Code Configuration - RuFlo V3

## Behavioral Rules (Always Enforced)

- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (*.md) or README files unless explicitly requested
- NEVER save working files, text/mds, or tests to the root folder
- Never continuously check status after spawning a swarm — wait for results
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files

## File Organization

- NEVER save to root folder — use the directories below
- Use `/src` for source code files
- Use `/tests` for test files
- Use `/docs` for documentation and markdown files
- Use `/config` for configuration files
- Use `/scripts` for utility scripts
- Use `/examples` for example code

## Project Architecture

- Follow Domain-Driven Design with bounded contexts
- Keep files under 500 lines
- Use typed interfaces for all public APIs
- Prefer TDD London School (mock-first) for new code
- Use event sourcing for state changes
- Ensure input validation at system boundaries

### Project Config

- **Topology**: hierarchical-mesh
- **Max Agents**: 15
- **Memory**: hybrid
- **HNSW**: Enabled
- **Neural**: Enabled

## Build & Test

```bash
# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

- ALWAYS run tests after making code changes
- ALWAYS verify build succeeds before committing

## Security Rules

- NEVER hardcode API keys, secrets, or credentials in source files
- NEVER commit .env files or any file containing secrets
- Always validate user input at system boundaries
- Always sanitize file paths to prevent directory traversal
- Run `npx @claude-flow/cli@latest security scan` after security-related changes

## Concurrency: 1 MESSAGE = ALL RELATED OPERATIONS

- All operations MUST be concurrent/parallel in a single message
- Use Claude Code's Task tool for spawning agents, not just MCP
- ALWAYS batch ALL todos in ONE TodoWrite call (5-10+ minimum)
- ALWAYS spawn ALL agents in ONE message with full instructions via Task tool
- ALWAYS batch ALL file reads/writes/edits in ONE message
- ALWAYS batch ALL Bash commands in ONE message

## Swarm Orchestration

- MUST initialize the swarm using CLI tools when starting complex tasks
- MUST spawn concurrent agents using Claude Code's Task tool
- Never use CLI tools alone for execution — Task tool agents do the actual work
- MUST call CLI tools AND Task tool in ONE message for complex work

### 3-Tier Model Routing (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster (WASM) | <1ms | $0 | Simple transforms (var→const, add types) — Skip LLM |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks, low complexity (<30%) |
| **3** | Sonnet/Opus | 2-5s | $0.003-0.015 | Complex reasoning, architecture, security (>30%) |

- Always check for `[AGENT_BOOSTER_AVAILABLE]` or `[TASK_MODEL_RECOMMENDATION]` before spawning agents
- Use Edit tool directly when `[AGENT_BOOSTER_AVAILABLE]`

## Swarm Configuration & Anti-Drift

- ALWAYS use hierarchical topology for coding swarms
- Keep maxAgents at 6-8 for tight coordination
- Use specialized strategy for clear role boundaries
- Use `raft` consensus for hive-mind (leader maintains authoritative state)
- Run frequent checkpoints via `post-task` hooks
- Keep shared memory namespace for all agents

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

## Swarm Execution Rules

- ALWAYS use `run_in_background: true` for all agent Task calls
- ALWAYS put ALL agent Task calls in ONE message for parallel execution
- After spawning, STOP — do NOT add more tool calls or check status
- Never poll TaskOutput or check swarm status — trust agents to return
- When agent results arrive, review ALL results before proceeding

## V3 CLI Commands

### Core Commands

| Command | Subcommands | Description |
|---------|-------------|-------------|
| `init` | 4 | Project initialization |
| `agent` | 8 | Agent lifecycle management |
| `swarm` | 6 | Multi-agent swarm coordination |
| `memory` | 11 | AgentDB memory with HNSW search |
| `task` | 6 | Task creation and lifecycle |
| `session` | 7 | Session state management |
| `hooks` | 17 | Self-learning hooks + 12 workers |
| `hive-mind` | 6 | Byzantine fault-tolerant consensus |

### Quick CLI Examples

```bash
npx @claude-flow/cli@latest init --wizard
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder
npx @claude-flow/cli@latest swarm init --v3-mode
npx @claude-flow/cli@latest memory search --query "authentication patterns"
npx @claude-flow/cli@latest doctor --fix
```

## Available Agents (60+ Types)

### Core Development
`coder`, `reviewer`, `tester`, `planner`, `researcher`

### Specialized
`security-architect`, `security-auditor`, `memory-specialist`, `performance-engineer`

### Swarm Coordination
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`

### GitHub & Repository
`pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`

### SPARC Methodology
`sparc-coord`, `sparc-coder`, `specification`, `pseudocode`, `architecture`

## Memory Commands Reference

```bash
# Store (REQUIRED: --key, --value; OPTIONAL: --namespace, --ttl, --tags)
npx @claude-flow/cli@latest memory store --key "pattern-auth" --value "JWT with refresh" --namespace patterns

# Search (REQUIRED: --query; OPTIONAL: --namespace, --limit, --threshold)
npx @claude-flow/cli@latest memory search --query "authentication patterns"

# List (OPTIONAL: --namespace, --limit)
npx @claude-flow/cli@latest memory list --namespace patterns --limit 10

# Retrieve (REQUIRED: --key; OPTIONAL: --namespace)
npx @claude-flow/cli@latest memory retrieve --key "pattern-auth" --namespace patterns
```

## Quick Setup

```bash
claude mcp add claude-flow -- npx -y @claude-flow/cli@latest
npx @claude-flow/cli@latest daemon start
npx @claude-flow/cli@latest doctor --fix
```

## Claude Code vs CLI Tools

- Claude Code's Task tool handles ALL execution: agents, file ops, code generation, git
- CLI tools handle coordination via Bash: swarm init, memory, hooks, routing
- NEVER use CLI tools as a substitute for Task tool agents

## Support

- Documentation: https://github.com/ruvnet/claude-flow
- Issues: https://github.com/ruvnet/claude-flow/issues

## UI Preview & Asset Generation Rules

- **Logo Constraints (OfferPath):** Logos must be highly abstract, simple, futuristic, and technical. Do not over-design or try to literally depict system features. The only allowed text is "offerpath" (no slogans like "B2B growth SaaS").
- **UI Preview Rendering:** When creating HTML or UI previews for the user, DO NOT output large blocks of raw code in the chat. Write the code to a file and open it in the browser for the user to review.
- **Comprehensive Previews:** When mocking up UI components (like logos), display them in all relevant contexts across the system (e.g., navigation bar, login screen, footer) to provide a complete picture.


<claude-mem-context>
# Memory Context

# [offerpath] recent context, 2026-08-22 12:24am GMT+8

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (12,952t read) | 1,047,510t work | 99% savings

### Aug 16, 2026
218 8:00p 🟣 Shared ProjectEntryContent component added to shared.ts
219 8:01p 🔄 All 9 templates updated to use shared ProjectEntryContent
220 " ✅ All 9 templates verified using ProjectEntryContent
221 8:02p 🔴 Project parsers updated to handle resume-pro bold-linked format
222 " 🟣 Tests added for project parsing and ProjectEntryContent styling
223 8:03p 🔴 Tests fail with two errors: shared.ts parse error + regex range error
224 8:05p 🔴 Two bugs fixed: JSX parse error + regex range error
225 " 🔴 Build fails with webpack null.hash error; cache cleared
228 8:06p 🔴 Build passes clean
232 8:08p 🔴 NaN line inserted in all 9 template files
233 " 🔴 NaN bug fixed in all templates
235 8:10p 🔴 Build still crashes with webpack null.hash
236 " 🔴 Fixed personal project content display — only project name bold/primary color
239 8:12p 🔴 Webpack cache bug recurs; .next wiped again
240 8:56p 🔴 Fixed personal project bold/primary color styling on resume
241 8:57p 🔴 Personal project display fix goal completed
242 9:00p 🔴 Fixed personal project display — only project name bold+primary
243 " 🔵 Root cause: parser missed full-width colon (U+FF1A)
244 " 🔴 Parser now accepts full-width colons; renderer splits name on missing description
245 9:01p 🔴 Fixed display-split bug in EditableText.tsx — description was wrong variable
246 " 🟣 Added test coverage for full-width colon project parsing
247 " 🔵 2 new tests fail — plain-colon project regex not working
248 " 🔵 Plain-colon regex requires whitespace after colon — CJK text has none
249 9:02p 🔴 Fixed plain-colon regex — changed space requirement from + to *
250 " 🔵 ResumeParserService assigns description to url field for plain-colon lines
251 " 🔴 Fixed ResumeParserService url/description mixup for plain-colon lines
252 9:03p ✅ All 143 tests pass after full-width colon fix
253 " 🔴 Personal project parser now handles full-width Chinese colons
254 " ✅ Production build succeeds after webpack cache reset
255 9:05p ✅ Added Chinese full-width-colon projects to mock resume data
256 " 🔵 OfferPath uses output: standalone — next start warns
257 9:09p ✅ Browser verification: project name bold, description normal across 9 templates
258 9:25p 🔵 Four new UI bugs identified in resume editor
259 " 🔵 Item gap setting only applies to top-level entries, not sub-elements
260 " 🔵 ElegantTwoColumn template skips photo/headshot rendering
261 9:28p 🔵 Four new bugs reported in OfferPath resume builder
262 " 🔵 ProjectEntryContent component centralized in EditableText.tsx
263 " 🔵 Next.js dev server startup failures and port conflicts
264 9:45p 🔴 Fixed theme zero-values ignored by `||` operator
265 " 🔴 ElegantTwoColumn flex-column gap doubled section spacing
266 " 🟣 Added headshot support to ElegantTwoColumn template
267 " 🔴 Fixed ParameterSlider overflow on narrow panels
268 9:48p 🔵 Personal project display issue: all text bold+primary instead of name only
269 " ✅ OfferPath build succeeds; server starts on port 3000
**270** 9:49p 🔵 **Project name bold but not primary; description weight already correct**
Browser verification via Playwright confirms that on the preview-templates page, only the project name is bold (fontWeight 700) — descriptions and links are normal weight (400). However, the project name uses default slate-900 text color rather than a primary/accent color. The user's original complaint about "all text in bold" may have already been partially fixed by earlier ProjectEntryContent work, or the issue may only manifest in the editor view or specific templates. The "primary color" part of the complaint is confirmed: name is not in primary color on preview-templates.
~315t 🔍 3,152

271 " 🔵 ElegantTwoColumn template missing headshot/photo slot
**272** " 🔵 **ElegantTwoColumn does support photo section; earlier belief was wrong**
Correction to earlier finding: ElegantTwoColumn template does support the photo/headshot section. It renders HeadshotUpload at line 139, conditionally shown via sectionVisibility. The component uses square radius (0) rather than circular, which may explain why the Playwright detection script (looking for borderRadius '50%') didn't find it. The earlier claim that line 149 skips the photo key was incorrect — that line is part of the section-order mapping for left/right columns, not a photo skip.
~307t 🔍 3,359

**273** " 🔵 **ElegantTwoColumn headshot slot confirmed present (96px circle)**
Targeted Playwright verification scoped to #template-elegant-two-column confirms the headshot/photo slot renders as a 96px circle. This corrects the earlier false-negative from the first verification script which used a different detection approach. The code shows radius={0} but the result is circular, suggesting HeadshotUpload component defaults to circular styling or the `circular` prop overrides the radius prop.
~235t 🔍 41,608

**274** " ✅ **Visual verification screenshots captured for two templates**
Visual verification screenshots captured for two resume template previews on /preview-templates page. Used for confirming headshot rendering and project entry styling visually.
~147t 🛠️ 1,848

**275** 9:50p 🔵 **ElegantTwoColumn headshot visually confirmed via screenshot**
Visual verification of ElegantTwoColumn headshot rendering completed by viewing the captured screenshot. Confirms the template supports photo display, correcting the earlier misconception that it skipped the photo section entirely.
~154t 🔍 166,348


Access 1048k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>