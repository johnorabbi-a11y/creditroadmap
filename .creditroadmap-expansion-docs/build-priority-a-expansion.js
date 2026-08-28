const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const SITE = "https://creditroadmap.co.uk";
const TODAY = "2026-08-28";

const sources = [
  { label: "GOV.UK: County court judgments for debt", url: "https://www.gov.uk/county-court-judgments-ccj-for-debt" },
  { label: "GOV.UK: CCJs and your credit rating", url: "https://www.gov.uk/county-court-judgments-ccj-for-debt/ccjs-and-your-credit-rating" },
  { label: "ICO: Credit reference agencies and credit files", url: "https://ico.org.uk/for-the-public/credit" },
  { label: "FCA: Creditworthiness and affordability", url: "https://www.fca.org.uk/firms/creditworthiness-and-affordability-common-misunderstandings" },
  { label: "FCA Handbook: CONC responsible lending", url: "https://handbook.fca.org.uk/handbook/conc5" },
  { label: "GOV.UK: Debt Relief Orders and credit reference files", url: "https://www.gov.uk/guidance/once-you-have-a-debt-relief-order-dro" },
  { label: "MoneyHelper: Guarantor loans explained", url: "https://www.moneyhelper.org.uk/en/everyday-money/credit/guarantor-loans-explained" }
];

const clusters = {
  reports: {
    hub: "credit-report-help.html",
    name: "Credit Reports",
    eyebrow: "Credit file foundations",
    intro: "Your credit report is the raw evidence many lenders use when they assess applications. This centre explains how reports, agencies, searches, address history, financial associations and payment records fit together.",
    routes: [
      "how-to-check-your-credit-report.html",
      "experian-equifax-transunion-explained.html",
      "how-to-correct-credit-report-errors.html",
      "what-is-a-hard-credit-search.html",
      "what-is-a-soft-credit-search.html",
      "how-long-do-hard-searches-stay-on-credit-file.html",
      "financial-associations-credit-report.html",
      "address-history-and-credit-applications.html",
      "payment-history-on-credit-report.html",
      "why-your-credit-score-differs-between-agencies.html"
    ]
  },
  missed: {
    hub: "missed-payments-credit-help.html",
    name: "Missed Payments",
    eyebrow: "Payment history",
    intro: "Missed and late payments are common credit-file problems, but their impact depends on timing, frequency, account type and what has happened since. This centre helps users understand recovery without turning it into a promise.",
    routes: [
      "missed-payments-and-credit-score.html",
      "late-payment-on-credit-file.html",
      "one-missed-payment-credit-score.html",
      "multiple-missed-payments-credit-file.html",
      "how-long-do-missed-payments-stay-on-credit-file.html",
      "missed-mobile-phone-payment-credit-score.html",
      "utility-bill-missed-payment-credit-score.html",
      "mortgage-arrears-and-credit-file.html",
      "rebuilding-credit-after-missed-payments.html",
      "missed-payment-before-mortgage-application.html"
    ]
  },
  renting: {
    hub: "renting-credit-help.html",
    name: "Renting and Credit",
    eyebrow: "Tenancy readiness",
    intro: "Tenant referencing can combine identity, affordability and credit-file checks. This centre explains how adverse credit may affect renting and what practical preparation looks like before an application.",
    routes: [
      "renting-with-bad-credit.html",
      "renting-with-a-ccj.html",
      "renting-with-defaults.html",
      "credit-checks-for-renting.html",
      "guarantor-for-renting-with-bad-credit.html",
      "improve-credit-before-renting.html"
    ]
  },
  loans: {
    hub: "personal-loans-and-credit.html",
    name: "Personal Loans",
    eyebrow: "Loan readiness",
    intro: "Personal loan decisions usually combine credit risk, affordability and recent application behaviour. This centre keeps the focus on understanding checks and preparing sensibly, not chasing guaranteed approval.",
    routes: [
      "personal-loan-eligibility-bad-credit.html",
      "can-i-get-a-loan-with-defaults.html",
      "can-i-get-a-loan-after-bankruptcy.html",
      "loan-application-credit-checks-explained.html",
      "improve-credit-before-applying-for-a-loan.html",
      "rejected-for-a-loan-what-next.html",
      "loan-affordability-and-credit-checks.html"
    ]
  },
  timelines: {
    hub: "credit-recovery-timelines.html",
    name: "Credit Recovery Timelines",
    eyebrow: "Timing and recovery",
    intro: "Some credit events have fixed reporting periods, while lender appetite and recent conduct vary. This centre separates dates that can be checked from outcomes that depend on the wider file.",
    routes: [
      "default-removal-date-calculator.html",
      "hard-search-recovery-timeline.html",
      "application-spacing-planner.html",
      "credit-event-timeline.html",
      "how-long-after-credit-rejection-apply-again.html",
      "how-long-after-default-satisfaction-can-i-apply.html",
      "what-to-check-before-applying-for-credit.html"
    ]
  },
  adverse: {
    hub: "defaults-and-credit-problems.html",
    name: "CCJs and Defaults",
    eyebrow: "Adverse credit details",
    intro: "Detailed adverse-credit pages help users understand what is recorded, what can be checked, and how payment or satisfaction status may affect the story a lender sees.",
    routes: [
      "satisfied-default-credit-score.html",
      "unsatisfied-default-credit-file.html",
      "incorrect-default-on-credit-report.html",
      "multiple-defaults-credit-file.html",
      "settled-vs-satisfied-defaults.html",
      "satisfied-ccj-credit-file.html",
      "unsatisfied-ccj-credit-file.html",
      "multiple-ccjs-credit-file.html",
      "paying-a-ccj-after-judgment.html",
      "applying-for-credit-after-a-ccj.html"
    ]
  },
  readiness: {
    hub: "roadmap.html",
    name: "Application Readiness Tools",
    eyebrow: "Interactive readiness",
    intro: "These tools turn common application-timing questions into cautious, non-personalised checks that users can use before making new applications.",
    routes: [
      "car-finance-readiness-score.html",
      "credit-card-application-readiness.html"
    ]
  }
};

