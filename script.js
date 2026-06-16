(function () {
  const form = document.querySelector("#roadmap-form");
  const results = document.querySelector("#results");

  if (!form || !results) {
    return;
  }

  const scoreTables = {
    ccjStatus: {
      none: 0,
      paid: 20,
      unpaid: 35
    },
    ccjAge: {
      none: 0,
      under1: 20,
      "1to3": 15,
      "3to6": 8,
      over6: 0
    },
    defaults: {
      "0": 0,
      "1": 15,
      "2plus": 25,
      unsure: 10
    },
    missedPayments: {
      none: 0,
      "1to2": 10,
      "3to6": 20,
      "6plus": 30
    },
    electoralRoll: {
      yes: 0,
      no: 12,
      unsure: 8
    },
    utilisation: {
      under25: 0,
      "25to50": 8,
      "50to75": 18,
      "75plus": 28
    },
    applications: {
      none: 0,
      "1to2": 8,
      "3plus": 18
    }
  };

  const bandConfig = [
    {
      max: 20,
      label: "Stable",
      className: "risk-stable",
      summary: "Your answers suggest a more stable recent profile. Lenders may still assess affordability, income, identity checks and their own policy rules, but no major risk cluster was flagged by this tool."
    },
    {
      max: 40,
      label: "Needs attention",
      className: "risk-attention",
      summary: "Your answers suggest some areas may need attention before new applications. The main aim is to reduce avoidable friction and build a cleaner recent pattern."
    },
    {
      max: 65,
      label: "High risk",
      className: "risk-high",
      summary: "Your answers suggest several factors could make lenders more cautious. It may help to focus on stability, accurate records and recent payment conduct before applying."
    },
    {
      max: 100,
      label: "Very high risk",
      className: "risk-very",
      summary: "Your answers suggest a very high-risk profile for many forms of credit. Unpaid or recent adverse markers, frequent missed payments, high balances or repeated applications may need attention first."
    }
  ];

  function addUnique(list, item) {
    if (!list.includes(item)) {
      list.push(item);
    }
  }

  function listMarkup(items, fallback) {
    if (!items.length) {
      return `<p class="positive-note">${fallback}</p>`;
    }

    return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function clampScore(score) {
    return Math.min(100, Math.max(0, score));
  }

  function getBand(score) {
    return bandConfig.find((band) => score <= band.max) || bandConfig[bandConfig.length - 1];
  }

  function scoreAnswer(category, value) {
    return scoreTables[category][value] || 0;
  }

  function calculateScore(data) {
    const rawScore = scoreAnswer("ccjStatus", data.ccjStatus)
      + scoreAnswer("ccjAge", data.ccjAge)
      + scoreAnswer("defaults", data.defaults)
      + scoreAnswer("missedPayments", data.missedPayments)
      + scoreAnswer("electoralRoll", data.electoralRoll)
      + scoreAnswer("utilisation", data.utilisation)
      + scoreAnswer("applications", data.applications);

    const hasVeryHighTrigger = data.ccjStatus === "unpaid"
      || data.defaults === "2plus"
      || data.missedPayments === "3to6"
      || data.missedPayments === "6plus"
      || data.utilisation === "75plus"
      || data.applications === "3plus";

    if (!hasVeryHighTrigger) {
      return Math.min(65, clampScore(rawScore));
    }

    return clampScore(rawScore);
  }

  function addGoalGuidance(data, goalGuidance, twelveMonth) {
    if (data.goal === "phone") {
      addUnique(goalGuidance, "Phone contract: providers may pay close attention to recent missed payments, CCJs, address stability and whether your electoral roll details match your application.");
      addUnique(goalGuidance, "Before applying, check that your current address is consistent across your bank, mobile and credit report records.");
    }

    if (data.goal === "card") {
      addUnique(goalGuidance, "Credit card: lenders may focus on utilisation, recent applications and recent missed payments when assessing risk.");
      addUnique(goalGuidance, "If you are rebuilding, credit-builder style products may be designed for thinner or imperfect files, but eligibility and affordability still matter and no approval is guaranteed.");
    }

    if (data.goal === "loan") {
      addUnique(goalGuidance, "Personal loan: affordability, income stability, CCJs, defaults and recent applications may carry significant weight.");
      addUnique(goalGuidance, "A larger loan may be harder to obtain where recent adverse markers or missed payments are visible.");
    }

    if (data.goal === "car") {
      addUnique(goalGuidance, "Car finance: lenders may consider deposit size, affordability, defaults, CCJs and recent missed payments.");
      addUnique(goalGuidance, "A larger deposit and a period of cleaner recent conduct could improve how the application is viewed, but it will not guarantee acceptance.");
    }

    if (data.goal === "mortgage") {
      addUnique(goalGuidance, "Mortgage: lenders may look closely at deposit size, affordability, CCJs, defaults, missed payments and the age of adverse markers.");
      addUnique(goalGuidance, "Recent or unpaid adverse markers may significantly narrow options, so qualified mortgage advice could be useful before applying.");
      addUnique(twelveMonth, "For a mortgage goal, focus on deposit building, clean recent payment history, reducing unsecured balances and letting adverse markers age where possible.");
    }
  }

  function buildRoadmap(data) {
    const score = calculateScore(data);
    const band = getBand(score);
    const blockers = [];
    const quickWins = [];
    const thirtyDay = [
      "Check your statutory credit reports and confirm that names, addresses, account statuses and public records are accurate.",
      "Set reminders or direct debits for active accounts so future payments are made on time.",
      "Avoid applying for credit until you understand what is currently visible on your reports."
    ];
    const ninetyDay = [
      "Avoid unnecessary new credit applications while you stabilise your profile.",
      "Keep evidence of satisfied debts, payment plans or corrections in case a lender asks for context."
    ];
    const twelveMonth = [
      "Build a clean recent payment history and review your credit reports every few months.",
      "Only apply when the product fits your situation and you have checked eligibility where possible."
    ];
    const notes = [];
    const goalGuidance = [];
    let summary = band.summary;

    if (data.ccjStatus === "unpaid") {
      addUnique(blockers, "Unpaid CCJ");
      addUnique(thirtyDay, "Review the CCJ details and consider resolving or satisfying it where possible.");
      addUnique(ninetyDay, "If the CCJ is paid, check that the public record and credit reports are updated where appropriate.");
      summary += " An unpaid CCJ may be treated seriously by lenders, especially for larger borrowing or mortgage-related goals.";
    }

    if (data.ccjStatus === "paid") {
      addUnique(blockers, "Satisfied CCJ still visible");
      addUnique(ninetyDay, "Check all credit reports show the CCJ as satisfied.");
      addUnique(twelveMonth, "Keep evidence that the CCJ has been paid or satisfied in case an application asks for supporting context.");
    }

    if (data.ccjAge === "under1") {
      addUnique(blockers, "Very recent CCJ");
      addUnique(thirtyDay, "Check the judgment date, amount and satisfaction status are recorded correctly.");
    }

    if (data.ccjAge === "1to3") {
      addUnique(blockers, "Recent CCJ aged 1-3 years");
      addUnique(ninetyDay, "Build a consistent recent payment record while the CCJ becomes older.");
    }

    if (data.ccjAge === "3to6") {
      addUnique(notes, "A CCJ aged 3-6 years may have less impact than a very recent one, but lenders may still consider it while it appears on standard credit files.");
    }

    if (data.ccjAge === "over6") {
      addUnique(notes, "A CCJ over six years old may no longer appear on standard credit files, but you should still check your reports.");
    }

    if (data.defaults === "1") {
      addUnique(blockers, "One default");
      addUnique(ninetyDay, "Check whether the default date, balance and settlement status are accurate across your reports.");
    }

    if (data.defaults === "2plus") {
      addUnique(blockers, "Multiple defaults");
      addUnique(thirtyDay, "List each defaulted account, its date, balance and whether it has been settled.");
      addUnique(twelveMonth, "With multiple defaults, focus on stability, clean payment history and allowing adverse markers to age while resolving outstanding balances where possible.");
    }

    if (data.defaults === "unsure") {
      addUnique(quickWins, "Check your statutory credit reports to confirm whether any defaults are recorded.");
      addUnique(thirtyDay, "Make a list of any defaulted accounts, their dates, balances and whether they are settled.");
    }

    if (data.missedPayments === "1to2") {
      addUnique(blockers, "Recent missed payments");
      addUnique(thirtyDay, "Bring any accounts up to date where possible and contact providers early if payments may be missed.");
      addUnique(ninetyDay, "Aim for three months of on-time payments before making non-essential applications.");
    }

    if (data.missedPayments === "3to6") {
      addUnique(blockers, "Several recent missed payments");
      addUnique(thirtyDay, "Review your budget and active commitments so priority bills and credit payments are covered.");
      addUnique(ninetyDay, "Focus on at least three months of on-time payments before considering further applications.");
    }

    if (data.missedPayments === "6plus") {
      addUnique(blockers, "Frequent recent missed payments");
      addUnique(thirtyDay, "If repayments are becoming difficult, consider speaking to a qualified debt adviser before taking on more credit.");
      addUnique(ninetyDay, "Prioritise stabilising essential payments and avoiding further arrears where possible.");
      summary += " Frequent recent missed payments may also indicate affordability pressure, so taking on new credit could make the position harder.";
    }

    if (data.electoralRoll === "no") {
      addUnique(quickWins, "Register on the electoral roll or confirm your address details.");
      addUnique(thirtyDay, "Check that your current address is consistent across bank accounts, credit accounts and credit reports.");
    }

    if (data.electoralRoll === "unsure") {
      addUnique(quickWins, "Confirm whether you are on the electoral roll at your current address.");
      addUnique(thirtyDay, "Correct any mismatched address history across your reports where possible.");
    }

    if (data.utilisation === "under25") {
      addUnique(quickWins, "Utilisation under 25% is a positive signal to maintain if affordable.");
    }

    if (data.utilisation === "25to50") {
      addUnique(quickWins, "Utilisation between 25% and 50% may be manageable, but lower balances can reduce pressure.");
      addUnique(ninetyDay, "If affordable, gradually reduce revolving balances before applying for more credit.");
    }

    if (data.utilisation === "50to75") {
      addUnique(blockers, "Moderately high credit utilisation");
      addUnique(thirtyDay, "Work towards reducing utilisation below 50%.");
      addUnique(ninetyDay, "Avoid increasing card balances while you reduce utilisation.");
    }

    if (data.utilisation === "75plus") {
      addUnique(blockers, "Very high credit utilisation");
      addUnique(thirtyDay, "Aim to reduce balances below 75% first, then work towards below 50%.");
      addUnique(ninetyDay, "Avoid adding to revolving balances where possible while reducing utilisation in stages.");
      summary += " Very high utilisation may suggest pressure on available credit.";
    }

    if (data.applications === "1to2") {
      addUnique(blockers, "Recent credit applications");
      addUnique(ninetyDay, "Pause non-essential applications and use eligibility checks where available.");
    }

    if (data.applications === "3plus") {
      addUnique(blockers, "Multiple recent applications");
      addUnique(thirtyDay, "Avoid new applications for a short period unless they are essential.");
      addUnique(ninetyDay, "Avoid further applications for a short period where possible.");
    }

    if (!blockers.length) {
      addUnique(quickWins, "Keep balances controlled, payments on time and address details consistent.");
      addUnique(thirtyDay, "Check your reports now so you know what lenders may see.");
    }

    addGoalGuidance(data, goalGuidance, twelveMonth);

    return {
      score,
      band,
      summary,
      blockers,
      quickWins,
      thirtyDay,
      ninetyDay,
      twelveMonth,
      notes,
      goalGuidance
    };
  }

  function renderRoadmap(roadmap) {
    results.innerHTML = `
      <div class="result-report">
        <div class="result-header ${roadmap.band.className}">
          <div>
            <span class="risk-pill ${roadmap.band.className}">${roadmap.band.label}</span>
            <h2>Your credit roadmap report</h2>
            <p>${roadmap.summary}</p>
          </div>
          <div class="score-summary" aria-label="Risk score">
            <span>${roadmap.score}</span>
            <small>out of 100 risk score</small>
          </div>
        </div>

        <section class="result-section">
          <h3>Main blockers</h3>
          ${listMarkup(roadmap.blockers, "No major blocker was flagged from this answer set. Keep monitoring your reports and maintaining on-time payments.")}
        </section>

        <section class="result-section">
          <h3>Quick wins</h3>
          ${listMarkup(roadmap.quickWins, "Keep your address details consistent, maintain low balances where possible and avoid unnecessary applications.")}
        </section>

        <section class="result-section">
          <h3>30-day plan</h3>
          ${listMarkup(roadmap.thirtyDay, "Check your reports and keep active accounts up to date.")}
        </section>

        <section class="result-section">
          <h3>90-day plan</h3>
          ${listMarkup(roadmap.ninetyDay, "Focus on clean recent conduct and avoid avoidable applications.")}
        </section>

        <section class="result-section">
          <h3>12-month roadmap</h3>
          ${listMarkup(roadmap.twelveMonth, "Build stable payment history and apply selectively only when the product fits your circumstances.")}
        </section>

        <section class="result-section">
          <h3>Goal-specific guidance</h3>
          ${listMarkup(roadmap.goalGuidance, "Keep affordability, recent conduct and report accuracy in mind before applying.")}
        </section>

        ${roadmap.notes.length ? `
          <section class="result-section">
            <h3>Additional notes</h3>
            ${listMarkup(roadmap.notes, "")}
          </section>
        ` : ""}

        <section class="result-disclaimer">
          <h3>Important disclaimer</h3>
          <p>This is general UK credit education only. It is not financial advice, debt advice, credit broking or a recommendation to apply for any product. It does not guarantee approval or improvement. Lenders, brokers and credit providers use their own criteria.</p>
        </section>
      </div>
    `;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    renderRoadmap(buildRoadmap(data));
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("reset", () => {
    results.innerHTML = `
      <div class="empty-state">
        <h2>Your roadmap will appear here</h2>
        <p>Complete the questionnaire to see your score, risk band, likely blockers, quick wins and staged plan.</p>
      </div>
    `;
  });
}());
