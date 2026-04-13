# AFL Footy Stars — Feature Development Prompts

This folder contains sub-agent prompt files for the v1.1 feature development cycle. Each file is self-contained and can be handed to a separate AI coding agent (Claude Code, Codex, etc.) to work on independently or in parallel.

---

## Files

| File | Category | Features | Priority |
|------|----------|----------|----------|
| `01_GAMEPLAY.md` | Gameplay | Position-specific roles, energy management, tactical setup, injury rehab | High |
| `02_PROGRESSION.md` | Progression | Legacy score, captaincy, retirement planning, attribute decline | High |
| `03_SOCIAL_MEDIA.md` | Social & Media | Fan mail, club culture archetypes, rivalry expansion | Medium |
| `04_POLISH_UX.md` | Polish & UX | Draft bug fix, save slots, highlights reel, onboarding tips | High |
| `05_CONTENT.md` | Content | Training mini-games, club history, AFLW path | Medium |

---

## Recommended merge order

Run agents in this order to minimise merge conflicts:

1. **`04_POLISH_UX.md` first** — the save slot system changes the localStorage key; get this merged before other agents touch GameContext
2. **`01_GAMEPLAY.md` + `02_PROGRESSION.md` in parallel** — different utils files, low overlap
3. **`03_SOCIAL_MEDIA.md`** — builds on the CareerEvent system; wait for Gameplay/Progression to stabilise
4. **`05_CONTENT.md` last** — purely additive content, lowest conflict risk

---

## Files touched by multiple agents — coordinate carefully

| File | Agents that modify it |
|------|-----------------------|
| `context/GameContext.tsx` | ALL agents touch this — merge carefully |
| `types.ts` | Most agents add types here — resolve conflicts before merging |
| `constants.ts` | Gameplay, Progression, and Content agents all modify this |
| `utils/seasonUtils.ts` | Progression agent only |
| `utils/simulationUtils.ts` | Gameplay agent only |

---

## Universal constraints for all agents

- **Never remove fields from `PlayerProfile`** — only add optional (`?`) fields to preserve save compatibility
- **Zero TypeScript errors** — run `npm run build` before finishing; a clean build is required
- **Mobile-first** — all new UI must work on small screens using Tailwind responsive classes
- **Read `CLAUDE.md` first** — it covers architecture, patterns, and common pitfalls
- **LocalStorage key** — `'footyLegendSave'` for single save; `'footyLegendSave_slotN'` after save slots are added (04_POLISH_UX)