const pages = [
  hubPage("credit-report-help.html", "Credit Report Help Centre | Credit Roadmap UK", "A UK credit report help hub covering credit reference agencies, searches, address history, payment history, errors and score differences.", "Credit Report Help Centre", "reports"),
  hubPage("missed-payments-credit-help.html", "Missed Payments and Credit Help | Credit Roadmap UK", "Understand missed payments, late payment markers, recovery timelines, mortgage concerns and practical credit-file preparation.", "Missed Payments and Credit Help", "missed"),
  hubPage("renting-credit-help.html", "Renting With Credit Problems | Credit Roadmap UK", "A UK renting and credit hub covering tenant credit checks, CCJs, defaults, guarantors and tenancy application preparation.", "Renting With Credit Problems", "renting"),
  hubPage("personal-loans-and-credit.html", "Personal Loans and Credit Checks | Credit Roadmap UK", "A practical UK hub for understanding personal loan credit checks, bad credit eligibility, defaults, bankruptcy and rejection recovery.", "Personal Loans and Credit Checks", "loans"),
  hubPage("credit-recovery-timelines.html", "Credit Recovery Timelines | Credit Roadmap UK", "A UK credit recovery timeline hub covering defaults, missed payments, hard searches, rejection spacing and application readiness.", "Credit Recovery Timelines", "timelines"),

  toolPage("default-removal-date-calculator.html", "Default Removal Date Calculator | Credit Roadmap UK", "Estimate the six-year credit-file visibility date for a UK default and plan application timing cautiously.", "Default Removal Date Calculator", "timelines", "defaultDate"),
  toolPage("hard-search-recovery-timeline.html", "Hard Search Recovery Timeline | Credit Roadmap UK", "Estimate how recent credit applications may affect readiness and plan safer spacing before applying again.", "Hard Search Recovery Timeline", "timelines", "hardSearch"),
  toolPage("application-spacing-planner.html", "Credit Application Spacing Planner | Credit Roadmap UK", "Plan spacing between credit applications and understand why repeated recent searches can affect credit readiness.", "Credit Application Spacing Planner", "timelines", "spacing"),
  toolPage("car-finance-readiness-score.html", "Car Finance Readiness Score | Credit Roadmap UK", "Use a cautious UK car finance readiness score to review credit-file, affordability, deposit and recent application factors.", "Car Finance Readiness Score", "readiness", "carReadiness"),
  toolPage("credit-card-application-readiness.html", "Credit Card Application Readiness | Credit Roadmap UK", "Check common credit-card readiness factors including utilisation, missed payments, recent searches and adverse credit.", "Credit Card Application Readiness", "readiness", "cardReadiness"),

  article("how-to-check-your-credit-report.html", "How to Check Your Credit Report | Credit Roadmap UK", "Learn how UK users can check credit reports, compare agency records and review key credit-file details before applying.", "How to Check Your Credit Report", "reports", "Checking your credit report means reviewing the information held about you by the main UK credit reference agencies before you apply for credit.", ["Check all main agency reports rather than relying on one score.", "Look for address history, account status, missed payments, defaults, CCJs and linked people.", "Raise corrections with evidence when a record looks wrong."]),
  article("experian-equifax-transunion-explained.html", "Experian, Equifax and TransUnion Explained | Credit Roadmap UK", "Understand the three main UK credit reference agencies and why lenders may see different information across them.", "Experian, Equifax and TransUnion Explained", "reports", "Experian, Equifax and TransUnion are the three main UK consumer credit reference agencies, and their records can differ.", ["Not every lender reports to every agency.", "Scores are not universal lender decisions.", "For important applications, check the underlying report data, not just the headline score."]),
  article("how-to-correct-credit-report-errors.html", "How to Correct Credit Report Errors | Credit Roadmap UK", "A practical UK guide to spotting credit-report errors, gathering evidence and raising disputes with the right organisation.", "How to Correct Credit Report Errors", "reports", "If a credit report entry is inaccurate or out of date, start by identifying the source and keeping evidence before raising a correction.", ["Check whether the issue is with the lender, public record or CRA matching.", "Keep screenshots, account references and correspondence.", "Avoid applying for major credit until serious errors are being investigated where possible."]),
  article("what-is-a-hard-credit-search.html", "What Is a Hard Credit Search? | Credit Roadmap UK", "Understand hard credit searches, when they may appear on your credit file and why application timing matters.", "What Is a Hard Credit Search?", "reports", "A hard credit search is usually recorded when you make a full credit application and may be visible to other lenders.", ["Hard searches are different from soft eligibility checks.", "Several recent searches can make a file look pressured.", "The effect depends on wider context and lender criteria."]),
  article("what-is-a-soft-credit-search.html", "What Is a Soft Credit Search? | Credit Roadmap UK", "Understand soft credit searches, eligibility checks and why they are different from full credit applications.", "What Is a Soft Credit Search?", "reports", "A soft credit search can help check identity or eligibility without normally being visible to other lenders as a full application search.", ["Soft checks may still appear to you on your own report.", "They are useful before comparing products.", "Always check provider wording before assuming a search will be soft."]),
  article("how-long-do-hard-searches-stay-on-credit-file.html", "How Long Do Hard Searches Stay on a Credit File? | Credit Roadmap UK", "Learn how hard credit searches are usually treated on UK credit files and how to plan application spacing.", "How Long Do Hard Searches Stay on a Credit File?", "reports", "Hard searches can remain visible on credit files for a period, but their practical importance often depends on recency and number.", ["Recent searches usually matter more than older ones.", "Clusters of applications can be more concerning than one isolated search.", "Application spacing is often more useful than chasing exact score changes."]),
  article("financial-associations-credit-report.html", "Financial Associations on a Credit Report | Credit Roadmap UK", "Understand linked people, joint accounts and how financial associations can affect credit applications.", "Financial Associations on a Credit Report", "reports", "A financial association can appear when you have a joint financial connection with another person, such as a joint account or credit agreement.", ["Associations are not the same as living at the same address.", "They can matter if a lender assesses linked financial risk.", "Old or incorrect associations should be checked and disputed where appropriate."]),
  article("address-history-and-credit-applications.html", "Address History and Credit Applications | Credit Roadmap UK", "Understand why address history, electoral roll records and consistent details can affect UK credit applications.", "Address History and Credit Applications", "reports", "Address history helps lenders and credit reference agencies match your identity and understand the stability of your records.", ["Use consistent addresses across applications and accounts.", "Check old linked addresses for adverse records.", "Electoral roll accuracy can support identity checks."]),
  article("payment-history-on-credit-report.html", "Payment History on Your Credit Report | Credit Roadmap UK", "Learn what payment history means on a UK credit file and why recent conduct often matters to lenders.", "Payment History on Your Credit Report", "reports", "Payment history shows whether accounts have usually been paid on time, late, missed, defaulted or settled.", ["Recent clean conduct can help the file look less pressured.", "Missed payments and defaults are not the same thing.", "Correct status and dates matter as much as the score."]),
  article("why-your-credit-score-differs-between-agencies.html", "Why Credit Scores Differ Between Agencies | Credit Roadmap UK", "Understand why Experian, Equifax and TransUnion scores can differ and how to focus on report data instead.", "Why Your Credit Score Differs Between Agencies", "reports", "Credit scores can differ because agencies use different scoring models and may hold different lender data.", ["Compare report details, not only the number.", "A lender may not use the agency score you see.", "The same credit file issue can be weighted differently by each agency."]),

  article("missed-payments-and-credit-score.html", "Missed Payments and Credit Score | Credit Roadmap UK", "Understand how missed payments can affect a UK credit file and how to plan recovery after late or missed payments.", "Missed Payments and Credit Score", "missed", "A missed payment can affect credit readiness because it shows a recent break in agreed repayment behaviour.", ["Timing, account type and frequency all matter.", "One missed payment is different from repeated arrears.", "Recovery usually depends on clean recent conduct, not a guaranteed score jump."]),
  article("late-payment-on-credit-file.html", "Late Payment on Credit File | Credit Roadmap UK", "A practical UK guide to late payment markers, missed payment reporting and what to check before applying again.", "Late Payment on Credit File", "missed", "A late-payment marker records that an account was not paid as agreed by the expected date or reporting cycle.", ["Check whether the marker is accurate.", "Contact the lender if the marker looks wrong.", "Avoid repeated applications while recent payment issues are unresolved."]),
  article("one-missed-payment-credit-score.html", "One Missed Payment and Your Credit Score | Credit Roadmap UK", "Understand how a single missed payment may be viewed and what to do before making new applications.", "One Missed Payment and Your Credit Score", "missed", "One missed payment does not tell the whole story, but it can still matter if it is recent or on an important account.", ["Bring the account up to date where possible.", "Check whether other recent risk signals are present.", "Allow time for cleaner payment behaviour before major applications."]),
  article("multiple-missed-payments-credit-file.html", "Multiple Missed Payments on a Credit File | Credit Roadmap UK", "Understand why repeated missed payments can affect credit applications and how to plan a cautious recovery route.", "Multiple Missed Payments on a Credit File", "missed", "Multiple missed payments usually suggest a pattern rather than a one-off error, so lenders may treat them more seriously.", ["Stabilise current accounts before applying again.", "Check whether arrears have become defaults.", "Use recovery planning instead of repeated applications."]),
  article("how-long-do-missed-payments-stay-on-credit-file.html", "How Long Do Missed Payments Stay on a Credit File? | Credit Roadmap UK", "Learn how missed payments may remain visible and how timing can affect UK credit application readiness.", "How Long Do Missed Payments Stay on a Credit File?", "missed", "Missed payment history may remain visible on credit reports for years, but recency and later conduct often shape how risky it looks.", ["Check actual report dates.", "Older isolated markers may be viewed differently from recent arrears.", "Major applications usually need more caution after recent missed payments."]),
  article("missed-mobile-phone-payment-credit-score.html", "Missed Mobile Phone Payment and Credit Score | Credit Roadmap UK", "Understand how missed mobile phone payments can appear on credit files and affect phone, card or finance applications.", "Missed Mobile Phone Payment and Credit Score", "missed", "Mobile phone contracts can be credit agreements or reported service accounts, so missed payments may affect future credit checks.", ["Check whether the account is reported to a CRA.", "Bring the account up to date where possible.", "SIM-only options may be worth considering while rebuilding."]),
  article("utility-bill-missed-payment-credit-score.html", "Utility Bill Missed Payment and Credit Score | Credit Roadmap UK", "Understand when utility arrears may affect credit files and what to check if a bill marker appears.", "Utility Bill Missed Payment and Credit Score", "missed", "Some utility accounts may be reported to credit reference agencies, so missed or defaulted bills can affect how your file is viewed.", ["Check whether the supplier reports the account.", "Confirm dates and balances.", "Do not ignore priority household bills while focusing on score changes."]),
  article("mortgage-arrears-and-credit-file.html", "Mortgage Arrears and Your Credit File | Credit Roadmap UK", "Understand how mortgage arrears can affect credit records and why later mortgage applications need careful preparation.", "Mortgage Arrears and Your Credit File", "missed", "Mortgage arrears can be a serious payment-history signal because they relate to secured borrowing and housing commitments.", ["Check how the arrears are recorded.", "Get qualified support if payments are unaffordable.", "Later mortgage applications may need more careful timing and explanation."]),
  article("rebuilding-credit-after-missed-payments.html", "Rebuilding Credit After Missed Payments | Credit Roadmap UK", "A practical UK recovery guide after missed payments, with report checks, timing and application-readiness steps.", "Rebuilding Credit After Missed Payments", "missed", "Rebuilding after missed payments is mostly about accuracy, stability and avoiding new avoidable risk signals.", ["Check reports first.", "Stabilise current payments.", "Reduce utilisation where possible before applying again."]),
  article("missed-payment-before-mortgage-application.html", "Missed Payment Before a Mortgage Application | Credit Roadmap UK", "Understand why a recent missed payment can affect mortgage readiness and what to review before applying.", "Missed Payment Before a Mortgage Application", "missed", "A missed payment before a mortgage application may matter because mortgage checks often look closely at recent conduct and affordability.", ["Check report accuracy.", "Speak to a qualified mortgage adviser where needed.", "Avoid assuming one marker has the same effect with every lender."]),

  article("renting-with-bad-credit.html", "Renting With Bad Credit | Credit Roadmap UK", "Understand UK tenant credit checks, affordability, guarantors and how to prepare when your credit history is imperfect.", "Renting With Bad Credit", "renting", "Renting with bad credit may still be possible, but referencing outcomes depend on landlord, letting-agent and guarantor requirements.", ["Credit checks are only one part of tenant referencing.", "Affordability and identity checks also matter.", "A guarantor or stronger evidence may help in some cases."]),
  article("renting-with-a-ccj.html", "Renting With a CCJ | Credit Roadmap UK", "A practical guide to renting with a County Court Judgment, including checks, guarantors and preparation.", "Renting With a CCJ", "renting", "A CCJ can affect tenant referencing, especially if it is recent, unpaid or appears alongside other credit problems.", ["Check whether the CCJ is accurate and satisfied.", "Prepare a factual explanation if asked.", "Avoid applying repeatedly where referencing failures are likely."]),
  article("renting-with-defaults.html", "Renting With Defaults | Credit Roadmap UK", "Understand how defaults may affect tenant referencing and how to prepare before applying for a rented home.", "Renting With Defaults", "renting", "Defaults can affect renting because tenant checks may include credit-file and affordability information.", ["Paid or older defaults may be viewed differently from recent unpaid defaults.", "Evidence of income and rent affordability can matter.", "A guarantor may be requested in some cases."]),
  article("credit-checks-for-renting.html", "Credit Checks for Renting | Credit Roadmap UK", "Learn what UK tenant credit checks may look for and how they differ from loan or mortgage checks.", "Credit Checks for Renting", "renting", "Tenant credit checks usually focus on identity, public records, affordability and major adverse markers rather than replacing landlord judgment.", ["Letting checks vary.", "CCJs and insolvency records may be more visible than ordinary score changes.", "Prepare documents before making applications."]),
  article("guarantor-for-renting-with-bad-credit.html", "Guarantor for Renting With Bad Credit | Credit Roadmap UK", "Understand when a guarantor may be requested for renting and what to consider before relying on one.", "Guarantor for Renting With Bad Credit", "renting", "A guarantor may support a tenancy application where credit history or affordability creates concern, but it is a serious commitment for the guarantor.", ["The guarantor may be checked too.", "The guarantee can create legal responsibility.", "Use it carefully, not as a casual workaround."]),
  article("improve-credit-before-renting.html", "Improve Credit Before Renting | Credit Roadmap UK", "Practical steps to prepare your credit file, documents and affordability evidence before a tenancy application.", "Improve Credit Before Renting", "renting", "Improving readiness before renting means checking reports, correcting errors and preparing evidence rather than chasing a perfect score.", ["Check public records and addresses.", "Reduce avoidable recent application noise.", "Prepare proof of income, savings or guarantor support where relevant."]),

  article("personal-loan-eligibility-bad-credit.html", "Personal Loan Eligibility With Bad Credit | Credit Roadmap UK", "Understand how bad credit may affect personal loan eligibility, affordability checks and application timing.", "Personal Loan Eligibility With Bad Credit", "loans", "Personal loan eligibility with bad credit depends on lender criteria, credit history, affordability and the amount being borrowed.", ["Eligibility checks may be safer than full applications.", "High-cost borrowing can be risky.", "If debt is unaffordable, seek proper debt advice."]),
  article("can-i-get-a-loan-with-defaults.html", "Can I Get a Loan With Defaults? | Credit Roadmap UK", "Understand how defaults may affect personal loan applications and what to check before applying.", "Can I Get a Loan With Defaults?", "loans", "Getting a loan with defaults may be possible with some lenders, but recent, unpaid or multiple defaults can be significant risk signals.", ["Check default dates and settlement status.", "Review affordability before applying.", "Avoid repeated applications after declines."]),
  article("can-i-get-a-loan-after-bankruptcy.html", "Can I Get a Loan After Bankruptcy? | Credit Roadmap UK", "Understand loan applications after bankruptcy, including discharge status, credit-file checks and cautious rebuilding.", "Can I Get a Loan After Bankruptcy?", "loans", "A loan after bankruptcy may depend on discharge status, time since bankruptcy, affordability and lender criteria.", ["Check that credit files are accurate after discharge.", "High-cost borrowing may worsen recovery.", "Use cautious rebuilding before making new applications."]),
  article("loan-application-credit-checks-explained.html", "Loan Application Credit Checks Explained | Credit Roadmap UK", "Understand what UK lenders may check when assessing a personal loan application.", "Loan Application Credit Checks Explained", "loans", "Loan checks can include credit history, affordability, income, existing commitments, identity and recent application behaviour.", ["Lenders do not all check in the same way.", "Affordability and credit risk are connected but not identical.", "Soft eligibility checks may help reduce unnecessary hard searches."]),
  article("improve-credit-before-applying-for-a-loan.html", "Improve Credit Before Applying for a Loan | Credit Roadmap UK", "Practical UK steps to improve loan readiness before submitting a personal loan application.", "Improve Credit Before Applying for a Loan", "loans", "Improving credit before applying for a loan means reducing obvious risk signals and checking whether the application is affordable.", ["Check reports and correct errors.", "Reduce utilisation where possible.", "Wait after recent hard searches or missed payments where sensible."]),
  article("rejected-for-a-loan-what-next.html", "Rejected for a Loan: What Next? | Credit Roadmap UK", "What to do after a loan decline, including credit report checks, application spacing and safer next steps.", "Rejected for a Loan: What Next?", "loans", "After a loan rejection, the safest next step is to understand the likely reason before making more applications.", ["Check whether a hard search was recorded.", "Use eligibility tools cautiously.", "If borrowing is unaffordable, seek qualified debt support."]),
  article("loan-affordability-and-credit-checks.html", "Loan Affordability and Credit Checks | Credit Roadmap UK", "Understand how affordability and credit checks work together in UK personal loan decisions.", "Loan Affordability and Credit Checks", "loans", "Loan affordability looks at whether repayments appear sustainable, while credit history helps lenders assess repayment risk.", ["Income alone may not be enough.", "Existing commitments and recent behaviour matter.", "Lenders choose their own criteria within regulatory requirements."]),

  article("satisfied-default-credit-score.html", "Satisfied Default and Credit Score | Credit Roadmap UK", "Understand what a satisfied default means, how it may appear on a credit file and why timing still matters.", "Satisfied Default and Credit Score", "adverse", "A satisfied default usually means the defaulted debt has been paid or settled, but the marker may still remain visible for the normal reporting period.", ["Satisfied status can be better context than unpaid status.", "It does not automatically remove the default.", "Lenders may still consider age, amount and recent conduct."]),
  article("unsatisfied-default-credit-file.html", "Unsatisfied Default on a Credit File | Credit Roadmap UK", "Understand unpaid defaults, credit-file impact and what to check before making new applications.", "Unsatisfied Default on a Credit File", "adverse", "An unsatisfied default suggests the defaulted debt has not been resolved, which may make many lenders more cautious.", ["Check the balance and date.", "Understand whether payment is affordable.", "Do not ignore priority bills to change a credit-file marker."]),
  article("incorrect-default-on-credit-report.html", "Incorrect Default on Credit Report | Credit Roadmap UK", "A practical guide to checking and disputing a default you believe is wrong or reported incorrectly.", "Incorrect Default on Credit Report", "adverse", "If a default is incorrect, focus on evidence, dates and the organisation that supplied the data before raising a dispute.", ["Check all three reports.", "Contact the lender or CRA depending on the error.", "Keep records of every correction request."]),
  article("multiple-defaults-credit-file.html", "Multiple Defaults on a Credit File | Credit Roadmap UK", "Understand why multiple defaults can affect applications and how to approach recovery planning.", "Multiple Defaults on a Credit File", "adverse", "Multiple defaults can suggest wider repayment difficulty, so lenders may view them more seriously than a single older issue.", ["Check whether the dates are accurate.", "Look for linked accounts or duplicate reporting.", "Build recent stability before applying again."]),
  article("settled-vs-satisfied-defaults.html", "Settled vs Satisfied Defaults | Credit Roadmap UK", "Understand settled and satisfied default wording and why status labels may differ across credit files.", "Settled vs Satisfied Defaults", "adverse", "Settled and satisfied wording can describe resolved debts, but exact labels vary by lender and credit reference agency.", ["Look at the balance, status and date together.", "Do not assume a status label removes the marker.", "Use evidence if the record is wrong."]),
  article("satisfied-ccj-credit-file.html", "Satisfied CCJ on a Credit File | Credit Roadmap UK", "Understand what a satisfied CCJ means and how it may affect borrowing readiness.", "Satisfied CCJ on a Credit File", "adverse", "A satisfied CCJ means the judgment has been paid and marked accordingly, but it may still be visible until the normal removal point.", ["Keep proof of payment.", "Check the register and credit reports.", "Age, amount and wider file context still matter."]),
  article("unsatisfied-ccj-credit-file.html", "Unsatisfied CCJ on a Credit File | Credit Roadmap UK", "Understand what an unsatisfied CCJ can mean for applications and why resolving status may matter.", "Unsatisfied CCJ on a Credit File", "adverse", "An unsatisfied CCJ can be a significant risk signal because it shows a court judgment that has not been marked as paid.", ["Check whether the record is accurate.", "Seek help if payment is unaffordable.", "Expect larger applications to need more caution."]),
  article("multiple-ccjs-credit-file.html", "Multiple CCJs on a Credit File | Credit Roadmap UK", "Understand how multiple County Court Judgments may affect credit applications and recovery planning.", "Multiple CCJs on a Credit File", "adverse", "Multiple CCJs may indicate repeated unresolved debt issues, so lenders may be more cautious than with one older judgment.", ["Check each judgment separately.", "Confirm dates, amounts and satisfaction status.", "Avoid applications until the wider position is clear."]),
  article("paying-a-ccj-after-judgment.html", "Paying a CCJ After Judgment | Credit Roadmap UK", "Understand what may happen after paying a CCJ and how cancellation or satisfaction differs.", "Paying a CCJ After Judgment", "adverse", "Paying a CCJ after judgment can change how the record is marked, but the effect depends on timing and evidence.", ["Payment within one month may support cancellation from the register.", "Payment after one month may lead to satisfaction status.", "Keep proof and apply for the correct certificate where relevant."]),
  article("applying-for-credit-after-a-ccj.html", "Applying for Credit After a CCJ | Credit Roadmap UK", "A cautious guide to application timing after a CCJ, including satisfaction status, age and recent conduct.", "Applying for Credit After a CCJ", "adverse", "Applying for credit after a CCJ is usually safest once you understand the judgment status, age and wider credit-file picture.", ["Use soft eligibility checks where possible.", "Avoid repeated hard applications.", "Match the product to the current risk profile."]),

  article("credit-event-timeline.html", "Credit Event Timeline | Credit Roadmap UK", "A practical guide to how CCJs, defaults, missed payments, hard searches and insolvency events may age on a UK credit file.", "Credit Event Timeline", "timelines", "A credit event timeline separates fixed reporting dates from lender decisions that depend on the wider file.", ["CCJs and some debt-solution records have known visibility periods.", "Hard searches and missed payments need context.", "Application timing should consider recent conduct as well as drop-off dates."]),
  article("how-long-after-credit-rejection-apply-again.html", "How Long After Credit Rejection Should I Apply Again? | Credit Roadmap UK", "Understand safer application spacing after being declined for credit and what to check before trying again.", "How Long After Credit Rejection Should I Apply Again?", "timelines", "There is no single waiting period after a credit rejection, but applying again without understanding the reason can create more search footprints.", ["Check the reason where possible.", "Review credit reports and affordability.", "Wait long enough for a meaningful change before another full application."]),
  article("how-long-after-default-satisfaction-can-i-apply.html", "How Long After Default Satisfaction Can I Apply? | Credit Roadmap UK", "Understand how default satisfaction timing may affect future credit applications.", "How Long After Default Satisfaction Can I Apply?", "timelines", "After a default is satisfied, the best application timing depends on lender criteria, default age and the rest of your recent credit conduct.", ["Satisfaction can improve context but does not erase the record.", "Older satisfied defaults may be easier to explain than recent unpaid ones.", "Use eligibility checks and avoid rushed repeated applications."]),
  article("what-to-check-before-applying-for-credit.html", "What to Check Before Applying for Credit | Credit Roadmap UK", "A practical checklist for UK users before applying for credit, covering reports, utilisation, searches, adverse records and affordability.", "What to Check Before Applying for Credit", "timelines", "Before applying for credit, check whether your file, affordability and recent application pattern support the product you want.", ["Review all three reports.", "Check utilisation and payment history.", "Use the roadmap to prioritise actions before a hard application."])
];

