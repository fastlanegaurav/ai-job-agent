/**
 * app.js
 * UI controller — tabs, rendering, user events, application log
 */

// ─── State ────────────────────────────────────────────────────────────────────

const STATE = {
  applications:    [],
  currentJobs:     [],
  currentJobFilter: "all"
};

const SAMPLES = {
  devops: {
    company: "Razorpay",
    jobtitle: "Senior DevOps Engineer",
    location: "Bengaluru (Hybrid)",
    jd: "We are looking for a Senior DevOps Engineer to design, implement, and maintain CI/CD pipelines and manage AWS infrastructure using Terraform. The candidate should have strong experience with Docker, GitHub Actions, and AWS services including Lambda, EC2, RDS, S3, SQS, DynamoDB. Experience in DevSecOps, IAM least-privilege, and CloudWatch observability required. 4+ years of experience. Salary: 18-28 LPA."
  },
  tpm: {
    company: "Atlassian",
    jobtitle: "Technical Project Manager",
    location: "Remote / India",
    jd: "Atlassian is hiring a Technical Project Manager to lead cross-functional delivery of 10+ concurrent projects. You will own project lifecycle end-to-end including SOW, WBS, sprint planning, stakeholder reporting, and risk management. Deep experience with Agile, SAFe, and Jira required. Experience managing teams of 8+ and budgets over $100K. 3-5 years experience."
  },
  cloud: {
    company: "Airbus India",
    jobtitle: "Cloud Solutions Architect",
    location: "Bengaluru",
    jd: "Seeking a Cloud Solutions Architect with hands-on AWS experience in serverless architectures, event-driven design (SQS, SNS, Lambda, DynamoDB), and Terraform IaC. The role involves driving cloud cost optimisation and DevSecOps practices across enterprise workloads. Experience with IoT integrations and high-uptime production systems is a strong advantage."
  },
  api: {
    company: "Salesforce / MuleSoft",
    jobtitle: "API Integration Engineer",
    location: "Bengaluru / Remote",
    jd: "Looking for an API Integration Engineer with deep expertise in REST/SOAP API design, OAuth 2.0, JWT, HMAC security, and enterprise middleware. IBM ACE or Apigee Edge experience is highly desirable. You will design and implement secure API integrations for enterprise clients across the US and Europe. 3+ years experience required. 15-22 LPA."
  }
};

