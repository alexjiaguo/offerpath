# Feature-by-Feature Audit: OfferPath vs. Simplify.jobs
**Date:** 2026-05-21  
**Audited Target Account:** Brouard Madan1 (AI Product Manager @ Tripalink)  
**Session Scope:** Logged-in Dashboard, Profile Common App, Tracker Pipeline, Matches Onboarding  
**Source Path:** `/Volumes/Download/ai-projects/side-hustles/job-hunt-os/products/offerpath/docs/simplify-audit-report.md`

---

## 1. Onboarding & Dashboard Gamification

Simplify uses a gamified onboarding experience to drive initial engagement and reduce user bounce rates. 

```
┌──────────────────────────────────────────────────────────┐
│  Simplify Dashboard Onboarding (0/6 Complete)            │
│  [ ] Complete Profile (Contact, resume, etc.)      +50%  │
│  [ ] Download Chrome Extension (Autofill loop)    +10%  │
│  [ ] View First Match (Personalized recommendations)     │
│  [ ] Apply for First Job (One-click flow)                │
│  [ ] Explore Job Lists (Curated groups)                  │
│  [ ] Update Application Status (Keep sync active)        │
└──────────────────────────────────────────────────────────┘
```

### The Simplify Experience
*   **Onboarding Checklist:** Displays a dynamic progress widget (`0/6 steps completed`) showing the user exactly what to do to reach full value.
*   **Profile Strength Level:** Displays gamified tier badges (e.g., `"Career Newbie" (50% complete)`) to encourage profile completion.
*   **Value Callouts:** Uses clear psychological triggers (e.g., `"You saved 0 hours so far! By autofilling your job applications with our extension"`).

### Mapped to OfferPath
*   **Current State:** OfferPath (`src/app/dashboard/page.tsx`) immediately lands the user on a blank dashboard displaying overview charts. It lacks guidance on what steps are needed to successfully construct a profile, import a resume, or connect the Supabase backend.
*   **Actionable Upgrade:** Build an **Onboarding Checklist widget** in `src/components/dashboard/` that tracks:
    1. Upload/parse first resume (stored in `resumeStore`).
    2. Add profile skills and links (stored in `profileStore`).
    3. Install browser extension mockup.
    4. Move first job to Applied.

---

## 2. Profile Structure ("Common App" vs. Zustand Gaps)

By auditing Brouard's active Simplify profile, we analyzed how they structure data for rapid form autofill.

### Simplify Profile Structure (Audited Data Schema)
Simplify splits the profile into standard, reusable sections designed to map directly to Applicant Tracking System (Greenhouse, Lever, Workday) fields:
1.  **Personal & Contact Info:** Name, email, phone number, location.
2.  **Work Experience:** Chronological records including rich descriptions (e.g., Brouard's highly quantitative *Tripalink AI onboarding* and *SaaS redlines* metrics).
3.  **Education:** Degrees, majors, universities (e.g., Brouard's *Xi'an Jiaotong Master's in EE*).
4.  **Portfolio Links:** Standardized social icons (LinkedIn, GitHub, Personal Website).
5.  **Skills Inventory:** A flat array of keywords (e.g., *LLM, RAG, Agile, Python, SQL*).
6.  **Disclosures & Employment Info (The Core Gap):** Answers to standard diversity, visa sponsorship, veteran status, and disability questions.

### Mapped to OfferPath
*   **Current State:** OfferPath's `profileStore.ts` does not contain structured models for education history, detailed work history records, or employment/diversity disclosures. That data is instead isolated inside un-structured resume JSONs.
*   **Actionable Upgrade:** We should refactor OfferPath's `profileStore.ts` to include a structured `CommonAppProfile` type matching Simplify's:
    ```typescript
    export interface WorkExperience {
      company: string;
      role: string;
      location: string;
      startDate: string;
      endDate: string;
      isCurrent: boolean;
      description: string;
    }

    export interface Education {
      school: string;
      degree: string;
      major: string;
      graduationDate: string;
    }

    export interface EmploymentDisclosures {
      requiresSponsorship: boolean;
      locationPreference: 'remote' | 'hybrid' | 'onsite';
      gender: string;
      race: string;
      disabilityStatus: string;
      veteranStatus: string;
    }
    ```

---

## 3. Kanban Pipeline & Tracker Alignment

Simplify's job tracker relies on a simplified Kanban board that syncs automatically when a user clicks submit in their extension.

### Simplify Tracker Layout
*   **Five Status Columns:** `SAVED` (Wishlist), `APPLIED`, `INTERVIEWING`, `OFFER`, `REJECTED`.
*   **Action Utilities:** Offers bulk operations—specifically **CSV Export**, **CSV Import**, and layout toggling (List view vs. Board view).
*   **Application Goal Setting:** Prompts users to set weekly target goals (e.g., "5 applications per week") to maintain momentum.

### Mapped to OfferPath
*   **Current State:** OfferPath's `/dashboard/pipeline` has the identical 5 columns (`wishlist`, `applied`, `interview`, `offer`, `rejected`), which is great. However, it is fully manual and lacks bulk CSV integration or goal setting.
*   **Actionable Upgrade:**
    1.  Add standard **CSV Import & Export helper functions** in `src/lib/` and plug them into the Pipeline header.
    2.  Introduce a **Weekly Goal widget** inside the Kanban sidebar, storing `weeklyGoalCount` in Zustand `pipelineStore.ts` and tracking current-week submissions against that target.

---

## 4. Job Matches & Prefs Onboarding ("Michael, Founder" chat)

Audited Simplify's onboarding quiz view (`/preferences`) that curates matching recommendations.

### The Simplify Experience
*   **Value Quiz:** An elegant, gamified preference selection page where users select values (e.g., *Mentorship, Work-Life Balance, Innovative Tech*).
*   **Conversational Guidance:** Sits a floating avatar card showing "Michael, Founder" with a speech bubble saying: `"We've pre-filled a few of your answers from earlier to save you time!"`
*   **Why it works:** Humanizes the tool immediately, building user empathy and lowering friction through pre-filled form fields.

### Mapped to OfferPath
*   **Current State:** OfferPath's Discover feed `/dashboard/discover` lists random static mock jobs. It lacks a preference selection flow or personalized matches based on user skills (such as Brouard's specific portfolio tags: *LLM, RAG, Python, SQL*).
*   **Actionable Upgrade:**
    1.  Design a **Job Preference Selector panel** in `src/components/dashboard/discover/` where the user defines target locations and technical preferences.
    2.  Write a basic **Matching Engine function** in `src/lib/matchingEngine.ts` that cross-references discovery listings with the active candidate's skills array and calculates a custom fit score (e.g. matching Brouard with high-percentage LLM/RAG roles).

---

## 5. Summary of Recommended Code Improvements for OfferPath

To bridge each audited gap, we should prioritize the following engineering roadmap for OfferPath:

### Step 1: Upgrading profileStore Schema
*   Update `src/store/profileStore.ts` to support rich experience, education, and disclosure fields to match Simplify's "Common App" coverage.

### Step 2: Creating `/dashboard` Onboarding Checklist Component
*   Add a highly polished progress checklist card at the top of the dashboard main page to step-guide users through profile completion.

### Step 3: Implement Pipeline CSV Utility
*   Create a client-side parser utility that allows users to export their current job cards to standard Excel/CSV sheets, or import pre-existing trackers.

### Step 4: Rule-based Fit Match Score
*   Replace standard discovery listings with dynamically matched cards showing a calculated Match score based on user skills.