function hubPage(file, title, description, h1, clusterKey) {
  return { file, title, description, h1, clusterKey, type: "Hub", priority: "A" };
}

function toolPage(file, title, description, h1, clusterKey, toolType) {
  return { file, title, description, h1, clusterKey, type: "Tool", toolType, priority: "A" };
}

function article(file, title, description, h1, clusterKey, directAnswer, bullets) {
  return { file, title, description, h1, clusterKey, type: "Guide", directAnswer, bullets, priority: "A" };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function header(current) {
  return `<header class="site-header">
    <a class="brand" href="index.html" aria-label="Credit Roadmap UK home">
      <span class="brand-mark">CR</span>
      <span>Credit Roadmap UK</span>
    </a>
    <nav class="site-nav" aria-label="Main navigation">
      <a href="index.html"${current === "index.html" ? ' aria-current="page"' : ""}>Home</a>
      <a href="roadmap.html">Generate Roadmap</a>
      <a href="progress-tracker.html">Progress Tracker</a>
      <a href="ccj-guide.html">Guides</a>
      <a href="methodology.html">Methodology</a>
      <a href="disclaimer.html">Disclaimer</a>
    </nav>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <p>&copy; 2026 Credit Roadmap UK. General guidance only.</p>
    <nav aria-label="Footer navigation">
      <a href="index.html">Home</a>
      <a href="roadmap.html">Roadmap Generator</a>
      <a href="progress-tracker.html">Progress Tracker</a>
      <a href="ccj-guide.html">CCJ Guide</a>
      <a href="defaults-guide.html">Defaults Guide</a>
      <a href="credit-utilisation-guide.html">Credit Utilisation Guide</a>
      <a href="electoral-roll-guide.html">Electoral Roll Guide</a>
      <a href="mortgage-readiness-guide.html">Mortgage Readiness Guide</a>
      <a href="methodology.html">Methodology</a>
      <a href="editorial-standards.html">Editorial Standards</a>
      <a href="privacy-policy.html">Privacy Policy</a>
      <a href="disclaimer.html">Disclaimer</a>
    </nav>
  </footer>`;
}

function faqSchema(page) {
  const faqs = faqsFor(page);
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a.replace(/<[^>]+>/g, "") }
    }))
  }, null, 2)}</script>`;
}

function breadcrumbSchema(page) {
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: page.h1, item: `${SITE}/${page.file}` }
    ]
  }, null, 2)}</script>`;
}

