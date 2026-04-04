# Git commands — short reference

Quick reference for common Git commands and what they do.

---

## Setup & clone

| Command | Explanation |
|--------|-------------|
| `git clone <url>` | Copy a repo from a URL to your machine. |
| `git config user.name "Your Name"` | Set your name for commits (local repo). |
| `git config user.email "you@example.com"` | Set your email for commits (local repo). |

---

## Daily workflow

| Command | Explanation |
|--------|-------------|
| `git status` | See which files changed and what’s staged. |
| `git add <file>` | Stage a file for the next commit. |
| `git add .` | Stage all changes in the current directory. |
| `git commit -m "message"` | Save staged changes with a short message. |
| `git push` | Send your commits to the remote (e.g. GitHub). |
| `git pull` | Get the latest commits from the remote and update your branch. |

---

## Branches

| Command | Explanation |
|--------|-------------|
| `git branch` | List local branches; current one has `*`. |
| `git branch <name>` | Create a new branch named `<name>`. |
| `git checkout <branch>` | Switch to another branch. |
| `git checkout -b <name>` | Create and switch to a new branch in one step. |
| `git merge <branch>` | Merge `<branch>` into the branch you’re on. |

### Publish a branch (push & set upstream)

After you commit on a **new** local branch, publish it to the remote and set **upstream** so later you can run plain `git push` / `git pull`:

```bash
git push -u origin <branch>
```

Example: `git push -u origin ai/building`

- **`-u`** (`--set-upstream`) links your local branch to `origin/<branch>`.
- Next time on that branch: `git push` and `git pull` use that remote branch automatically.

If the branch already exists on the remote but your local branch has no upstream:

```bash
git push -u origin HEAD
```

(or `git branch --set-upstream-to=origin/<branch>` after a manual push.)

### Merge a branch into `main`

Do this when you want your feature branch’s commits on **`main`** locally and on the remote.

1. **Finish your branch:** commit everything, then push it (see **Publish a branch**).
2. **Update `main` from the remote** (avoids merging an old `main`):

   ```bash
   git checkout main
   git pull origin main
   ```

3. **Merge your branch into `main`** (run while `main` is checked out):

   ```bash
   git merge <branch>
   ```

   Example: `git merge ai/building`

4. **Push updated `main`:**

   ```bash
   git push origin main
   ```

If Git reports **merge conflicts**, fix them (see **Resolving merge conflicts**), then `git add` the files and complete the merge with `git commit` (Git opens an editor or use `git commit -m "Merge branch '<branch>'"`).

**Teams often use a pull request** on GitHub instead: push the branch, open a PR into `main`, review, then **Merge** on the website. That keeps history and review in one place; after the PR is merged, run `git checkout main` and `git pull origin main` on your machine to stay current.

---

## Undo & fix

| Command | Explanation |
|--------|-------------|
| `git restore <file>` | Discard unstaged changes in a file. |
| `git restore --staged <file>` | Unstage a file (keep the changes). |
| `git log --oneline` | Short list of recent commits. |
| `git diff` | Show unstaged changes. |
| `git diff --staged` | Show staged changes. |

---

## Remote

| Command | Explanation |
|--------|-------------|
| `git remote -v` | Show remote URLs (e.g. `origin`). |
| `git fetch` | Download latest from remote without merging. |
| `git push -u origin <branch>` | Publish a new branch and set upstream (see **Branches → Publish**). |
| `git push` | Push commits (after upstream is set for the current branch). |

---

## Resolving merge conflicts

When you see `<<<<<<<`, `=======`, `>>>>>>>` in a file:

1. Open the file and choose which version to keep (or combine both).
2. Delete the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. `git add <file>`
4. `git commit -m "Resolve merge conflict"`

---

**Tip:** Run `git status` often to see what’s staged and what’s not.
