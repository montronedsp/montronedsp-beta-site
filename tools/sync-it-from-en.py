"""Sync Italian locale values to English master (structure + wording parity).

English remains the source of truth. Italian strings are replaced with the
current English master so the two locales stay aligned. Re-translate later
from this baseline.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EN = ROOT / "locales" / "en.json"
IT = ROOT / "locales" / "it.json"


def deep_sync(en_node, it_node):
    """Return a tree with EN keys/values; preserve IT-only keys if any."""
    if isinstance(en_node, dict):
        out = {}
        it_dict = it_node if isinstance(it_node, dict) else {}
        for key, value in en_node.items():
            out[key] = deep_sync(value, it_dict.get(key))
        return out
    # Leaf: English master wins
    return en_node


def main() -> None:
    en = json.loads(EN.read_text(encoding="utf-8"))
    it = json.loads(IT.read_text(encoding="utf-8"))
    synced = deep_sync(en, it)
    IT.write_text(
        json.dumps(synced, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(f"synced {IT} from English master")


if __name__ == "__main__":
    main()