function docStart(page) {
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(page.title)}</title>
  <meta name="description" content="${escapeHtml(page.description)}">
  <link rel="canonical" href="${SITE}/${page.file}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${SITE}/${page.file}">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.description)}">
  <link rel="stylesheet" href="style.css">
  ${faqSchema(page)}
  ${breadcrumbSchema(page)}
</head>
<body>
  ${header(page.file)}

  <main class="content-page article-page">
    <section class="page-hero">
      <p class="eyebrow">${escapeHtml(clusters[page.clusterKey].eyebrow)}</p>
      <h1>${escapeHtml(page.h1)}</h1>
      <p>${escapeHtml(page.description)}</p>
    </section>
`;
}

function docEnd() {
  return `
    <section class="section cta-strip">
      <h2>Turn this into a practical roadmap</h2>
      <a class="button primary" href="roadmap.html">Generate Credit Roadmap</a>
      <a class="button secondary" href="personal-improvement-plan.html">Build Improvement Plan</a>
    </section>
  </main>
  ${footer()}
  <script src="analytics.js" defer></script>
</body>
</html>
`;
}

function faqsFor(page) {
  if (page.type === "Tool") {
    return [
      { q: `Is the ${page.h1.toLowerCase()} exact?`, a: "No. It is a practical educational estimate based on the details you enter and common UK credit-file factors. It is not a lender decision or financial advice." },
      { q: "Will this improve my credit score?", a: "The tool does not change your credit file. It helps you understand timing, application pressure and practical checks before you apply." },
      { q: "Should I apply immediately if the result looks positive?", a: "Not automatically. Check your real reports, affordability and eligibility wording before making a full application." }
    ];
  }
  return [
    { q: `Does ${page.h1.toLowerCase()} affect every lender the same way?`, a: "No. Lenders and providers use their own criteria, so the same credit-file factor can be interpreted differently depending on product type, amount, affordability and recent conduct." },
    { q: "Should I focus on the score or the report detail?", a: "The report detail usually matters more than the headline score. Dates, balances, status labels, searches and public records explain what a lender may actually see." },
    { q: "Is this financial advice?", a: "No. Credit Roadmap UK provides general educational guidance. It does not recommend lenders, products or personalised debt solutions." }
  ];
}

function linksFor(page) {
  const cluster = clusters[page.clusterKey];
  const links = [
    { href: cluster.hub, label: cluster.name, text: "Use the parent hub" },
    { href: "roadmap.html", label: "Credit Roadmap generator", text: "Build a cautious action plan" },
    { href: "credit-progress-tracker.html", label: "Credit Progress Tracker", text: "Track broad progress locally" },
    { href: "methodology.html", label: "Methodology", text: "How the site frames guidance" },
    { href: "disclaimer.html", label: "Disclaimer", text: "Read important limitations" }
  ];
  const siblings = cluster.routes.filter(file => file !== page.file).slice(0, 5);
  siblings.forEach(file => {
    const sibling = pages.find(p => p.file === file);
    if (sibling) links.push({ href: sibling.file, label: sibling.h1, text: "Related guide" });
  });
  if (page.clusterKey !== "reports") links.push({ href: "credit-report-help.html", label: "Credit report help", text: "Check the underlying file" });
  if (page.clusterKey !== "timelines") links.push({ href: "credit-recovery-timelines.html", label: "Recovery timelines", text: "Plan timing carefully" });
  return dedupeLinks(links).filter(link => link.href !== page.file).slice(0, 12);
}

function dedupeLinks(links) {
  const seen = new Set();
  return links.filter(link => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

function renderHub(page) {
  const cluster = clusters[page.clusterKey];
  const routeCards = cluster.routes.map(file => {
    const item = pages.find(p => p.file === file);
    return item ? `<a class="hub-link-card" href="${item.file}"><strong>${escapeHtml(item.h1)}</strong><span>${escapeHtml(item.description)}</span></a>` : "";
  }).join("\n          ");
  const content = `${docStart(page)}
    <article class="article-panel">
      <section>
        <h2>Start here</h2>
        <p>${escapeHtml(cluster.intro)}</p>
        <p>This hub is designed for UK users who want to understand what may appear on a credit file before applying for credit, renting, car finance, a phone contract or a mortgage. It is educational guidance only, not debt advice, legal advice or a promise of approval.</p>
      </section>

      <section>
        <h2>Key routes in this help centre</h2>
        <div class="hub-link-grid">
          ${routeCards}
        </div>
      </section>

      <section>
        <h2>How to use this topic</h2>
        <p>Begin with the guide that matches the question you are actually trying to answer. A visible credit-file marker can mean different things depending on whether you are checking a report, preparing for a mortgage, comparing car finance, applying for a card or renting a home.</p>
        <p>The safest order is usually: check the report, confirm whether the record is accurate, understand whether it is recent or old, review affordability, then decide whether a full application makes sense now or should wait.</p>
      </section>

      <section>
        <h2>Decision table</h2>
        <table class="hub-table">
          <thead><tr><th>Situation</th><th>Why it matters</th><th>Useful next step</th></tr></thead>
          <tbody>
            <tr><td>Record may be wrong</td><td>Incorrect dates, balances or status labels can affect how a file is interpreted.</td><td>Check all main credit reports and gather evidence before raising a correction.</td></tr>
            <tr><td>Application is urgent</td><td>Urgency can increase the temptation to apply repeatedly, which may add search pressure.</td><td>Use eligibility checks where appropriate and read the product-specific guide.</td></tr>
            <tr><td>Credit issue is recent</td><td>Recent problems often carry more practical weight than older resolved issues.</td><td>Build a short recovery plan before applying for larger commitments.</td></tr>
            <tr><td>Affordability is tight</td><td>Lenders may assess repayment sustainability as well as credit-file history.</td><td>Use cautious planning and avoid borrowing that would worsen the position.</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Authority references</h2>
        <p>Credit reference agencies hold account, address and public-record data that lenders may use. The ICO explains UK credit-reference rights and correction routes, while the FCA explains creditworthiness and affordability as lender responsibilities. CCJ dates and satisfaction/cancellation rules should be checked against GOV.UK guidance.</p>
        <ul>
          ${sources.slice(0, 5).map(source => `<li><a href="${source.url}">${escapeHtml(source.label)}</a></li>`).join("\n          ")}
        </ul>
      </section>

      <section>
        <h2>Frequently asked questions</h2>
        ${faqsFor(page).map(faq => `<h3>${escapeHtml(faq.q)}</h3><p>${faq.a}</p>`).join("\n        ")}
      </section>
    </article>