// ─── Tab switching ─────────────────────────────────────────────────────────────

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    const name = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${name}`).classList.add("active");
  });
});

// ─── Job Search ───────────────────────────────────────────────────────────────

const SEARCH_STEPS = [
  "Connecting to job boards...",
  "Fetching listings for your query...",
  "Analyzing job descriptions...",
  "Scoring matches against your CV...",
  "Ranking results by fit...",
  "Done! Rendering results..."
];

async function searchJobs() {
  const query    = document.getElementById("searchQuery").value.trim() || "DevOps Engineer";
  const location = document.getElementById("searchLocation").value.trim() || "Bengaluru";
  const exp      = document.getElementById("searchExp").value;
  const jobType  = document.getElementById("jobType").value;
  const source   = document.getElementById("jobSource").value;

  document.getElementById("searchBtn").disabled = true;
  document.getElementById("searchLoading").style.display = "block";
  document.getElementById("searchResults").style.display = "none";

  const log = document.getElementById("progressLog");
  log.innerHTML = "";

  // Animate steps
  let stepIndex = 0;
  const stepInterval = setInterval(() => {
    if (stepIndex > 0) {
      const prev = log.querySelector(`.progress-line:nth-child(${stepIndex})`);
      if (prev) { prev.classList.remove("active"); prev.classList.add("done"); }
    }
    if (stepIndex < SEARCH_STEPS.length) {
      const line = document.createElement("div");
      line.className = "progress-line active";
      line.textContent = `→ ${SEARCH_STEPS[stepIndex]}`;
      log.appendChild(line);
      document.getElementById("searchLoadingMsg").textContent = SEARCH_STEPS[stepIndex];
      stepIndex++;
    }
  }, 600);

  try {
    const jobs = await searchJobsAI({ query, location, exp, jobType, source });
    STATE.currentJobs = jobs;

    clearInterval(stepInterval);
    // Mark all done
    log.querySelectorAll(".progress-line").forEach(l => { l.classList.remove("active"); l.classList.add("done"); });

    renderJobCards(jobs);
    document.getElementById("searchLoading").style.display = "none";
    document.getElementById("searchResults").style.display = "block";
    document.getElementById("resultsCount").textContent = `${jobs.length} jobs found for "${query}"`;

  } catch (err) {
    clearInterval(stepInterval);
    document.getElementById("searchLoadingMsg").textContent = `Error: ${err.message}. Check your API key in config.`;
    console.error("Search error:", err);
  }

  document.getElementById("searchBtn").disabled = false;
}

function renderJobCards(jobs) {
  const filter  = STATE.currentJobFilter;
  const visible = filter === "all" ? jobs : jobs.filter(j => j.match.level === filter);
  const area    = document.getElementById("jobCards");

  if (visible.length === 0) {
    area.innerHTML = `<p class="empty-state">No ${filter} match jobs found. Try a different filter.</p>`;
    return;
  }

  area.innerHTML = visible.map(job => `
    <div class="job-card" id="jc-${job.id}">
      <div class="job-card-header">
        <div>
          <div class="job-card-title">${job.title}</div>
          <div class="job-card-company">${job.company} · ${job.source || "LinkedIn"}</div>
        </div>
        <span class="match-badge match-${job.match.level}">${job.match.label}</span>
      </div>
      <div class="job-card-meta">
        <span class="job-meta-item">📍 ${job.location}</span>
        <span class="job-meta-item">💼 ${job.type || "Full-time"}</span>
        <span class="job-meta-item">💰 ${job.salary || "Competitive"}</span>
        <span class="job-meta-item">⏱ ${job.experience || "3-5 yrs"}</span>
        <span class="job-meta-item">🕐 ${job.posted || "1 day ago"}</span>
      </div>
      <div class="job-card-skills">
        ${(job.skills || []).map(s => `<span class="job-skills-tag">${s}</span>`).join("")}
      </div>
      <p style="font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:12px">${job.description || ""}</p>
      <div class="job-card-actions">
        <button class="btn btn-primary btn-sm" onclick="applyFromSearch('${job.id}')">
          ⚡ Auto-Apply
        </button>
        <button class="btn btn-outline btn-sm" onclick="previewJob('${job.id}')">
          Preview Application
        </button>
        ${job.applyUrl ? `<a href="${job.applyUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="text-decoration:none">View Original ↗</a>` : ""}
      </div>
    </div>
  `).join("");
}

function filterResults(level) {
  STATE.currentJobFilter = level;
  document.querySelectorAll(".quick-btn").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  renderJobCards(STATE.currentJobs);
}

function clearSearch() {
  document.getElementById("searchResults").style.display = "none";
  document.getElementById("searchLoading").style.display = "none";
}

async function applyFromSearch(jobId) {
  const job = STATE.currentJobs.find(j => j.id === jobId);
  if (!job) return;

  // Switch to Apply tab with the job prefilled
  document.getElementById("company").value  = job.company;
  document.getElementById("jobtitle").value = job.title;
  document.getElementById("location").value = job.location;
  document.getElementById("jd").value       = job.description || "";

  // Switch tab
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelector('[data-tab="apply"]').classList.add("active");
  document.getElementById("tab-apply").classList.add("active");

  // Auto-trigger generation
  generateApplication();
}

async function previewJob(jobId) {
  const job = STATE.currentJobs.find(j => j.id === jobId);
  if (!job) return;
  document.getElementById("company").value  = job.company;
  document.getElementById("jobtitle").value = job.title;
  document.getElementById("location").value = job.location;
  document.getElementById("jd").value       = job.description || "";

  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.querySelector('[data-tab="apply"]').classList.add("active");
  document.getElementById("tab-apply").classList.add("active");
}

// ─── Manual Apply ─────────────────────────────────────────────────────────────

function fillSample(type) {
  const s = SAMPLES[type];
  document.getElementById("company").value  = s.company;
  document.getElementById("jobtitle").value = s.jobtitle;
  document.getElementById("location").value = s.location;
  document.getElementById("jd").value       = s.jd;
}

function clearApplyForm() {
  ["company", "jobtitle", "location", "jd", "note"].forEach(id => {
    document.getElementById(id).value = "";
  });
  document.getElementById("outputPanel").style.display = "none";
}

const APPLY_STEPS = [
  "Analyzing job description...",
  "Matching your CV to requirements...",
  "Crafting tailored cover letter...",
  "Generating form data...",
  "Finalizing application package..."
];

async function generateApplication() {
  const company  = document.getElementById("company").value.trim();
  const jobtitle = document.getElementById("jobtitle").value.trim();
  const location = document.getElementById("location").value.trim();
  const jd       = document.getElementById("jd").value.trim();
  const note     = document.getElementById("note").value.trim();

  if (!company || !jobtitle) {
    alert("Please enter at least company name and job title.");
    return;
  }

  document.getElementById("outputPanel").style.display = "block";
  document.getElementById("applyLoading").style.display = "block";
  document.getElementById("resultArea").style.display  = "none";
  document.getElementById("applyBtn").disabled = true;

  let mi = 0;
  const interval = setInterval(() => {
    mi = (mi + 1) % APPLY_STEPS.length;
    document.getElementById("applyLoadingMsg").textContent = APPLY_STEPS[mi];
  }, 900);

  try {
    const pkg = await generateApplicationPackage({ company, jobtitle, location, jd, note });

    clearInterval(interval);

    // Render cover letter
    document.getElementById("clOutput").textContent = pkg.coverLetter || "";

    // Render form data
    const fd = pkg.formData || {};
    const fields = [
      ["Full Name",          fd.fullName],
      ["Email",              fd.email],
      ["Phone",              fd.phone],
      ["LinkedIn",           fd.linkedin],
      ["Location",           fd.location],
      ["Current Title",      fd.currentTitle],
      ["Current Company",    fd.currentCompany],
      ["Years of Experience",fd.yearsOfExperience],
      ["Notice Period",      fd.noticePeriod],
      ["Education",          fd.education],
      ["Key Skills",         fd.keySkills],
      ["Why This Company",   fd.whyThisCompany],
      ["Salary Expectation", fd.salaryExpectation],
      ["Portfolio / GitHub", fd.portfolioNote]
    ];
    document.getElementById("formFillArea").innerHTML = fields.map(([label, val]) => `
      <div class="form-fill-field">
        <div class="ff-label">${label}</div>
        <div class="ff-value">${val || "—"}</div>
      </div>
    `).join("");

    // Render talking points
    const analysis = [
      pkg.matchAnalysis || "",
      "",
      pkg.talkingPoints || ""
    ].join("\n").trim();
    document.getElementById("talkingPoints").textContent = analysis;

    document.getElementById("applyLoading").style.display = "none";
    document.getElementById("resultArea").style.display  = "block";

    // Add to log as draft
    addToLog({ company, jobtitle, status: "draft", source: "manual" });

  } catch (err) {
    clearInterval(interval);
    document.getElementById("applyLoadingMsg").textContent =
      `Error: ${err.message}. Make sure your API key is valid.`;
    console.error("Application generation error:", err);
  }

  document.getElementById("applyBtn").disabled = false;
}

function logApplication() {
  if (STATE.applications.length > 0) {
    STATE.applications[STATE.applications.length - 1].status = "sent";
    renderLog();
    showToast("Marked as sent!");
  }
}

// ─── Cover Letter ─────────────────────────────────────────────────────────────

async function generateCoverLetter() {
  const company = document.getElementById("cl-company").value.trim();
  const role    = document.getElementById("cl-role").value.trim();
  const tone    = document.getElementById("cl-tone").value;
  const focus   = document.getElementById("cl-focus").value.trim();
  const jd      = document.getElementById("cl-jd").value.trim();

  if (!company || !role) { alert("Enter company and role."); return; }

  document.getElementById("cl-loading").style.display = "block";
  document.getElementById("cl-result").style.display  = "none";
  document.getElementById("clBtn").disabled = true;

  try {
    const letter = await generateCoverLetterAI({ company, role, tone, focus, jd });
    document.getElementById("cl-output-text").textContent = letter;
    document.getElementById("cl-result").style.display = "block";
    addToLog({ company, jobtitle: role, status: "draft", source: "cover-letter" });
  } catch (err) {
    alert(`Error: ${err.message}`);
  }

  document.getElementById("cl-loading").style.display = "none";
  document.getElementById("clBtn").disabled = false;
}

// ─── Application Log ──────────────────────────────────────────────────────────

function addToLog({ company, jobtitle, status, source }) {
  STATE.applications.push({ company, jobtitle, status, source, time: new Date() });
  renderLog();
}

function renderLog() {
  const apps    = STATE.applications;
  const total   = apps.length;
  const sent    = apps.filter(a => a.status === "sent").length;
  const draft   = apps.filter(a => a.status === "draft").length;
  const today   = apps.filter(a => isToday(a.time)).length;

  document.getElementById("totalApps").textContent = total;
  document.getElementById("sentApps").textContent  = sent;
  document.getElementById("draftApps").textContent = draft;
  document.getElementById("todayApps").textContent = today;

  if (total === 0) {
    document.getElementById("logList").innerHTML =
      `<p class="empty-state">No applications yet. Use Job Search or Apply tab to get started.</p>`;
    return;
  }

  document.getElementById("logList").innerHTML = [...apps].reverse().map((a, i) => `
    <div class="log-entry">
      <span class="log-time">${formatTime(a.time)}</span>
      <span class="log-status ${a.status}">[${a.status.toUpperCase()}]</span>
      <span class="log-company">${a.company} — ${a.jobtitle}</span>
      <span class="log-source">${a.source || ""}</span>
      ${a.status === "draft"
        ? `<button class="copy-btn" onclick="markSent(${apps.length - 1 - i})">mark sent</button>`
        : ""}
    </div>
  `).join("");
}

function markSent(idx) {
  STATE.applications[idx].status = "sent";
  renderLog();
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function copyEl(id) {
  const el  = document.getElementById(id);
  const btn = event.target;
  navigator.clipboard.writeText(el.textContent).then(() => {
    const orig = btn.textContent;
    btn.textContent = "copied!";
    setTimeout(() => (btn.textContent = orig), 1500);
  });
}

function isToday(date) {
  const d = new Date(date), n = new Date();
  return d.toDateString() === n.toDateString();
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function showToast(msg) {
  const t = document.createElement("div");
  t.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:var(--surface); border:1px solid var(--green); color:var(--green);
    padding:10px 18px; border-radius:8px; font-size:13px; font-family:var(--mono);
    animation: fadeIn 0.3s ease;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}
