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
| `git push -u origin <branch>` | First push of a new branch and set upstream. |

---

## Resolving merge conflicts

When you see `<<<<<<<`, `=======`, `>>>>>>>` in a file:

1. Open the file and choose which version to keep (or combine both).
2. Delete the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. `git add <file>`
4. `git commit -m "Resolve merge conflict"`

---

**Tip:** Run `git status` often to see what’s staged and what’s not.
