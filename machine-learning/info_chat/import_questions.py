"""Append questions from a collection workbook to data/collected_questions.csv.

Workbook layout (same as data/AURA-DATASET-4.xlsx): row 1 is a header; column A holds the
intent as "<English question>\\n<Filipino question>"; every other column in the row is one
question. Any number of question columns is accepted. Rows are matched to intents.json by
the English question on the first line of column A.

Usage (from machine-learning/):
    python -m info_chat.import_questions data/AURA-DATASET-5.xlsx client-r3
    python -m info_chat.import_questions data/AURA-DATASET-5.xlsx client-r3 --dry-run

Questions already in the CSV (same text and intent) are skipped. The CSV is backed up to
collected_questions.bak.csv before it is changed.
"""

from __future__ import annotations

import argparse
import csv
import json
import shutil
import sys
from pathlib import Path

from openpyxl import load_workbook

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from info_chat.config import COLLECTED_PATH, HERE, INTENTS_PATH  # noqa: E402


def norm(text: str) -> str:
    return " ".join(text.lower().split())


def read_workbook(path: Path, intent_by_english: dict[str, str]) -> tuple[list[dict], list[str]]:
    sheet = load_workbook(path, read_only=True, data_only=True).worksheets[0]
    rows, problems = [], []
    for number, cells in enumerate(sheet.iter_rows(min_row=2, values_only=True), start=2):
        label = str(cells[0] or "").strip()
        if not label:
            continue
        intent_id = intent_by_english.get(norm(label.splitlines()[0]))
        if intent_id is None:
            problems.append(f"row {number}: no intent matches {label.splitlines()[0]!r}")
            continue
        for cell in cells[1:]:
            text = " ".join(str(cell or "").split())
            if text:
                rows.append({"text": text, "intent_id": intent_id})
    return rows, problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("workbook", type=Path)
    parser.add_argument("source", help="value for the source column, e.g. client-r3")
    parser.add_argument("--dry-run", action="store_true", help="report only, change nothing")
    args = parser.parse_args()

    intents = json.loads(INTENTS_PATH.read_text(encoding="utf-8"))
    intent_by_english = {norm(item["questionEn"]): item["id"] for item in intents}

    rows, problems = read_workbook(args.workbook, intent_by_english)
    if problems:
        print("\n".join(problems), file=sys.stderr)
        print("Nothing written. Fix the intent cells above.", file=sys.stderr)
        return 1

    with COLLECTED_PATH.open(encoding="utf-8-sig", newline="") as handle:
        existing = list(csv.DictReader(handle))
    seen = {(norm(row["text"]), row["intent_id"]) for row in existing}

    new = []
    for row in rows:
        key = (norm(row["text"]), row["intent_id"])
        if key not in seen:
            seen.add(key)
            new.append({**row, "source": args.source})

    print(f"read {len(rows)} questions, {len(rows) - len(new)} duplicates skipped, {len(new)} new")
    if args.dry_run or not new:
        return 0

    shutil.copyfile(COLLECTED_PATH, HERE / "data" / "collected_questions.bak.csv")
    with COLLECTED_PATH.open("a", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["text", "intent_id", "source"])
        writer.writerows(new)
    print(f"appended to {COLLECTED_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
