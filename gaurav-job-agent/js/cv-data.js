/**
 * cv-data.js
 * Gaurav Kumar's complete CV data used by the AI agent
 * to personalize job applications and cover letters.
 */

const CV = {
  name:       "Gaurav Kumar",
  title:      "DevOps Engineer & Technical Project Manager",
  email:      "gaurav04099@gmail.com",
  phone:      "+91-7986284661",
  linkedin:   "linkedin.com/in/gaurav0090",
  location:   "Bengaluru, India",
  experience: "3+ years",

  currentRole: {
    title:    "DevOps Engineer & Technical Project Manager",
    company:  "Purusartha Works Pvt. Ltd.",
    duration: "Mar 2022 – Present",
    location: "Bengaluru, India",
    clients:  "US & Europe (Fortune 500 and global brands)"
  },

  education: {
    degree:  "Bachelor of Computer Applications (BCA)",
    college: "REVA University, Bengaluru",
    year:    2021,
    cgpa:    "7.17"
  },

  summary: `DevOps Engineer and Technical Project Manager with 3+ years owning end-to-end delivery of 10–15 concurrent projects for Fortune 500 and global brands across the US and Europe. Hands-on with AWS (Lambda, EC2, RDS, S3, SQS, SNS, DynamoDB, IAM, CloudWatch), Docker, Terraform IaC, and CI/CD automation — combined with deep project lifecycle ownership: WBS, RAID logs, sprint cadence, UAT, and C-suite reporting. Leads cross-functional teams of 8–12 across Agile, SAFe, and Kanban frameworks. Owns API strategy across IBM ACE and Apigee Edge with OAuth 2.0, JWT, and HMAC security.`,

  achievements: [
    "20% faster CI/CD release cycles with zero-downtime daily deployments",
    "80% manual operations eliminated through API-driven automation and GenAI tooling",
    "60% infrastructure cost reduction via serverless AWS architecture versus EC2 equivalent",
    "99.9% API uptime maintained across all production environments",
    "100% SLA compliance across all retainer accounts with zero unmanaged scope creep",
    "90% error reduction via DLQ + IAM + CloudWatch pipeline architecture",
    "$200K+ project budget managed with full cost accountability across 6+ international accounts",
    "Zero critical security incidents over 3+ years of DevSecOps implementation",
    "30% reduction in new-project onboarding time through standardised SOPs and templates"
  ],

  skills: {
    cloud:         "AWS (EC2, RDS, S3, Lambda, SQS, SNS, DynamoDB, CloudWatch, IAM, ALB, ASG), GCP, Azure DevOps, Docker, Terraform IaC",
    api:           "REST, SOAP, JSON, XML, XSLT, OAuth 2.0, JWT, HMAC, IBM ACE, Apigee Edge",
    cicd:          "GitHub Actions, Jenkins (pipeline scripting), Terraform, Docker Compose, CloudWatch Alarms, DLQ, SQS",
    pm:            "Jira, Trello, ClickUp, Asana, Digital.ai, MS Project, Google Workspace",
    methodologies: "Agile, Scrum, Kanban, SAFe, Waterfall, Hybrid",
    languages:     "Python, Java, JavaScript, C++",
    databases:     "MySQL, PostgreSQL, Oracle, DynamoDB",
    ai:            "Generative AI, LLM Workflows, Prompt Engineering, AI-Driven Ops Automation"
  },

  // Skills as arrays for matching
  skillKeywords: [
    "AWS", "Lambda", "EC2", "RDS", "S3", "SQS", "SNS", "DynamoDB", "CloudWatch", "IAM",
    "Docker", "Terraform", "GitHub Actions", "Jenkins", "CI/CD", "DevOps", "DevSecOps",
    "REST", "SOAP", "OAuth", "JWT", "HMAC", "IBM ACE", "Apigee",
    "Python", "Java", "JavaScript", "PostgreSQL", "MySQL",
    "Agile", "Scrum", "SAFe", "Kanban", "Jira", "Project Management",
    "GCP", "Azure", "Serverless", "Infrastructure as Code", "IaC",
    "Generative AI", "LLM", "Automation", "API Integration"
  ],

  projects: [
    {
      name: "Automated API-Driven Web App Deployment on AWS",
      tech: "Python, Flask, Docker, Terraform, PostgreSQL, OAuth 2.0, GitHub Actions CI/CD",
      impact: "Reduced deployment effort by 40%, enabled same-day hotfixes"
    },
    {
      name: "Serverless Event-Driven Data Pipeline on AWS",
      tech: "Lambda, S3, SQS, SNS, DynamoDB, CloudWatch, IAM",
      impact: "90% error reduction, 99.9% uptime, 60% cost savings vs EC2 equivalent"
    },
    {
      name: "IoT Smart Water Monitoring System",
      tech: "Python, AWS IoT Core, MQTT, DynamoDB, CloudWatch",
      impact: "Zero unauthorized device incidents in production, real-time anomaly alerting"
    }
  ],

  certifications: [
    "Agile Project Management — Google/Coursera (In Progress)",
    "Intro to Generative AI — Google (Apr 2026)",
    "PagerDuty Event Intelligence Specialty (2022)",
    "GCP Big Data & ML Fundamentals — Google (2021)",
    "Full-Stack Web Dev (React, Node.js) — Udemy (2022)",
    "Google Analytics Certification — Google (2022)"
  ],

  languages: [
    { lang: "English", level: "Professional Working" },
    { lang: "Hindi",   level: "Native" }
  ]
};

// Export for module environments (Node.js / bundlers)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CV;
}