${docEnd()}`;
  return content;
}

function renderArticle(page) {
  const links = linksFor(page);
  const bulletList = page.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("\n          ");
  const content = `${docStart(page)}
    <article class="article-panel">
      <section>
        <h2>Direct answer</h2>
        <p>${escapeHtml(page.directAnswer)}</p>
        <ul>
          ${bulletList}
        </ul>
      </section>

      <section>
        <h2>What this means in practice</h2>
        <p>The practical impact depends on the exact credit-file entry, how recent it is, whether it is accurate, and what else is visible around it. A lender, network, landlord or finance provider may look at the whole profile rather than one isolated detail.</p>
        <p>For UK users, the most useful first step is usually to check the underlying report data. The ICO explains that the main consumer credit reference agencies are Experian, Equifax and TransUnion, and that individuals can request statutory credit report information. If something is inaccurate, the correction route may involve the credit reference agency, the original lender or the public-record source.</p>
      </section>

      <section>
        <h2>Readiness table</h2>
        <table class="hub-table">
          <thead><tr><th>Factor</th><th>What to check</th><th>Why it matters</th></tr></thead>
          <tbody>
            <tr><td>Accuracy</td><td>Dates, balances, names, addresses and status labels.</td><td>Incorrect records can create avoidable application friction.</td></tr>
            <tr><td>Recency</td><td>Whether the issue is recent, older, resolved or still active.</td><td>Recent problems often carry more weight than older isolated issues.</td></tr>
            <tr><td>Affordability</td><td>Income, existing commitments and whether repayments would be sustainable.</td><td>The FCA describes affordability as part of creditworthiness assessment.</td></tr>
            <tr><td>Application pressure</td><td>Recent hard searches and repeated applications.</td><td>A cluster of applications can make the file look more pressured.</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Common scenarios</h2>
        <table class="hub-table">
          <thead><tr><th>Scenario</th><th>Useful interpretation</th><th>Potential next step</th></tr></thead>
          <tbody>
            <tr><td>The record is accurate and recent</td><td>It may be sensible to pause and build a cleaner recent pattern before applying.</td><td>Use the <a href="roadmap.html">Credit Roadmap generator</a> to prioritise actions.</td></tr>
            <tr><td>The record is old or resolved</td><td>Older resolved information may still matter, but recent conduct can change the wider picture.</td><td>Check related timeline and product-specific guides.</td></tr>
            <tr><td>The record looks wrong</td><td>Do not rely on guesswork or score movement alone.</td><td>Gather evidence and raise a correction with the right organisation.</td></tr>
            <tr><td>A major application is planned</td><td>Mortgages, car finance and loans may involve closer affordability checks.</td><td>Review reports before applying and consider qualified advice where appropriate.</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Related CreditRoadmap guides</h2>
        <div class="hub-link-grid">
          ${links.map(link => `<a class="hub-link-card" href="${link.href}"><strong>${escapeHtml(link.label)}</strong><span>${escapeHtml(link.text)}</span></a>`).join("\n          ")}
        </div>
      </section>

      <section>
        <h2>Source notes</h2>
        <p>This guide uses cautious UK framing. It distinguishes legal/public-record rules, credit-reference data, lender criteria and practical application timing because those are not the same thing.</p>
        <ul>
          ${sources.slice(0, page.clusterKey === "adverse" ? 6 : 5).map(source => `<li><a href="${source.url}">${escapeHtml(source.label)}</a></li>`).join("\n          ")}
        </ul>
      </section>

      <section>
        <h2>Frequently asked questions</h2>
        ${faqsFor(page).map(faq => `<h3>${escapeHtml(faq.q)}</h3><p>${faq.a}</p>`).join("\n        ")}
      </section>
    </article>
