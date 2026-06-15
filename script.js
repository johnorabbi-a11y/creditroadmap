function generateRoadmap() {

let ccj = document.getElementById("ccj").value;
let electoral = document.getElementById("electoral").value;
let utilisation = document.getElementById("utilisation").value;
let goal = document.getElementById("goal").value;

let issues = [];
let actions = [];

if (ccj === "Unpaid CCJ") {
    issues.push("Unpaid CCJ");
    actions.push("Pay CCJ as soon as possible");
}

if (electoral === "No") {
    issues.push("Not registered on electoral roll");
    actions.push("Register to vote");
}

if (utilisation === "75%+") {
    issues.push("High credit utilisation");
    actions.push("Reduce utilisation below 50%");
}

if (issues.length === 0) {
    issues.push("No major issues identified");
}

let html = `
<h2>Your Credit Roadmap</h2>

<p><strong>Goal:</strong> ${goal}</p>

<h3>Main Issues</h3>
<ul>
${issues.map(x => `<li>${x}</li>`).join("")}
</ul>

<h3>30 Day Plan</h3>
<ul>
${actions.map(x => `<li>${x}</li>`).join("")}
</ul>

<h3>12 Month Outlook</h3>
<p>Consistent positive behaviour should improve your credit profile.</p>
`;

document.getElementById("results").innerHTML = html;

}
