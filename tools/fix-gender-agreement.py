# -*- coding: utf-8 -*-
import json
from pathlib import Path

base = Path(__file__).resolve().parents[1] / "locales"

fr = json.loads((base / "fr.json").read_text(encoding="utf-8"))
fr["home"]["martello"]["demoTitle"] = "Essayez-le avant de l'acheter."
fr["free"]["ideasBody"] = (
    "Un petit utilitaire audio vous manque ici ? "
    "Écrivez-nous — on peut en tenir compte pour la suite."
)
(base / "fr.json").write_text(
    json.dumps(fr, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)

# Confirm gendered demo titles (Martello = masculine)
expected = {
    "it": "Provalo prima di acquistarlo.",
    "es": "Pruébalo antes de comprarlo.",
    "fr": "Essayez-le avant de l'acheter.",
    "de": "Teste ihn, bevor du kaufst.",
    "ru": "Сначала попробуйте его.",
    "uk": "Спочатку спробуйте його.",
}

out = []
for lang, want in expected.items():
    path = base / f"{lang}.json"
    data = json.loads(path.read_text(encoding="utf-8"))
    # ensure DE/RU/UK written if previous run applied them
    data["home"]["martello"]["demoTitle"] = want
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    intro = data["home"]["martello"]["introTitle"]
    out.append(f"{lang}: {want} | intro: {intro}")

# FR utilitaire
out.append("fr ideas: " + fr["free"]["ideasBody"])

# Bad feminine leftovers
bad = []
for lang in expected:
    text = (base / f"{lang}.json").read_text(encoding="utf-8")
    for s in [
        "Provala",
        "acquistarla",
        "Pruébala",
        "cómprala",
        "Essayez-la",
        "Une petite utilitaire",
        "Nata per",
        "Nacida para",
        "Conçue pour",
    ]:
        if s in text:
            bad.append(f"{lang}:{s}")
out.append("bad leftovers: " + (", ".join(bad) if bad else "none"))

qa = Path(__file__).resolve().parents[1] / "tools" / "gender-qa.txt"
qa.write_text("\n".join(out) + "\n", encoding="utf-8")
print("ok")
