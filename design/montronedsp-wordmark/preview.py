"""Serve the actual local website with the review artwork in its shared header."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

DESIGN = Path(__file__).resolve().parent
SITE = DESIGN.parents[1]
HEADER = SITE / "assets/branding/montrone_dsp_logo_header_mono.svg"
ARTWORK = {
    "original": HEADER,
    "A": DESIGN / "concepts/A-lockup.svg",
    "B": DESIGN / "concepts/B-lockup.svg",
    "C": DESIGN / "concepts/C-lockup.svg",
    "final": DESIGN / "master/montronedsp-lockup.svg",
}


class HeaderPreview(SimpleHTTPRequestHandler):
    def __init__(self, *args, artwork, **kwargs):
        self.artwork = artwork
        super().__init__(*args, directory=str(SITE), **kwargs)

    def translate_path(self, path):
        resolved = Path(super().translate_path(path))
        return str(self.artwork if resolved == HEADER else resolved)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artwork", choices=ARTWORK, default="final")
    parser.add_argument("--port", type=int, default=63126)
    args = parser.parse_args()
    handler = partial(HeaderPreview, artwork=ARTWORK[args.artwork])
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"{args.artwork} header at http://127.0.0.1:{server.server_port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
