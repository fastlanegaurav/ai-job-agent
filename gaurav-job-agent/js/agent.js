/**
 * agent.js
 * Core AI Agent — Job Search, Skill Matching & Application Generation
 *
 * Uses Claude API (claude-sonnet-4-20250514) to:
 *  1. Simulate job search & return realistic postings
 *  2. Score each posting against the CV
 *  3. Generate tailored cover letters + form data
 */

// ─── Config ───────────────────────────────────────────────────────────────────

const AGENT_CONFIG = {
  model:      "claude-sonnet-4-20250514",
  max_tokens: 1000,
  apiUrl:     "https://api.anthropic.com/v1/messages"
};

// Sample job boards used in display metadata
const JOB_SOURCES = ["LinkedIn", "Naukri.com", "Indeed", "Glassdoor", "AngelList"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callClaude(userPrompt, systemPrompt = "") {
  const body = {
    model:      AGENT_CONFIG.model,
    max_tokens: AGENT_CONFIG.max_tokens,
    messages:   [{ role: "user", content: userPrompt }]
  };
  if (systemPrompt) body.system = systemPrompt;

  const res = await fetch(AGENT_CONFIG.apiUrl, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }

  const data = await res.json();
  return data.content.map(b => b.text || "").join("");
}

function safeParseJSON(raw) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  // Extract first JSON object or array
  const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}

function scoreMatch(jobSkills = [], jobTitle = "") {
  const text = (jobSkills.join(" ") + " " + jobTitle).toLowerCase();
  let hits = 0;
  CV.skillKeywords.forEach(sk => {
    if (text.includes(sk.toLowerCase())) hits++;
  });
  const pct = Math.round((hits / CV.skillKeywords.length) * 100);
  if (pct >= 55) return { level: "high",   label: `${pct}% match`, pct };
  if (pct >= 35) return { level: "medium", label: `${pct}% match`, pct };
  return           { level: "low",    label: `${pct}% match`, pct };
}

// ─── Job Search Agent ─────────────────────────────────────────────────────────

/**
 * searchJobsAI
 * Asks Claude to generate realistic job listings for the given query,
 * then scores each one against Gaurav's CV.
 */
async function searchJobsAI({ query, location, exp, jobType, source }) {
  const prompt = `You are a job board aggregator API. Generate 6 realistic job listings for the following search:

Search Query: "${query}"
Location: "${location}"
Experience: "${exp}"
Job Type: "${jobType}"
Source: "${source}"

Return ONLY a valid JSON array (no markdown, no extra text) with exactly 6 jobs. Each job object must have:
{
  "id": "unique string like job_001",
  "title": "Job title",
  "company": "Real or realistic company name in India or remote",
  "location": "City, India or Remote",
  "type": "Full-time / Contract / Remote",
  "salary": "salary range in LPA e.g. 12-18 LPA",
  "experience": "e.g. 3-5 years",
  "posted": "e.g. 2 days ago",
  "source": "LinkedIn / Naukri.com / Indeed / Glassdoor",
  "skills": ["skill1", "skill2", "skill3", "skill4"],
  "description": "2-sentence job description",
  "applyUrl": "https://example.com/jobs/123"
}

Make the jobs realistic for a DevOps / Cloud / API / Project Manager candidate with 3+ years experience in India. Vary the companies (mix of startups, MNCs, product companies).`;

  const raw  = await callClaude(prompt);
  const jobs = safeParseJSON(raw);

  // Score each job
  return jobs.map(job => ({
    ...job,
    match: scoreMatch(job.skills, job.title)
  }));
}

// ─── Application Generator ────────────────────────────────────────────────────

/**
 * generateApplicationPackage
 * Given a job, generates a full cover letter + form data + talking points.
 */