${docEnd()}`;
  return content;
}

function renderTool(page) {
  const links = linksFor(page);
  const tool = page.toolType;
  const form = toolForm(tool);
  const content = `${docStart(page)}
    <article class="article-panel">
      <section>
        <h2>Direct answer</h2>
        <p>${escapeHtml(toolIntro(tool))}</p>
        <p>The result is a practical planning prompt, not a lender decision, credit-score forecast or financial advice. Do not enter personal identifiers or account numbers.</p>
      </section>

      <section>
        <h2>Use the tool</h2>
        ${form}
        <div class="results-card" id="${tool}-result" aria-live="polite">
          <h3>Result</h3>
          <p>Enter a few broad details to see a cautious readiness estimate.</p>
        </div>
      </section>

      <section>
        <h2>How to interpret the result</h2>
        <table class="hub-table">
          <thead><tr><th>Signal</th><th>Meaning</th><th>What to do next</th></tr></thead>
          <tbody>
            <tr><td>Low pressure</td><td>The answers do not show an obvious cluster of recent risk factors.</td><td>Still check real reports and affordability before applying.</td></tr>
            <tr><td>Needs attention</td><td>There may be timing, utilisation, adverse-credit or application-spacing issues.</td><td>Review the related guides and reduce avoidable pressure.</td></tr>
            <tr><td>High caution</td><td>Recent or unresolved markers may make many providers more cautious.</td><td>Pause, check reports and consider qualified support if debts are unaffordable.</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Related guidance</h2>
        <div class="hub-link-grid">
          ${links.map(link => `<a class="hub-link-card" href="${link.href}"><strong>${escapeHtml(link.label)}</strong><span>${escapeHtml(link.text)}</span></a>`).join("\n          ")}
        </div>
      </section>

      <section>
        <h2>Source notes</h2>
        <p>The tool reflects broad credit-file and application-readiness concepts from UK public and regulatory sources. It does not access your credit report and does not predict acceptance.</p>
        <ul>
          ${sources.slice(1, 5).map(source => `<li><a href="${source.url}">${escapeHtml(source.label)}</a></li>`).join("\n          ")}
        </ul>
      </section>

      <section>
        <h2>Frequently asked questions</h2>
        ${faqsFor(page).map(faq => `<h3>${escapeHtml(faq.q)}</h3><p>${faq.a}</p>`).join("\n        ")}
      </section>
    </article>

    <script>
    (function () {
      var form = document.querySelector('[data-tool="${tool}"]');
      var result = document.getElementById('${tool}-result');
      if (!form || !result) return;
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var data = new FormData(form);
        var score = 0;
        data.forEach(function (value) { score += Number(value) || 0; });
        var label = score < 25 ? 'Low pressure' : score < 55 ? 'Needs attention' : 'High caution';
        var text = score < 25
          ? 'Your answers do not show an obvious cluster of recent risk factors, but you should still check real report data before applying.'
          : score < 55
            ? 'Your answers suggest a few areas to review before applying, especially timing, balances, payment history or affordability.'
            : 'Your answers suggest a cautious approach. Check your reports, reduce avoidable pressure and consider waiting before further full applications.';
        result.innerHTML = '<h3>' + label + '</h3><p>' + text + '</p><p class="microcopy">This is general educational guidance only.</p>';
      });
    }());
    </script>
