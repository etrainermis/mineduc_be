#!/usr/bin/env python3
"""PolinRider guard - fails CI if this repository contains PolinRider malware.

Standard library only; never executes repository code. Scans the files
tracked by git. Source of truth: rtb_infrastructure/security/polinrider-guard.
Usage: python3 .github/polinrider-guard/guard.py [repo_dir]
"""
import json, os, re, subprocess, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
# Obfuscated loader signatures seen in the 2026 PolinRider campaign.
SIGNATURE = re.compile(rb"global\[.!.\]|global\.i *=|_0x[0-9a-f]{4,6}\(0x")
# Code hidden off-screen: a long run of spaces/tabs followed by more code.
PADDING = re.compile(rb"[ \t]{300,}\S")
CODE_EXT = (".js", ".mjs", ".cjs", ".ts", ".mts", ".cts", ".jsx", ".tsx", ".json")
FONT_EXT = (".woff2", ".woff", ".ttf", ".eot", ".otf", ".llf")
# Files that list the signatures on purpose (the team's own detector, this guard).
ALLOW = {"scripts/repository-safety-rules.mjs", "scripts/check-repository-safety.mjs",
         ".github/polinrider-guard/guard.py"}
GITIGNORE_HIDING = {"config.bat", "temp_auto_push.bat", "temp_interactive_push.bat",
                    "branch_structure.json", ".gitignore"}
BAD_SCRIPT = re.compile(r"node\s+(\./)?(api\.js|dist/setup\.js)|fonts/[^\s\"']+\.(woff2?|llf|ttf|eot)")

findings = []


def report(path, why):
    findings.append((path, why))
    print(f"::error file={path}::PolinRider indicator: {why}")


def tracked_files():
    r = subprocess.run(["git", "-C", ROOT, "ls-files", "-z"], capture_output=True)
    if r.returncode == 0:
        return [p for p in r.stdout.decode("utf8", "surrogateescape").split("\0") if p]
    # Not a git checkout (e.g. an exported tree): walk the files instead.
    found = []
    for d, dirs, files in os.walk(ROOT):
        dirs[:] = [x for x in dirs if x not in (".git", "node_modules")]
        found += [os.path.relpath(os.path.join(d, f), ROOT) for f in files]
    return found


def read(path):
    try:
        with open(os.path.join(ROOT, path), "rb") as f:
            return f.read()
    except (IsADirectoryError, FileNotFoundError):  # submodules, deleted-but-tracked
        return None


def real_signature(data):
    for m in SIGNATURE.finditer(data):
        if m.start() > 0 and data[m.start() - 1:m.start()] in (b'"', b"'"):
            continue  # quoted indicator in a detection list
        return True
    return False


for path in tracked_files():
    if path in ALLOW:
        continue
    lower = path.lower()
    data = read(path)
    if data is None:
        continue
    base = os.path.basename(lower)

    if lower.endswith(FONT_EXT) and "fonts/" in lower:
        if lower.endswith(".llf"):
            report(path, "fake font file (.llf is not a font format)")
        elif len(data) == 0 or real_signature(data[:200000]):
            report(path, "fake font file containing JavaScript")
        elif lower.endswith((".woff", ".woff2")) and not data.startswith((b"wOFF", b"wOF2")):
            report(path, "file named like a web font but is not one")
        continue

    if b"\0" in data[:8000]:
        continue  # other binary files
    if real_signature(data):
        report(path, "obfuscated loader signature")
        continue
    if lower.endswith(CODE_EXT) and PADDING.search(data):
        report(path, "code hidden after a long run of whitespace")
        continue

    if path == ".vscode/tasks.json":
        text = data.decode("utf8", "replace")
        if "folderOpen" in text and re.search(r"\bnode\b", text):
            report(path, "VS Code task that runs node automatically when the folder is opened")
    elif path == ".vscode/settings.json":
        if re.search(rb'"task\.allowAutomaticTasks"\s*:\s*(true|"on")', data):
            report(path, "VS Code automatic tasks enabled without prompting")
    elif base == "package.json":
        try:
            scripts = json.loads(data.decode("utf8", "replace")).get("scripts") or {}
        except ValueError:
            scripts = {}
        for name, cmd in scripts.items():
            if isinstance(cmd, str) and BAD_SCRIPT.search(cmd):
                report(path, f'npm script "{name}" runs a PolinRider loader: {cmd}')
    elif path == ".gitignore":
        lines = {l.strip() for l in data.decode("utf8", "replace").splitlines()}
        hidden = sorted(lines & GITIGNORE_HIDING)
        if hidden:
            report(path, "ignores the malware's working files: " + ", ".join(hidden))

if findings:
    print(f"\nPolinRider guard: {len(findings)} indicator(s) found. Failing so nothing builds or deploys.")
    print("Do NOT open this repository in VS Code or run npm here. Contact RTB IT / Infrastructure.")
    sys.exit(1)
print("PolinRider guard: no indicators found.")
