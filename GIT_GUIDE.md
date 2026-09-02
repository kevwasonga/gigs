# Git & Commit Guide — GigConnect KE

This document defines the version-control conventions used throughout this project. **Every contributor (human or AI) must follow these rules.** They keep the history reviewable, reversible, and one-step-at-a-time — even though a full feature has many files, each logical unit lands as its own commit.

---

## 1. Core Policy: One Commit = One Logical Unit

This project uses a **one-file / one-commit** discipline during initial scaffolding:

- Each new file is created and committed **by itself** before the next file is started.
- If a change genuinely spans multiple related files (e.g. renaming a component used on every page), group them in that single commit and name it clearly.
- **Never** bundle many unrelated files into one "WIP" commit.

### Why
- Every commit is a clean rewind point.
- `git bisect` and `git diff` stay meaningful.
- Reviewers (or a future AI session) can see exactly what each file introduced.

---

## 2. Commit Message Convention

We use **Conventional Commits**. Format:

```
<type>(<scope>): <short summary>
```

| Type | When to use |
|------|-------------|
| `feat` | New page, component, or feature |
| `fix` | Bug correction |
| `docs` | Documentation (guides, README, checkpoints) |
| `style` | Formatting, no behavior change |
| `refactor` | Code change without behavior change |
| `chore` | Tooling, config, gitignore |
| `build` | Build/tooling related |
| `test` | Adding/updating tests |

### Examples
```
docs: add git and commit conventions
docs: add project spec consolidating design guides
chore: add gitignore for node_modules and env
feat(css): add core theme stylesheet
feat(home): add landing page
feat(admin): add listing management dashboard
```

### Rules
- Imperative mood, lower-case after the type: `feat(css): add theme`.
- Keep the subject under ~72 characters.
- Reference a milestone or checkpoint when relevant in the body, e.g. `feat(admin): ... (milestone 5, checkpoint 6)`.

---

## 3. Branching Strategy

- `main` is the **protected** default branch and always holds a working build.
- Work happens on short-lived branches named by convention:
  - `feat/<slug>` — feature work
  - `fix/<slug>` — bug fixes
  - `docs/<slug>` — documentation
- Merge to `main` with a **squash merge** so each feature/milestone is one clean commit on `main`.
- Delete the feature branch after merge.

---

## 4. Workflow (per milestone)

1. **Pull latest** `main`.
2. **Branch** off `main`: `git checkout -b feat/<slug>`.
3. Build the milestone with **one file one commit** as defined in Section 1.
4. Verify (run the checks listed in `CHECKPOINTS.md` for that step).
5. **Squash merge** back to `main` and delete the branch.
6. Update `CHECKPOINTS.md` noting the passed checkpoint (and commit that too).

---

## 5. What NOT to Commit

- `node_modules/`
- `.env` / `.env.local` (Supabase keys must stay out of the repo — see `supabase-config.example.js`)
- Build output (`dist/`, `.next/`, `out/`)
- OS junk (`.DS_Store`, `Thumbs.db`)
- Editor/IDE folders (`.vscode/`, `.idea/`) unless a team-standard config is intentional
- Logs, local databases, temporary files

Add these to `.gitignore` (see the `.gitignore` commit in this repo) — never force-add them.

---

## 6. Commands Cheat Sheet

```bash
# start work on a new branch
git checkout -b feat/my-feature

# stage one file and commit it
git add path/to/file
git commit -m "feat(css): add core theme stylesheet"

# commit multiple related files in one logical unit
git add src/component.js src/component.test.js
git commit -m "feat(component): add button with tests"

# verify what will/just changed
git status
git diff --staged

# squash-merge a feature branch into main
git checkout main
git pull
git merge --squash feat/my-feature
git commit -m "feat(my-feature): <summary of the whole branch>"
git branch -d feat/my-feature
```

---

## 7. Config & Secrets Handling

Supabase URL and anon key are **environment/configuration**, never committed as literals.

- Commit `js/supabase-config.example.js` with placeholder values.
- The real `js/supabase-config.js` is git-ignored and filled in locally / via your host's env vars.
- If a secret is ever committed, rotate it immediately and remove it from history with `git filter-repo` (do not rely on deleting the file alone).

---

## 8. Definitions of Done

A commit is "done" only when:

- [ ] It compiles/loads without error.
- [ ] It passes the relevant checks in `CHECKPOINTS.md`.
- [ ] No secrets are in the diff.
- [ ] The message follows Conventional Commits.
- [ ] The working tree is clean after the commit (`git status` shows nothing to commit).