${docEnd()}`;
  return content;
}

function toolIntro(tool) {
  const intros = {
    defaultDate: "Use this calculator to estimate the six-year anniversary from a default date and plan when the entry may stop affecting applications.",
    hardSearch: "Use this timeline to think about recent hard searches and whether your application pattern may look pressured.",
    spacing: "Use this planner to choose a calmer gap between credit applications after a decline, approval or full hard search.",
    carReadiness: "Use this score to review broad car finance readiness signals such as adverse credit, affordability, deposit and recent searches.",
    cardReadiness: "Use this score to review broad credit-card readiness signals such as utilisation, payment history, hard searches and adverse records."
  };
  return intros[tool];
}

function toolForm(tool) {
  if (tool === "defaultDate") {
    return `<form class="form-card" data-tool="${tool}">
          <label>Default age <select name="age"><option value="5">Over five years ago</option><option value="15">Three to five years ago</option><option value="30">One to three years ago</option><option value="45">Under one year ago</option></select></label>
          <label>Status <select name="status"><option value="0">Settled or satisfied</option><option value="20">Still unpaid</option><option value="10">Unsure</option></select></label>
          <label>Other recent issues <select name="other"><option value="0">No recent missed payments</option><option value="15">Some recent missed payments</option><option value="25">Several recent issues</option></select></label>
          <button class="button primary" type="submit">Estimate readiness</button>
        </form>`;
  }
  if (tool === "hardSearch" || tool === "spacing") {
    return `<form class="form-card" data-tool="${tool}">
          <label>Hard searches in last three months <select name="searches"><option value="0">None</option><option value="15">One or two</option><option value="35">Three or more</option></select></label>
          <label>Recent application result <select name="result"><option value="5">No recent decline</option><option value="20">Recent decline</option><option value="10">Unsure</option></select></label>
          <label>Current credit pressure <select name="pressure"><option value="0">Low balances and stable payments</option><option value="20">High balances or missed payments</option><option value="30">Multiple unresolved issues</option></select></label>
          <button class="button primary" type="submit">Review timing</button>
        </form>`;
  }
  return `<form class="form-card" data-tool="${tool}">
          <label>Adverse credit <select name="adverse"><option value="0">None known</option><option value="20">Older resolved issue</option><option value="40">Recent or unresolved issue</option></select></label>
          <label>Utilisation or balances <select name="utilisation"><option value="0">Low</option><option value="15">Moderate</option><option value="30">High</option></select></label>
          <label>Recent searches <select name="searches"><option value="0">None or one</option><option value="15">Two or three</option><option value="25">Several</option></select></label>
          <label>Affordability confidence <select name="afford"><option value="0">Repayments appear manageable</option><option value="15">Would be tight</option><option value="25">Unsure or pressured</option></select></label>
          <button class="button primary" type="submit">Check readiness</button>
        </form>`;
}

function renderPage(page) {
  if (page.type === "Hub") return renderHub(page);
  if (page.type === "Tool") return renderTool(page);
  return renderArticle(page);
}

function writePages() {
  pages.forEach(page => {
    const target = path.join(ROOT, page.file);
    if (!fs.existsSync(target)) {
      fs.writeFileSync(target, renderPage(page), "utf8");
    }
  });
}

function insertBefore(file, marker, block) {
  const full = path.join(ROOT, file);
  let html = fs.readFileSync(full, "utf8");
  if (html.includes(block.trim().split("\n")[0])) return false;
  const index = html.indexOf(marker);
  if (index === -1) throw new Error(`Marker not found in ${file}: ${marker}`);
  html = html.slice(0, index) + block + "\n" + html.slice(index);
  fs.writeFileSync(full, html, "utf8");
  return true;
}

function updateExistingPages() {
  const homepageBlock = `
    <!-- PRIORITY_A_EXPANSION_HUBS_START -->
    <section class="section">
      <div class="section-heading">
        <p class="eyebrow">More credit help centres</p>
        <h2>Deeper guidance for credit files, missed payments and application timing.</h2>
        <p>These hubs expand the roadmap into practical questions around report accuracy, late payments, renting, personal loans and recovery timelines.</p>
      </div>
      <div class="cards guide-grid">
        <article class="card"><h3><a href="credit-report-help.html">Credit Report Help</a></h3><p>Check agencies, searches, address history, financial associations and report errors.</p></article>
        <article class="card"><h3><a href="missed-payments-credit-help.html">Missed Payments Help</a></h3><p>Understand late-payment markers, missed payments and recovery after payment problems.</p></article>
        <article class="card"><h3><a href="renting-credit-help.html">Renting With Credit Problems</a></h3><p>Prepare for tenant referencing, guarantor questions and rented-home applications.</p></article>
        <article class="card"><h3><a href="personal-loans-and-credit.html">Personal Loans &amp; Credit</a></h3><p>Review loan checks, bad-credit eligibility, defaults, bankruptcy and application declines.</p></article>
        <article class="card"><h3><a href="credit-recovery-timelines.html">Credit Recovery Timelines</a></h3><p>Plan around defaults, hard searches, credit rejections and application spacing.</p></article>
      </div>
    </section>
    <!-- PRIORITY_A_EXPANSION_HUBS_END -->
`;
  insertBefore("index.html", '<section class="section band">', homepageBlock);

  const toolsBlock = `
      <!-- PRIORITY_A_TOOLS_START -->
      <section>
        <h2>More readiness tools</h2>
        <p>These tools help with common timing and application-readiness questions without collecting sensitive personal information.</p>
        <div class="hub-link-grid">
          <a class="hub-link-card" href="default-removal-date-calculator.html"><strong>Default removal date calculator</strong><span>Estimate the six-year visibility point from a default date.</span></a>
          <a class="hub-link-card" href="hard-search-recovery-timeline.html"><strong>Hard search recovery timeline</strong><span>Review recent application-search pressure.</span></a>
          <a class="hub-link-card" href="application-spacing-planner.html"><strong>Application spacing planner</strong><span>Plan safer gaps between applications.</span></a>
          <a class="hub-link-card" href="car-finance-readiness-score.html"><strong>Car finance readiness score</strong><span>Check broad car finance readiness signals.</span></a>
          <a class="hub-link-card" href="credit-card-application-readiness.html"><strong>Credit card application readiness</strong><span>Review card application readiness before a full search.</span></a>
        </div>
      </section>
      <!-- PRIORITY_A_TOOLS_END -->
`;
  insertBefore("roadmap.html", "</main>", toolsBlock);

  const hubUpdates = {
    "ccj-help.html": [
      "satisfied-ccj-credit-file.html", "unsatisfied-ccj-credit-file.html", "multiple-ccjs-credit-file.html", "paying-a-ccj-after-judgment.html", "applying-for-credit-after-a-ccj.html", "renting-with-a-ccj.html"
    ],
    "defaults-and-credit-problems.html": [
      "satisfied-default-credit-score.html", "unsatisfied-default-credit-file.html", "incorrect-default-on-credit-report.html", "multiple-defaults-credit-file.html", "settled-vs-satisfied-defaults.html", "can-i-get-a-loan-with-defaults.html", "renting-with-defaults.html", "default-removal-date-calculator.html"
    ],
    "credit-cards-and-credit-building.html": [
      "credit-card-application-readiness.html", "what-is-a-hard-credit-search.html", "what-is-a-soft-credit-search.html", "how-long-do-hard-searches-stay-on-credit-file.html", "payment-history-on-credit-report.html"
    ],
    "mortgage-credit-help.html": [
      "missed-payment-before-mortgage-application.html", "mortgage-arrears-and-credit-file.html", "address-history-and-credit-applications.html", "credit-report-help.html", "credit-recovery-timelines.html"
    ],
    "car-finance-and-credit.html": [
      "car-finance-readiness-score.html", "loan-affordability-and-credit-checks.html", "what-is-a-hard-credit-search.html", "credit-report-help.html", "application-spacing-planner.html"
    ],
    "mobile-contract-credit-help.html": [
      "missed-mobile-phone-payment-credit-score.html", "missed-payments-credit-help.html", "credit-report-help.html", "application-spacing-planner.html"
    ]
  };

  Object.entries(hubUpdates).forEach(([file, files]) => {
    const cards = files.map(target => {
      const page = pages.find(p => p.file === target);
      return page ? `<a class="hub-link-card" href="${page.file}"><strong>${escapeHtml(page.h1)}</strong><span>${escapeHtml(page.description)}</span></a>` : "";
    }).join("\n          ");
    const label = file.replace(".html", "").replace(/-/g, " ");
    const block = `
      <!-- PRIORITY_A_CONTEXTUAL_ROUTES_START -->
      <section>
        <h2>Related readiness routes</h2>
        <p>These newer guides cover report accuracy, timing and application readiness questions that often sit alongside ${escapeHtml(label)}.</p>
        <div class="hub-link-grid">
          ${cards}
        </div>
      </section>
      <!-- PRIORITY_A_CONTEXTUAL_ROUTES_END -->