async function generateApplicationPackage({ company, jobtitle, location, jd, note }) {
  const cvText = `
Name: ${CV.name}
Title: ${CV.title}
Email: ${CV.email} | Phone: ${CV.phone} | LinkedIn: ${CV.linkedin}
Location: ${CV.location}
Experience: ${CV.experience} at ${CV.currentRole.company} (${CV.currentRole.duration})
Education: ${CV.education.degree}, ${CV.education.college} (${CV.education.year}), CGPA ${CV.education.cgpa}

Summary: ${CV.summary}

Key Achievements:
${CV.achievements.map(a => `• ${a}`).join("\n")}

Skills:
Cloud/DevOps: ${CV.skills.cloud}
API & Security: ${CV.skills.api}
CI/CD: ${CV.skills.cicd}
PM Tools: ${CV.skills.pm}
Methodologies: ${CV.skills.methodologies}
Languages: ${CV.skills.languages}
AI/Automation: ${CV.skills.ai}

Key Projects:
${CV.projects.map(p => `• ${p.name} (${p.tech}) — ${p.impact}`).join("\n")}

Certifications:
${CV.certifications.join(", ")}`;

  const prompt = `You are an expert career coach AI generating a job application for ${CV.name}.

CANDIDATE CV:
${cvText}

TARGET JOB:
Company: ${company}
Role: ${jobtitle}
Location: ${location}
Job Description: ${jd || "Not provided"}
Special Focus: ${note || "None"}

Generate a complete application package. Return ONLY valid JSON (no markdown, no extra text):
{
  "coverLetter": "Full 4-paragraph cover letter. Opening: express genuine interest in the specific company and role. Body 1: highlight most relevant technical achievements with numbers. Body 2: project management and team leadership angle. Closing: clear call to action. Do not use placeholder brackets. Sign off as Gaurav Kumar.",
  "formData": {
    "fullName": "${CV.name}",
    "email": "${CV.email}",
    "phone": "${CV.phone}",
    "linkedin": "${CV.linkedin}",
    "location": "${CV.location}",
    "currentTitle": "${CV.currentRole.title}",
    "currentCompany": "${CV.currentRole.company}",
    "yearsOfExperience": "3.5",
    "noticePeriod": "30-45 days",
    "education": "BCA, REVA University (2021)",
    "keySkills": "top 8 skills most relevant to this specific role, comma-separated",
    "whyThisCompany": "2-3 specific sentences about why Gaurav wants to join ${company} — be specific to the company",
    "salaryExpectation": "Open to discussion based on role scope and benefits",
    "availableFrom": "30-45 days after offer",
    "portfolioNote": "GitHub repo with live AI job agent: github.com/gaurav0090/ai-job-agent"
  },
  "matchAnalysis": "3-4 sentences: how well this role matches Gaurav's skills, which specific skills are a direct match, any gaps",
  "talkingPoints": "5 bullet points (each starting with •) — specific interview talking points for THIS role at THIS company, referencing real achievements from the CV"
}`;

  const raw    = await callClaude(prompt);
  const parsed = safeParseJSON(raw);
  return parsed;
}

// ─── Cover Letter Generator ───────────────────────────────────────────────────

async function generateCoverLetterAI({ company, role, tone, focus, jd }) {
  const toneMap = {
    professional: "formal, professional and structured",
    confident:    "confident, direct and impact-focused — lead with achievements",
    startup:      "casual, energetic, startup-friendly — conversational but professional",
    technical:    "highly technical, achievement-driven — include specific technical stack references"
  };

  const prompt = `Write a ${toneMap[tone] || "professional"} cover letter for ${CV.name} applying to ${role} at ${company}.

CANDIDATE HIGHLIGHTS:
• ${CV.experience} experience as ${CV.title}
• ${CV.achievements.slice(0, 5).join("\n• ")}
• Skills: AWS, Docker, Terraform, CI/CD, IBM ACE, Apigee, OAuth 2.0, JWT, Agile, SAFe
• Budget managed: $200K+, teams of 8-12, 10-15 concurrent projects
• Education: BCA, REVA University (2021)
• Employer: ${CV.currentRole.company} (${CV.currentRole.duration})

${focus ? `FOCUS ON: ${focus}` : ""}
${jd    ? `JOB DESCRIPTION: ${jd}` : ""}

Write exactly 4 paragraphs. Be specific with numbers and achievements. Do not use placeholder brackets like [Company] — use the actual names. Sign off formally as Gaurav Kumar with email and phone. Return ONLY the letter text, nothing else.`;

  return await callClaude(prompt);
}

// Export for module environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { searchJobsAI, generateApplicationPackage, generateCoverLetterAI, scoreMatch };
}
