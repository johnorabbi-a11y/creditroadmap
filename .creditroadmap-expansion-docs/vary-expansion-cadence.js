const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const rows = fs.readFileSync(path.join(__dirname, "creditroadmap-expansion-manifest.csv"), "utf8").trim().split(/\r?\n/).slice(1);
const parse = row => [...row.matchAll(/"((?:""|[^"])*)"(?:,|$)/g)].map(m => m[1].replace(/""/g, '"'));
const manifest = rows.map(parse).map(cells => ({ file: cells[0], cluster: cells[2], intent: cells[3] }));

const variants = {
  "Credit Reports": {
    practice: "How to read the record",
    table: "Report-checking table",
    scenarios: "When report details change the answer",
    source: "Accuracy and source notes",
    intro: "The practical impact depends on the exact credit-file entry, how recent it is, whether it is accurate, and which agency or lender supplied the information. A score can be useful, but the report detail explains what a lender may actually see."
  },
  "Missed Payments": {
    practice: "How payment history is usually read",
    table: "Payment-history review table",
    scenarios: "Recent, isolated and repeated payment issues",
    source: "Reporting and timing notes",
    intro: "The practical impact depends on the account type, how late the payment was, whether it became arrears or default, and what your more recent payment pattern looks like. Recent missed payments often deserve more caution than older isolated markers."
  },
  "Renting and Credit": {
    practice: "How this can affect tenant referencing",
    table: "Renting-readiness table",
    scenarios: "Common tenancy application situations",
    source: "Referencing and credit-file notes",
    intro: "The practical impact depends on the letting agent, landlord, referencing provider and the type of credit-file issue involved. Renting checks are not identical to loan checks, so affordability, identity and guarantor evidence can matter alongside credit history."
  },
  "Personal Loans": {
    practice: "How lenders may assess the application",
    table: "Loan-readiness table",
    scenarios: "Loan application scenarios",
    source: "Creditworthiness and affordability notes",
    intro: "The practical impact depends on the loan amount, repayment term, recent credit conduct, existing commitments and lender criteria. Affordability and credit risk can both matter, so a strong income alone may not overcome unresolved credit pressure."
  },
  "CCJs and Defaults": {
    practice: "How adverse-credit details change the picture",
    table: "Adverse-credit review table",
    scenarios: "Status, age and accuracy scenarios",
    source: "Public-record and reporting notes",
    intro: "The practical impact depends on whether the marker is a CCJ, default, satisfied record, unsettled account or incorrect entry. Status and age matter, but they do not remove the need to check the surrounding credit-file picture."
  },
  "Credit Recovery Timelines": {
    practice: "How to think about timing",
    table: "Timing and readiness table",
    scenarios: "Application-timing scenarios",
    source: "Timeline source notes",
    intro: "The practical impact depends on which event you are dealing with. Some records have clearer visibility periods, while lender appetite, recent conduct and affordability still vary by product and provider."
  }
};

for (const page of manifest) {
  if (page.intent !== "educational") continue;
  const full = path.join(ROOT, page.file);
  let html = fs.readFileSync(full, "utf8");
  const v = variants[page.cluster];
  if (!v) continue;
  html = html
    .replace("<h2>What this means in practice</h2>", `<h2>${v.practice}</h2>`)
    .replace("The practical impact depends on the exact credit-file entry, how recent it is, whether it is accurate, and what else is visible around it. A lender, network, landlord or finance provider may look at the whole profile rather than one isolated detail.", v.intro)
    .replace("<h2>Readiness table</h2>", `<h2>${v.table}</h2>`)
    .replace("<h2>Common scenarios</h2>", `<h2>${v.scenarios}</h2>`)
    .replace("<h2>Source notes</h2>", `<h2>${v.source}</h2>`);
  fs.writeFileSync(full, html, "utf8");
}

console.log("Applied expansion cadence variation");