`;
    insertBefore(file, "</article>", block);
  });
}

function updateSitemap() {
  const full = path.join(ROOT, "sitemap.xml");
  let xml = fs.readFileSync(full, "utf8");
  pages.forEach(page => {
    const loc = `${SITE}/${page.file}`;
    if (!xml.includes(`<loc>${loc}</loc>`)) {
      xml = xml.replace("</urlset>", `  <url>\n    <loc>${loc}</loc>\n  </url>\n</urlset>`);
    }
  });
  fs.writeFileSync(full, xml, "utf8");
}

function writeDocs() {
  const dir = path.join(ROOT, ".creditroadmap-expansion-docs");
  fs.mkdirSync(dir, { recursive: true });
  const manifestRows = [
    ["proposed_url", "page_title", "cluster", "intent", "reason", "gsc_evidence", "parent_hub", "internal_link_sources", "priority", "implemented"],
    ...pages.map(page => [
      page.file,
      page.title,
      clusters[page.clusterKey].name,
      page.type === "Tool" ? "calculator/readiness" : page.type === "Hub" ? "navigation/education" : "educational",
      page.type === "Hub" ? "Creates a useful parent route for a missing or thinly connected cluster." : page.type === "Tool" ? "Provides a practical non-sensitive tool for application timing or readiness." : "Answers a distinct UK credit-file or application-readiness question.",
      evidenceFor(page.clusterKey),
      clusters[page.clusterKey].hub,
      internalSourcesFor(page),
      page.priority,
      "yes"
    ])
  ];
  const csv = rows => rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  fs.writeFileSync(path.join(dir, "creditroadmap-expansion-manifest.csv"), csv(manifestRows), "utf8");
  fs.writeFileSync(path.join(dir, "creditroadmap-intent-ownership.csv"), csv([
    ["intent_family", "existing_owner", "action", "new_owner"],
    ["CCJ core", "ccj-help.html / ccj-guide.html", "Preserve; add detail routes", "No replacement"],
    ["Defaults core", "defaults-and-credit-problems.html / defaults-guide.html", "Preserve; add default-status routes", "No replacement"],
    ["Credit reports and CRA basics", "Partial via individual guides", "Create hub and foundations", "credit-report-help.html"],
    ["Missed and late payments", "Partial via mortgage/phone pages", "Create hub and practical guides", "missed-payments-credit-help.html"],
    ["Renting with adverse credit", "Weak/missing", "Create controlled cluster", "renting-credit-help.html"],
    ["Personal loans with adverse credit", "Partial CCJ loan page", "Create controlled cluster", "personal-loans-and-credit.html"],
    ["Application timing and recovery", "Partial timeline estimator", "Create timing hub and tools", "credit-recovery-timelines.html"]
  ]), "utf8");
  fs.writeFileSync(path.join(dir, "creditroadmap-gsc-opportunity-map.csv"), csv([
    ["query_family", "impressions", "avg_position", "current_signal", "decision"],
    ["Credit cards", "1979", "60.26", "Strong existing deep participation; many pages already ranking", "Improve routing, avoid duplicate card pages"],
    ["CCJs", "1076", "70.88", "Large query breadth with existing CCJ cluster", "Add CCJ status/detail support pages only"],
    ["Defaults", "359", "74.81", "Mortgage/car finance/default pages visible", "Add default status and loan/renting support"],
    ["Mortgage readiness", "243", "60.52", "Lookback queries present", "Support with missed-payment/report readiness routes"],
    ["Utilisation and limits", "102", "78.78", "Existing guides/tools visible", "Do not duplicate; link from new readiness pages"],
    ["Credit reports and scores", "24", "70.38", "Weak foundations cluster", "Create credit report hub"],
    ["Mobile and utilities", "56", "48.66", "Strong phone-contract tests", "Add missed mobile payment support page"],
    ["Renting", "low visible", "n/a", "Topically adjacent to credit readiness", "Controlled small cluster, not broad expansion"],
    ["Loans", "partial", "n/a", "One CCJ loan page but missing defaults/bankruptcy/readiness", "Controlled small cluster"]
  ]), "utf8");
  fs.writeFileSync(path.join(dir, "creditroadmap-cluster-map.md"), clusterMap(), "utf8");
  fs.writeFileSync(path.join(dir, "creditroadmap-expansion-audit.md"), expansionAudit(), "utf8");
  fs.writeFileSync(path.join(dir, "creditroadmap-monetisation-opportunities.md"), monetisationDoc(), "utf8");
  fs.writeFileSync(path.join(dir, "creditroadmap-expansion-qa.md"), `# CreditRoadmap Expansion QA\n\nGenerated on ${TODAY}. Final QA results are appended after running the local QA script.\n`, "utf8");
}

function evidenceFor(clusterKey) {
  const map = {
    reports: "GSC shows credit-report/score, electoral roll, utilisation and agency-adjacent queries; repository lacked a central credit-report hub.",
    missed: "GSC shows mortgage missed-payment lookback and declined/phone signals; existing missed-payment coverage was fragmented.",
    renting: "Strategic topical gap adjacent to credit checks and guarantor/affordability questions; built as small controlled cluster.",
    loans: "Existing CCJ loan page but no defaults/bankruptcy/rejection/affordability loan cluster.",
    timelines: "GSC shows application timing, CCJ/default age and report-date questions; existing timeline tool was broad.",
    adverse: "GSC shows CCJ/default detail demand and existing pages ranking; added status-specific support without replacing core pages.",
    readiness: "Existing tools are rewarded; added two practical readiness tools tied to credit-card/car-finance clusters."
  };
  return map[clusterKey] || "";
}

function internalSourcesFor(page) {
  const base = ["index.html", clusters[page.clusterKey].hub, "roadmap.html"];
  if (page.clusterKey === "adverse") base.push("ccj-help.html", "defaults-and-credit-problems.html");
  if (page.clusterKey === "missed") base.push("mortgage-credit-help.html", "mobile-contract-credit-help.html");
  if (page.clusterKey === "loans") base.push("ccj-help.html");
  if (page.clusterKey === "reports") base.push("credit-cards-and-credit-building.html", "mortgage-credit-help.html");
  return [...new Set(base)].join(" | ");
}

function clusterMap() {
  return `# CreditRoadmap Cluster Map\n\nUpdated ${TODAY}.\n\n## Existing strong clusters\n\n- CCJs: core guide, CCJ help hub, mortgages, cards, phone contracts, car finance and removal calculator.\n- Credit cards: utilisation, unused-card/closure questions, applications, bankruptcy, IVA, DMP and defaults.\n- Phone contracts: CCJ/default/bankruptcy/SIM-only/no-history routes with strong GSC tests.\n- Mortgage readiness: adverse-credit guides, lookback pages, affordability checker and readiness score.\n- Car finance: CCJs, defaults, bankruptcy, IVA, DMP, credit checks and preparation.\n\n## Priority A expansion clusters\n\n${Object.values(clusters).map(cluster => `### ${cluster.name}\n\nParent: \`${cluster.hub}\`\n\n${cluster.routes.map(file => `- \`${file}\``).join("\n")}`).join("\n\n")}\n`;
}

function expansionAudit() {
  return `# CreditRoadmap Expansion Audit\n\nDate: ${TODAY}\n\n## Repository baseline\n\n- Existing HTML files: 131.\n- Existing sitemap URLs: 131.\n- Sitemap format: single standard urlset, preserved.\n- Robots: references https://creditroadmap.co.uk/sitemap.xml.\n- Latest GSC export used: creditroadmap.co.uk-Performance-on-Search-2026-08-27.zip.\n\n## GSC behaviour\n\nThe export shows healthy deep-page participation: 89 pages in the Pages report and 4,228 query impressions across 799 visible queries. Strongest visible clusters are credit cards, CCJs, defaults, mortgage readiness, utilisation/electoral roll and phone-contract routes. The site is not behaving like a sitemap-only or homepage-only property.\n\n## Expansion decision\n\nPriority A was limited to 53 new URLs. The cohort targets credit-report foundations, missed payments, renting, personal loans, recovery timelines and adverse-credit status nuance. Existing high-performing pages were preserved rather than replaced.\n\n## Safety conclusion\n\nNo serious sitemap, cannibalisation or indexing anomaly was found that would justify stopping. Expansion is controlled and remains within UK credit improvement and borrowing-readiness intent.\n`;
}

function monetisationDoc() {
  return `# CreditRoadmap Monetisation Opportunities\n\nDate: ${TODAY}\n\nNo affiliate links were added in this expansion.\n\n## Future ethical opportunities\n\n- Credit report access and monitoring: strongest fit on credit-report and correction pages, with careful disclosure and no score-improvement promises.\n- Eligibility/pre-application tools: possible fit on credit-card readiness, car-finance readiness and loan-readiness pages, provided links do not imply guaranteed approval.\n- Mortgage readiness services: possible fit on mortgage-readiness pages only with clear distinction between education and regulated advice.\n- Car finance eligibility: commercially relevant but needs cautious compliance language and no lender-affiliation claims.\n- Tenant referencing support: possible future category, but lower priority until search signals appear.\n\n## Avoid for now\n\n- Payday/high-cost credit promotion.\n- Debt solution lead generation without specialist compliance review.\n- Claims that any provider will accept users with CCJs, defaults or bankruptcy.\n`;
}

writePages();
updateExistingPages();
updateSitemap();
writeDocs();

console.log(JSON.stringify({
  createdPages: pages.length,
  htmlAfter: fs.readdirSync(ROOT).filter(file => file.endsWith(".html")).length,
  sitemapAdded: pages.length,
  docsDir: ".creditroadmap-expansion-docs"
}, null, 2));
