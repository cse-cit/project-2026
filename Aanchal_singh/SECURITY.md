# Security notes

- Do NOT commit secrets (API keys, credentials) to the repository. Use `.env` files locally and add them to `.gitignore`.
- If a secret was accidentally committed (for example API keys in `client/.env` or built artifacts), rotate the secret immediately and purge it from Git history using `git filter-repo` or the BFG Repo-Cleaner.

Recommended steps to fully remove a leaked secret:

1. Rotate the exposed secret (create a new key and revoke the old one).
2. Run a history rewrite to remove the secret from all commits, for example using `git filter-repo`:

```bash
pip install git-filter-repo
git clone --mirror <repo-url> repo.git
cd repo.git
git filter-repo --replace-text replacements.txt
git push --force
```

Where `replacements.txt` contains the secret to replace (see `git-filter-repo` docs).

3. Invalidate any tokens that were exposed.
4. Communicate with collaborators if the leak affects production systems.

This repository includes a helper script `scripts/clean_repo.ps1` to remove common committed artifacts (build directories, local `.env`) and to scan for obvious key patterns.