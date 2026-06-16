(function () {
  const storageKey = "creditRoadmapSnapshots";
  const form = document.querySelector("#progress-form");
  const timeline = document.querySelector("#progress-timeline");
  const summary = document.querySelector("#progress-summary");
  const exportButton = document.querySelector("#export-progress");
  const clearStatus = document.querySelector("#tracker-status");

  if (!form || !timeline || !summary) {
    return;
  }

  const bandRank = {
    Stable: 0,
    "Needs attention": 1,
    "High risk": 2,
    "Very high risk": 3
  };

  const bandLabels = {
    stable: "Stable",
    attention: "Needs attention",
    high: "High risk",
    very: "Very high risk"
  };

  const fieldLabels = {
    ccjStatus: "CCJ status",
    defaults: "Defaults",
    missedPayments: "Missed payments",
    electoralRoll: "Electoral roll",
    utilisation: "Credit utilisation",
    goal: "Goal"
  };

  function readSnapshots() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch (error) {
      return [];
    }
  }

  function writeSnapshots(snapshots) {
    localStorage.setItem(storageKey, JSON.stringify(snapshots));
  }

  function selectedLabel(name, value) {
    const field = form.elements[name];
    if (!field || !field.options) {
      return value;
    }

    const option = Array.from(field.options).find((item) => item.value === value);
    return option ? option.textContent : value;
  }

  function normaliseSnapshot(snapshot) {
    return {
      ...snapshot,
      riskScore: Number(snapshot.riskScore),
      riskBand: bandLabels[snapshot.riskBand] || snapshot.riskBand
    };
  }

  function sortedSnapshots() {
    return readSnapshots()
      .map(normaliseSnapshot)
      .sort((a, b) => `${a.date}-${a.savedAt || ""}`.localeCompare(`${b.date}-${b.savedAt || ""}`));
  }

  function describeBandMovement(previous, current) {
    const previousRank = bandRank[previous.riskBand] ?? 0;
    const currentRank = bandRank[current.riskBand] ?? 0;

    if (currentRank < previousRank) {
      return `Improved from ${previous.riskBand} to ${current.riskBand}`;
    }

    if (currentRank > previousRank) {
      return `Moved from ${previous.riskBand} to ${current.riskBand}`;
    }

    return `Still in ${current.riskBand}`;
  }

  function addChange(list, condition, text) {
    if (condition) {
      list.push(text);
    }
  }

  function compareSnapshots(previous, current) {
    const improvements = [];
    const remaining = [];

    addChange(improvements, previous.electoralRoll !== "yes" && current.electoralRoll === "yes", "Registered on the electoral roll or confirmed address details");
    addChange(improvements, ["75plus", "50to75"].includes(previous.utilisation) && ["25to50", "under25"].includes(current.utilisation), "Reduced credit utilisation");
    addChange(improvements, previous.ccjStatus === "unpaid" && current.ccjStatus === "paid", "Moved from unpaid CCJ to satisfied CCJ");
    addChange(improvements, previous.defaults !== "0" && current.defaults === "0", "Defaults no longer showing in this snapshot");
    addChange(improvements, previous.missedPayments !== "none" && current.missedPayments === "none", "No recent missed payments recorded in this snapshot");

    addChange(remaining, current.ccjStatus === "unpaid", "Unpaid CCJ");
    addChange(remaining, current.ccjStatus === "paid", "Satisfied CCJ still visible");
    addChange(remaining, current.defaults === "1", "Recent default");
    addChange(remaining, current.defaults === "2plus", "Multiple defaults");
    addChange(remaining, current.missedPayments !== "none", "Recent missed payments");
    addChange(remaining, current.electoralRoll !== "yes", "Electoral roll or address details need checking");
    addChange(remaining, ["50to75", "75plus"].includes(current.utilisation), "High credit utilisation");

    return { improvements, remaining };
  }

  function listMarkup(items, fallback) {
    if (!items.length) {
      return `<p class="positive-note">${fallback}</p>`;
    }

    return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function renderSummary(snapshots) {
    if (!snapshots.length) {
      summary.innerHTML = `
        <div class="empty-state">
          <h2>No progress saved yet</h2>
          <p>Save a roadmap result or add a manual snapshot to start tracking changes over time.</p>
        </div>
      `;
      return;
    }

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
    const scoreChange = previous ? previous.riskScore - current.riskScore : 0;
    const comparison = previous ? compareSnapshots(previous, current) : { improvements: [], remaining: [] };
    const changeText = previous
      ? `${scoreChange >= 0 ? "+" : ""}${scoreChange} points`
      : "First snapshot";

    summary.innerHTML = `
      <div class="tracker-summary-grid">
        <article class="summary-card">
          <span class="status-pill">Current Position</span>
          <h2>${current.riskBand}</h2>
          <p>${current.riskScore} out of 100 risk score</p>
        </article>
        <article class="summary-card">
          <span class="status-pill">Previous Position</span>
          <h2>${previous ? previous.riskBand : "No previous entry"}</h2>
          <p>${previous ? `${previous.riskScore} out of 100 risk score` : "Add another snapshot to compare movement."}</p>
        </article>
        <article class="summary-card">
          <span class="status-pill">Improvement</span>
          <h2>${changeText}</h2>
          <p>${previous ? describeBandMovement(previous, current) : "Progress tracking starts from this entry."}</p>
        </article>
      </div>
      <div class="tracker-detail-grid">
        <section class="result-section">
          <h3>Key Improvements</h3>
          ${listMarkup(comparison.improvements, previous ? "No major positive movement detected yet. Keep tracking over time." : "Add a second snapshot to identify improvements.")}
        </section>
        <section class="result-section">
          <h3>Remaining Issues</h3>
          ${listMarkup(comparison.remaining, "No major remaining issue was flagged in the latest snapshot. Keep checking reports and maintaining payments.")}
        </section>
      </div>
    `;
  }

  function renderTimeline(snapshots) {
    if (!snapshots.length) {
      timeline.innerHTML = "<p class=\"microcopy\">No snapshots saved yet.</p>";
      return;
    }

    timeline.innerHTML = snapshots.map((snapshot) => `
      <article class="timeline-entry">
        <div>
          <span class="risk-pill">${snapshot.riskBand}</span>
          <h3>${snapshot.date}</h3>
          <p>${snapshot.riskScore} out of 100 risk score · ${snapshot.goalLabel || snapshot.goal}</p>
        </div>
        <dl>
          <div><dt>CCJ</dt><dd>${snapshot.ccjStatusLabel || snapshot.ccjStatus}</dd></div>
          <div><dt>Defaults</dt><dd>${snapshot.defaultsLabel || snapshot.defaults}</dd></div>
          <div><dt>Missed payments</dt><dd>${snapshot.missedPaymentsLabel || snapshot.missedPayments}</dd></div>
          <div><dt>Electoral roll</dt><dd>${snapshot.electoralRollLabel || snapshot.electoralRoll}</dd></div>
          <div><dt>Utilisation</dt><dd>${snapshot.utilisationLabel || snapshot.utilisation}</dd></div>
        </dl>
        <button class="button secondary delete-snapshot" type="button" data-id="${snapshot.id}">Delete</button>
      </article>
    `).join("");
  }

  function render() {
    const snapshots = sortedSnapshots();
    renderSummary(snapshots);
    renderTimeline(snapshots);
  }

  function snapshotFromForm() {
    const data = Object.fromEntries(new FormData(form).entries());
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      source: "tracker",
      savedAt: new Date().toISOString(),
      date: data.date,
      riskScore: Number(data.riskScore),
      riskBand: bandLabels[data.riskBand] || data.riskBand,
      ccjStatus: data.ccjStatus,
      ccjStatusLabel: selectedLabel("ccjStatus", data.ccjStatus),
      defaults: data.defaults,
      defaultsLabel: selectedLabel("defaults", data.defaults),
      missedPayments: data.missedPayments,
      missedPaymentsLabel: selectedLabel("missedPayments", data.missedPayments),
      electoralRoll: data.electoralRoll,
      electoralRollLabel: selectedLabel("electoralRoll", data.electoralRoll),
      utilisation: data.utilisation,
      utilisationLabel: selectedLabel("utilisation", data.utilisation),
      goal: data.goal,
      goalLabel: selectedLabel("goal", data.goal)
    };
  }

  function exportReport() {
    const snapshots = sortedSnapshots();
    if (!snapshots.length) {
      if (clearStatus) {
        clearStatus.textContent = "Add at least one snapshot before exporting.";
      }
      return;
    }

    const current = snapshots[snapshots.length - 1];
    const previous = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;
    const comparison = previous ? compareSnapshots(previous, current) : { improvements: [], remaining: [] };
    const lines = [
      "Credit Roadmap UK Progress Report",
      "General guidance only. Not financial advice, debt advice or credit broking.",
      "",
      `Current position: ${current.riskBand} (${current.riskScore}/100) on ${current.date}`,
      previous ? `Previous position: ${previous.riskBand} (${previous.riskScore}/100) on ${previous.date}` : "Previous position: no previous snapshot",
      previous ? `Score change: ${previous.riskScore - current.riskScore} points` : "Score change: first snapshot",
      "",
      "Key improvements:",
      ...(comparison.improvements.length ? comparison.improvements.map((item) => `- ${item}`) : ["- Add another snapshot to identify improvements."]),
      "",
      "Remaining issues:",
      ...(comparison.remaining.length ? comparison.remaining.map((item) => `- ${item}`) : ["- No major remaining issue flagged in the latest snapshot."]),
      "",
      "Timeline:",
      ...snapshots.map((item) => `- ${item.date}: ${item.riskBand}, ${item.riskScore}/100, goal: ${item.goalLabel || item.goal}`)
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "credit-roadmap-progress-report.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  form.elements.date.value = new Date().toISOString().slice(0, 10);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const snapshot = snapshotFromForm();
    const snapshots = readSnapshots();
    snapshots.push(snapshot);
    writeSnapshots(snapshots);
    form.reset();
    form.elements.date.value = new Date().toISOString().slice(0, 10);
    if (clearStatus) {
      clearStatus.textContent = "Snapshot saved locally in this browser.";
    }
    render();
  });

  timeline.addEventListener("click", (event) => {
    const button = event.target.closest(".delete-snapshot");
    if (!button) {
      return;
    }

    writeSnapshots(readSnapshots().filter((snapshot) => snapshot.id !== button.dataset.id));
    if (clearStatus) {
      clearStatus.textContent = "Snapshot deleted.";
    }
    render();
  });

  if (exportButton) {
    exportButton.addEventListener("click", exportReport);
  }

  render();
}());
