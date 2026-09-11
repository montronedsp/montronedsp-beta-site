/**
 * Browser-side Ableton Live Set downgrade engine (Live 12 -> Live 11.x).
 * Clean-room port of the local alsdowngrade transform rules.
 * Runs entirely in the browser — originals are never written back to disk.
 */
(function (global) {
  "use strict";

  // Documented fingerprints only — do not invent SchemaChangeCount / MinorVersion.
  const TARGETS = {
    "11.2": {
      id: "11.2.11",
      MajorVersion: "5",
      MinorVersion: "11.0_11202",
      SchemaChangeCount: "17",
      Creator: "Ableton Live 11.2.11",
      Revision: "6e9e7c6913378fcbbe8b18e3fd8f33d0755968b8",
      source: "Public Live 11.2.11 Library.cfg / templates",
    },
    "11.2.11": {
      id: "11.2.11",
      MajorVersion: "5",
      MinorVersion: "11.0_11202",
      SchemaChangeCount: "17",
      Creator: "Ableton Live 11.2.11",
      Revision: "6e9e7c6913378fcbbe8b18e3fd8f33d0755968b8",
      source: "Public Live 11.2.11 Library.cfg / templates",
    },
    "11.2.7": {
      id: "11.2.7",
      MajorVersion: "5",
      MinorVersion: "11.0_11202",
      SchemaChangeCount: "11",
      Creator: "Ableton Live 11.2.7",
      Revision: "2509d781e7fb8da117f2c3c7f697e1116a198306",
      source: "Public Live 11.2.7 Library.cfg samples",
    },
    "11.3": {
      id: "11.3.21",
      MajorVersion: "5",
      MinorVersion: "11.0_11300",
      SchemaChangeCount: "3",
      Creator: "Ableton Live 11.3.21",
      Revision: "5ac24cad7c51ea0671d49e6b4885371f15b57c1e",
      source: "mslinn/live_set (MIT) documented target",
    },
    "11.3.21": {
      id: "11.3.21",
      MajorVersion: "5",
      MinorVersion: "11.0_11300",
      SchemaChangeCount: "3",
      Creator: "Ableton Live 11.3.21",
      Revision: "5ac24cad7c51ea0671d49e6b4885371f15b57c1e",
      source: "mslinn/live_set (MIT) documented target",
    },
    "11.1": {
      id: "11.1",
      MajorVersion: "5",
      MinorVersion: "11.0_436",
      SchemaChangeCount: "7",
      Creator: "Ableton Live 11.1",
      Revision: "",
      source: "drj-io/abletron versions.js (MIT)",
    },
    "11.0": {
      id: "11.0.12",
      MajorVersion: "5",
      MinorVersion: "11.0_433",
      SchemaChangeCount: "6",
      Creator: "Ableton Live 11.0.12",
      Revision: "",
      source: "drj-io/abletron versions.js (MIT)",
    },
    "11": null, // alias resolved below
  };
  TARGETS["11"] = TARGETS["11.2"];

  const REMOVE_TAGS = [
    "ContentLanes",
    "ExpressionLanes",
    "InstrumentMeld",
    "Roar",
    "MxPatchRef",
    "Oversampling",
  ];

  const CONSERVATIVE_BLOCKERS = new Set([
    "InstrumentMeld",
    "Roar",
    "ContentLanes",
    "ExpressionLanes",
  ]);

  const MAX_DECOMPRESSED = 1024 * 1024 * 1024;
  const MAX_RATIO = 200;

  function resolveTarget(target) {
    const key = String(target || "11.2").trim().toLowerCase().replace(/^live\s*/, "");
    const fp = TARGETS[key];
    if (!fp) {
      throw new Error(
        "Unsupported target '" +
          target +
          "'. Choose 11.2, 11.2.7, 11.2.11, 11.3, 11.1, or 11.0."
      );
    }
    return fp;
  }

  function creatorMatch(creator) {
    const m = /Ableton Live\s+(\d+)(?:\.(\d+))?(?:\.(\d+))?/i.exec(creator || "");
    if (!m) return null;
    return {
      major: Number(m[1]),
      minor: m[2] != null ? Number(m[2]) : null,
      patch: m[3] != null ? Number(m[3]) : null,
    };
  }

  function minorMatch(minor) {
    const m = /^(\d+)\.(\d+)_(\d+)$/.exec((minor || "").trim());
    if (!m) return null;
    return { major: Number(m[1]), minor: Number(m[2]), token: m[3] };
  }

  function parseVersion(root) {
    const creator = root.getAttribute("Creator") || "";
    const majorVersion = root.getAttribute("MajorVersion") || "";
    const minorVersion = root.getAttribute("MinorVersion") || "";
    const schema = root.getAttribute("SchemaChangeCount") || "";
    const revision = root.getAttribute("Revision") || "";
    const c = creatorMatch(creator);
    const n = minorMatch(minorVersion);
    const marketingMajor = c ? c.major : n ? n.major : null;
    return {
      creator,
      majorVersion,
      minorVersion,
      schema,
      revision,
      marketingMajor,
      label: c
        ? [c.major, c.minor, c.patch].filter((x) => x != null).join(".")
        : n
          ? String(n.major) + "." + String(n.minor)
          : "UNKNOWN",
    };
  }

  async function gunzip(bytes) {
    if (bytes.length < 2 || bytes[0] !== 0x1f || bytes[1] !== 0x8b) {
      throw new Error("Not a gzip-compressed .als (missing gzip magic)");
    }
    if (typeof DecompressionStream === "undefined") {
      throw new Error("This browser cannot decompress gzip (DecompressionStream missing)");
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    const out = new Uint8Array(await new Response(stream).arrayBuffer());
    if (out.byteLength > MAX_DECOMPRESSED) {
      throw new Error("Decompressed XML exceeds size limit");
    }
    if (out.byteLength / Math.max(bytes.length, 1) > MAX_RATIO) {
      throw new Error("Suspicious compression ratio");
    }
    return out;
  }

  async function gzip(bytes) {
    if (typeof CompressionStream === "undefined") {
      throw new Error("This browser cannot compress gzip (CompressionStream missing)");
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  function decodeUtf8(bytes) {
    return new TextDecoder("utf-8").decode(bytes);
  }

  function encodeUtf8(text) {
    return new TextEncoder().encode(text);
  }

  function parseXml(xmlText) {
    if (/<!DOCTYPE/i.test(xmlText) || /<!ENTITY/i.test(xmlText)) {
      throw new Error("XML contains DOCTYPE/ENTITY (blocked for XXE safety)");
    }
    const doc = new DOMParser().parseFromString(xmlText, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) throw new Error("XML parse failed");
    const root = doc.documentElement;
    if (!root || root.tagName !== "Ableton") {
      throw new Error("Expected root <Ableton>");
    }
    if (!root.querySelector(":scope > LiveSet") && !root.getElementsByTagName("LiveSet").length) {
      throw new Error("Missing required <LiveSet> child");
    }
    return doc;
  }

  function serializeXml(doc) {
    const serialized = new XMLSerializer().serializeToString(doc);
    if (serialized.startsWith("<?xml")) return serialized;
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + serialized;
  }

  function countTags(root, tag) {
    return root.getElementsByTagName(tag).length;
  }

  function removeAllTags(doc, tag) {
    let removed = 0;
    let nodes = Array.from(doc.getElementsByTagName(tag));
    while (nodes.length) {
      nodes.forEach((node) => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
          removed += 1;
        }
      });
      nodes = Array.from(doc.getElementsByTagName(tag));
    }
    return removed;
  }

  function replaceInTree(root, oldStr, newStr) {
    let count = 0;
    const walk = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        for (const attr of Array.from(node.attributes || [])) {
          if (attr.value && attr.value.indexOf(oldStr) !== -1) {
            node.setAttribute(attr.name, attr.value.split(oldStr).join(newStr));
            count += 1;
          }
        }
      }
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.indexOf(oldStr) !== -1) {
        node.nodeValue = node.nodeValue.split(oldStr).join(newStr);
        count += 1;
      }
      for (const child of Array.from(node.childNodes || [])) walk(child);
    };
    walk(root);
    return count;
  }

  function snapshot(root) {
    const tracksParent = root.querySelector("LiveSet > Tracks") || root.getElementsByTagName("Tracks")[0];
    let audio = 0,
      midi = 0,
      group = 0,
      ret = 0,
      other = 0;
    if (tracksParent) {
      Array.from(tracksParent.children).forEach((child) => {
        const t = child.tagName;
        if (t === "AudioTrack") audio += 1;
        else if (t === "MidiTrack") midi += 1;
        else if (t === "GroupTrack") group += 1;
        else if (t === "ReturnTrack") ret += 1;
        else other += 1;
      });
    }
    const tempoEl = root.querySelector("Tempo > Manual") || root.getElementsByTagName("Manual")[0];
    return {
      tracks: audio + midi + group + ret + other,
      audioTracks: audio,
      midiTracks: midi,
      audioClips: countTags(root, "AudioClip"),
      midiClips: countTags(root, "MidiClip"),
      midiNotes: countTags(root, "MidiNoteEvent"),
      plugins: countTags(root, "PluginDevice"),
      tempo: tempoEl ? tempoEl.getAttribute("Value") : null,
    };
  }

  function findBlockers(root) {
    const blockers = {};
    REMOVE_TAGS.forEach((tag) => {
      const n = countTags(root, tag);
      if (n) blockers[tag] = n;
    });
    return blockers;
  }

  function formatInspect(filename, version, snap, blockers) {
    const lines = [
      "Ableton Live Set",
      "Path: " + filename,
      "Creator: " + version.creator,
      "Internal MajorVersion: " + version.majorVersion,
      "MinorVersion: " + version.minorVersion,
      "SchemaChangeCount: " + version.schema,
      "Revision: " + version.revision,
      "Detected marketing version: " + version.label,
      "Tracks: " + snap.tracks,
      "Audio tracks: " + snap.audioTracks,
      "MIDI tracks: " + snap.midiTracks,
      "Audio clips: " + snap.audioClips,
      "MIDI clips: " + snap.midiClips,
      "MIDI note events: " + snap.midiNotes,
      "Third-party plugin devices: " + snap.plugins,
      "Tempo: " + (snap.tempo || "UNKNOWN"),
    ];
    if (Object.keys(blockers).length) {
      lines.push("Potential downgrade blockers:");
      Object.keys(blockers)
        .sort()
        .forEach((tag) => lines.push("  - " + tag + " x " + blockers[tag]));
    } else {
      lines.push("Potential downgrade blockers: none detected by current rules");
    }
    lines.push("");
    lines.push("ORIGINAL FILE IS NEVER MODIFIED by inspect.");
    lines.push("Engine: in-browser (published unlisted page)");
    return lines.join("\n");
  }

  async function inspectAls(fileBytes, filename) {
    const xmlBytes = await gunzip(fileBytes);
    const doc = parseXml(decodeUtf8(xmlBytes));
    const root = doc.documentElement;
    const version = parseVersion(root);
    const snap = snapshot(root);
    const blockers = findBlockers(root);
    return {
      ok: true,
      filename: filename || "set.als",
      creator: version.creator,
      major_version: version.majorVersion,
      minor_version: version.minorVersion,
      schema_change_count: version.schema,
      label: version.label,
      report_text: formatInspect(filename || "set.als", version, snap, blockers),
      tracks: snap.tracks,
      audio_clips: snap.audioClips,
      midi_clips: snap.midiClips,
      blockers,
    };
  }

  async function convertAls(fileBytes, filename, mode, target) {
    mode = (mode || "compatible").toLowerCase();
    const fp = resolveTarget(target || "11.2");
    const xmlBytes = await gunzip(fileBytes);
    let xmlText = decodeUtf8(xmlBytes);
    const doc = parseXml(xmlText);
    const root = doc.documentElement;
    const version = parseVersion(root);
    const before = snapshot(root);
    const blockers = findBlockers(root);

    const is12 = version.marketingMajor === 12 || (minorMatch(version.minorVersion) || {}).major === 12;
    const is11 = version.marketingMajor === 11 || (minorMatch(version.minorVersion) || {}).major === 11;

    if (is11 && !is12) {
      return {
        ok: false,
        report: {
          outcome: "REFUSED_UNSUPPORTED",
          reason: "Source already appears to be Live 11 family; nothing to downgrade.",
          source_creator: version.creator,
          target_label: fp.id,
          mode,
          live_open_verified: false,
          original_untouched: true,
        },
      };
    }
    if (!is12) {
      return {
        ok: false,
        report: {
          outcome: "REFUSED_UNSUPPORTED",
          reason:
            "Source does not look like Live 12 (Creator=" +
            JSON.stringify(version.creator) +
            "). Milestone 1 only converts 12->11.x.",
          source_creator: version.creator,
          target_label: fp.id,
          mode,
          live_open_verified: false,
          original_untouched: true,
        },
      };
    }

    if (mode === "conservative") {
      const present = Object.keys(blockers).filter((t) => CONSERVATIVE_BLOCKERS.has(t));
      if (present.length) {
        const detail = present.map((t) => t + " x" + blockers[t]).join(", ");
        return {
          ok: false,
          report: {
            outcome: "REFUSED_UNSUPPORTED",
            reason:
              "Conversion refused safely. Original file untouched.\nReason: Conservative mode found known Live 12-only constructs: " +
              detail +
              ". Re-run with Compatible or Salvage.",
            source_creator: version.creator,
            target_label: fp.id,
            mode,
            live_open_verified: false,
            original_untouched: true,
          },
        };
      }
    }

    const modified = [];
    const removed = [];
    const warnings = [];

    root.setAttribute("MajorVersion", fp.MajorVersion);
    root.setAttribute("MinorVersion", fp.MinorVersion);
    root.setAttribute("SchemaChangeCount", fp.SchemaChangeCount);
    root.setAttribute("Creator", fp.Creator);
    if (fp.Revision) root.setAttribute("Revision", fp.Revision);
    else root.setAttribute("Revision", "");
    modified.push("Set root to " + fp.Creator + " (" + fp.MinorVersion + ", schema " + fp.SchemaChangeCount + ")");

    const routeHits = replaceInTree(root, "AudioOut/Main", "AudioOut/Master");
    if (routeHits) modified.push("AudioOut/Main -> AudioOut/Master");

    const shouldRemove = mode === "compatible" || mode === "salvage";
    if (shouldRemove) {
      REMOVE_TAGS.forEach((tag) => {
        const n = removeAllTags(doc, tag);
        if (n) {
          removed.push(n + "x Removed <" + tag + ">");
          if (tag === "InstrumentMeld" || tag === "Roar") {
            warnings.push("Removed " + n + "x <" + tag + "> (Live 12 native device)");
          }
        }
      });
    }

    let outXml = serializeXml(doc);
    outXml = outXml.split("AudioOut/Main").join("AudioOut/Master");
    const outDoc = parseXml(outXml);
    const after = snapshot(outDoc.documentElement);

    const losses = [];
    ["tracks", "audioClips", "midiClips", "midiNotes", "plugins"].forEach((key) => {
      if (after[key] < before[key]) losses.push(key + ": " + before[key] + " -> " + after[key]);
    });
    if (losses.length) {
      return {
        ok: false,
        report: {
          outcome: "INVALID_INPUT",
          reason: "Structural validation failed: " + losses.join("; "),
          source_creator: version.creator,
          target_label: fp.id,
          mode,
          live_open_verified: false,
          original_untouched: true,
        },
      };
    }

    const compressed = await gzip(encodeUtf8(outXml));
    const reopened = parseXml(decodeUtf8(await gunzip(compressed)));
    if (!reopened.documentElement || reopened.documentElement.tagName !== "Ableton") {
      throw new Error("Round-trip validation failed");
    }

    const stem = (filename || "Set").replace(/\.als$/i, "") || "Set";
    const outName = stem + "_Live" + fp.id.replace(/\./g, "_") + "_downgraded.als";
    const report = {
      outcome: warnings.length ? "SUCCESS_WITH_WARNINGS" : "EXPERIMENTAL",
      source_creator: version.creator,
      target_label: fp.id,
      mode,
      preserved: {
        tracks: after.tracks,
        midi_clips: after.midiClips,
        audio_clips: after.audioClips,
        midi_notes: after.midiNotes,
        plugin_devices: after.plugins,
        tempo: after.tempo || "",
      },
      modified,
      removed,
      warnings,
      validation_messages: ["Layer6 real Ableton Live opening test: NOT YET VERIFIED"],
      live_open_verified: false,
      original_untouched: true,
      engine: "browser",
    };

    return {
      ok: true,
      filename: outName,
      bytes: compressed,
      report,
    };
  }

  global.AlsConverterEngine = {
    inspectAls,
    convertAls,
    resolveTarget,
    TARGETS,
  };
})(typeof window !== "undefined" ? window : globalThis);
