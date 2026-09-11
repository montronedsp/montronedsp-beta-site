(() => {
  const els = {
    status: document.querySelector("[data-als-status]"),
    drop: document.querySelector("[data-als-drop]"),
    file: document.querySelector("[data-als-file]"),
    browse: document.querySelector("[data-als-browse]"),
    target: document.querySelector("[data-als-target]"),
    mode: document.querySelector("[data-als-mode]"),
    inspectBtn: document.querySelector("[data-als-inspect]"),
    convertBtn: document.querySelector("[data-als-convert]"),
    report: document.querySelector("[data-als-report]"),
    meta: document.querySelector("[data-als-meta]"),
  };

  let selectedFile = null;
  let lastDownloadUrl = null;

  function setStatus(kind, text) {
    if (!els.status) return;
    els.status.dataset.state = kind;
    els.status.textContent = text;
  }

  function setReport(text) {
    if (els.report) els.report.textContent = text || "";
  }

  function setMeta(file) {
    if (!els.meta) return;
    if (!file) {
      els.meta.textContent = "No file selected.";
      return;
    }
    const mb = (file.size / (1024 * 1024)).toFixed(2);
    els.meta.textContent = file.name + " · " + mb + " MB · original never modified";
  }

  function setBusy(busy) {
    [els.inspectBtn, els.convertBtn, els.browse, els.mode, els.target].forEach((el) => {
      if (el) el.disabled = busy;
    });
  }

  function engineReady() {
    return !!(window.AlsConverterEngine && window.AlsConverterEngine.convertAls);
  }

  function initStatus() {
    if (engineReady()) {
      setStatus(
        "ok",
        "Ready · in-browser converter (unlisted page · not in site navigation · files stay on your device)"
      );
      return true;
    }
    setStatus("err", "Converter engine failed to load. Refresh the page.");
    return false;
  }

  function pickFile(file) {
    if (!file) return;
    if (!/\.als$/i.test(file.name)) {
      setReport("Please choose an Ableton Live .als file.");
      return;
    }
    selectedFile = file;
    setMeta(file);
    setReport("Ready. Inspect or Downgrade — the source file on disk stays untouched.");
  }

  async function readFileBytes(file) {
    const buf = await file.arrayBuffer();
    return new Uint8Array(buf);
  }

  function formatConvertReport(report, outName) {
    const lines = [
      "Outcome: " + (report.outcome || "OK"),
      outName ? "Downloaded: " + outName : "",
      "ORIGINAL FILE IS NEVER MODIFIED",
      "Real Ableton Live opening test: NOT YET VERIFIED",
      "",
      "Source Creator: " + (report.source_creator || ""),
      "Target: Live " + (report.target_label || "11"),
      "Mode: " + (report.mode || ""),
      "Engine: " + (report.engine || "browser"),
    ].filter(Boolean);

    if (report.preserved) {
      lines.push("Preserved:");
      Object.keys(report.preserved).forEach((k) => {
        lines.push("  " + k + ": " + report.preserved[k]);
      });
    }
    if (report.modified && report.modified.length) {
      lines.push("Modified:");
      report.modified.forEach((m) => lines.push("  " + m));
    }
    if (report.removed && report.removed.length) {
      lines.push("Removed:");
      report.removed.forEach((m) => lines.push("  " + m));
    }
    if (report.warnings && report.warnings.length) {
      lines.push("Warnings:");
      report.warnings.forEach((m) => lines.push("  " + m));
    }
    if (report.reason) {
      lines.push("Reason:");
      lines.push(report.reason);
    }
    return lines.join("\n");
  }

  async function onInspect() {
    if (!selectedFile) {
      setReport("Choose an .als file first.");
      return;
    }
    if (!engineReady()) {
      setReport("Converter engine not loaded.");
      return;
    }
    setBusy(true);
    setReport("Inspecting…");
    try {
      const bytes = await readFileBytes(selectedFile);
      const data = await window.AlsConverterEngine.inspectAls(bytes, selectedFile.name);
      if (!data.ok) {
        setReport("Inspect failed: " + (data.error || "unknown error"));
        return;
      }
      setReport(data.report_text || JSON.stringify(data, null, 2));
    } catch (err) {
      setReport("Inspect error: " + (err.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function onConvert() {
    if (!selectedFile) {
      setReport("Choose an .als file first.");
      return;
    }
    if (!engineReady()) {
      setReport("Converter engine not loaded.");
      return;
    }
    setBusy(true);
    setReport("Converting… writing a NEW downgraded copy only.");
    try {
      const mode = (els.mode && els.mode.value) || "compatible";
      const target = (els.target && els.target.value) || "11.2";
      const bytes = await readFileBytes(selectedFile);
      const result = await window.AlsConverterEngine.convertAls(
        bytes,
        selectedFile.name,
        mode,
        target
      );

      if (!result.ok) {
        setReport(formatConvertReport(result.report || { outcome: "REFUSED_UNSUPPORTED", reason: result.error }));
        return;
      }

      if (lastDownloadUrl) URL.revokeObjectURL(lastDownloadUrl);
      const blob = new Blob([result.bytes], { type: "application/octet-stream" });
      lastDownloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = lastDownloadUrl;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setReport(formatConvertReport(result.report, result.filename));
    } catch (err) {
      setReport("Convert error: " + (err.message || err));
    } finally {
      setBusy(false);
    }
  }

  function wireUi() {
    els.browse &&
      els.browse.addEventListener("click", (e) => {
        e.stopPropagation();
        els.file && els.file.click();
      });
    els.drop &&
      els.drop.addEventListener("click", () => {
        els.file && els.file.click();
      });
    els.drop &&
      els.drop.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          els.file && els.file.click();
        }
      });
    els.file &&
      els.file.addEventListener("change", () => {
        const f = els.file.files && els.file.files[0];
        pickFile(f);
      });

    ["dragenter", "dragover"].forEach((evt) => {
      els.drop &&
        els.drop.addEventListener(evt, (e) => {
          e.preventDefault();
          els.drop.classList.add("is-drag");
        });
    });
    ["dragleave", "drop"].forEach((evt) => {
      els.drop &&
        els.drop.addEventListener(evt, (e) => {
          e.preventDefault();
          els.drop.classList.remove("is-drag");
        });
    });
    els.drop &&
      els.drop.addEventListener("drop", (e) => {
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        pickFile(f);
      });

    els.inspectBtn && els.inspectBtn.addEventListener("click", onInspect);
    els.convertBtn && els.convertBtn.addEventListener("click", onConvert);
  }

  wireUi();
  setMeta(null);
  initStatus();
})();
