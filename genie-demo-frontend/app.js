// Hard-coded demo scenarios (you can tweak text to match your project)
const SCENARIOS = [
  {
    id: "housing_shock",
    title: "US housing slowdown with higher rates",
    tag: "Interest rates / housing",
    userPrompt:
      "How might a moderate rise in US interest rates affect the housing market and broader growth?",
    reply:
      "In this scenario, GENIE expects a gradual cooling in housing activity rather than a sharp collapse. " +
      "Higher policy rates raise mortgage costs, which slows new purchases and construction, " +
      "but steady employment and incomes prevent a broad wave of defaults."
  },
  {
    id: "energy_spike",
    title: "Oil price spike with soft global demand",
    tag: "Energy / inflation",
    userPrompt:
      "What happens if oil prices spike while global growth is still below trend?",
    reply:
      "GENIE interprets this as a stagflation-lite environment: headline inflation rises due to energy, " +
      "but underlying demand remains soft. Central banks keep a cautious bias rather than hiking aggressively, " +
      "and fiscal measures in some economies cushion the shock for households."
  },
  {
    id: "china_slowdown",
    title: "China slowdown and global spillovers",
    tag: "China / trade",
    userPrompt:
      "How would a sharper-than-expected slowdown in China affect the US and Europe?",
    reply:
      "GENIE forecasts weaker export demand for Europe and some emerging markets tied to Chinese supply chains, " +
      "while the US impact is milder and mostly financial (risk-off flows, stronger dollar). " +
      "Commodity exporters experience the largest downside risk."
  },
  {
    id: "uconn_budget",
    title: "Connecticut fiscal tightening",
    tag: "UConn / local",
    userPrompt:
      "Suppose Connecticut tightens its budget and slows state spending. How does that affect the local economy?",
    reply:
      "GENIE sees short-term drag on local growth as public projects are delayed and hiring slows. " +
      "However, a credible consolidation path improves state credit spreads and lowers borrowing costs over time, " +
      "creating room for targeted investment in infrastructure and higher education (including UConn)."
  },
  {
    id: "soft_landing",
    title: "‘Soft landing’ in the US",
    tag: "Growth / labor market",
    userPrompt:
      "What does a soft landing in the US look like in GENIE’s world model?",
    reply:
      "In a soft-landing configuration, GENIE keeps US growth slightly below long-run trend, " +
      "with unemployment drifting up only modestly. Inflation gradually returns to target, " +
      "allowing the Fed to stay on hold before a slow easing cycle. Risk sentiment stays cautious but constructive."
  }
];

const chatWindow = document.getElementById("chat-window");
const form = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const scenarioList = document.getElementById("scenario-list");

// Render scenario buttons
function renderScenarios() {
  SCENARIOS.forEach((scenario) => {
    const btn = document.createElement("button");
    btn.className = "scenario-btn";
    btn.type = "button";
    btn.dataset.id = scenario.id;
    btn.innerHTML = `
      <span class="scenario-title">${scenario.title}</span>
      <span class="scenario-tag">${scenario.tag}</span>
    `;
    btn.addEventListener("click", () => runScenario(scenario));
    scenarioList.appendChild(btn);
  });
}

// Add a message to the chat
function addMessage(role, text) {
  const msg = document.createElement("div");
  msg.className = `chat-message ${role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  msg.appendChild(bubble);
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Simulate one scenario: show user + GENIE reply
function runScenario(scenario) {
  addMessage("user", scenario.userPrompt);
  setTimeout(() => {
    addMessage("assistant", scenario.reply);
  }, 400); // small delay to feel like 'thinking'
}

// Handle manual input (only allow exact preset prompts)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = userInput.value.trim();
  if (!text) return;

  addMessage("user", text);

  const match = SCENARIOS.find((s) => s.userPrompt === text);
  if (match) {
    setTimeout(() => {
      addMessage("assistant", match.reply);
    }, 400);
  } else {
    setTimeout(() => {
      addMessage(
        "assistant",
        "This static UConn GENIE demo only supports the preset scenarios on the left. " +
          "For the real system we would route your question to the world model."
      );
    }, 300);
  }

  userInput.value = "";
});

// Initial render
renderScenarios();
