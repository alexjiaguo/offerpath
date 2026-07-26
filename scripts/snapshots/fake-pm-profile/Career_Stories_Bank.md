# Career Stories Bank — Priya Anand (2026)

## Story 1: From 5 days to 4 hours — generative creative at Aperture
- **Situation:** Brand teams wait 5+ days for an agency to turn a brief into 30 ad variants. Conversion on brand-safe variants was 38% below human-made.
- **Task:** Cut turnaround to under 1 business day without sacrificing brand-safety or creative diversity.
- **Action:** Owned the cross-functional pod (eng, design, policy, trust & safety). Drove the technical bet on a 3-stage pipeline: brief-parser → brand-safety filter → variant generator with human-in-the-loop review. Negotiated the safety-vs-speed trade-off with trust & safety.
- **Result:** Turnaround 5 days → 4 hours. Brand-safe variant acceptance +38%. 9 regulatory frameworks shipped ahead of deadline.

## Story 2: Programmatic identity in a post-cookie world
- **Situation:** Google's cookie deprecation was projected to cut audience reach by 7% in 6 weeks. 4 product teams owned overlapping pieces.
- **Task:** Recover reach loss without fragmenting the user experience or violating GDPR/CCPA.
- **Action:** Drove the cross-team roadmap: a server-side identity resolution layer, a clean-room audience activation API, and a publisher opt-in flow. Stood up weekly cross-team syncs and a shared RFC process.
- **Result:** Recovered ~7% of reach loss before deprecation. Zero privacy incidents during rollout.

## Story 3: Subscription funnel rebuild at Meridian
- **Situation:** Trial-to-paid was stuck at 5.1% across 3 top apps. Competitors were at 6.5% with similar LTV.
- **Task:** Lift trial-to-paid by 1.4 points (matching competitor benchmark) within one quarter.
- **Action:** Ran 32 user interviews and 5 usability studies. Mapped 6 friction points in the trial flow. Ran 14 A/B tests across 6 markets. Built the experimentation pipeline (assignment, guardrails, post-hoc analysis) reused by the growth pod.
- **Result:** Trial-to-paid 5.1% → 6.5%. MRR +$1.4M. D1 drop-off -19%. D7 retention +0.8 points.

## Story 4: Real-time lookalike modeling
- **Situation:** Marketers wanted lookalike audiences in minutes, not days. Existing batch pipeline took 14 hours.
- **Task:** Build a real-time lookalike service without rebuilding the feature store from scratch.
- **Action:** Partnered with the ML team to ship a streaming variant of the feature store. Set up shadow-mode rollout against the batch baseline. Owned the deprecation plan for the legacy batch job.
- **Result:** 11% AUC improvement over baseline. 3 downstream teams unblocked. Batch job retired 4 months after launch.

## Story 5: Building a creator marketplace from zero
- **Situation:** Aperture's customers kept asking for vetted creator partners. No internal team could fulfill that need at scale.
- **Task:** Stand up a two-sided marketplace (creators + advertisers) with vetting, payouts, and dispute resolution in 6 months.
- **Action:** Defined the creator onboarding flow, vetting rubric, and payout logic. Negotiated with finance on tax and payout compliance. Drove the launch with a 50-creator private beta and a public waitlist.
- **Result:** 1,400 vetted creators in 6 months. 11% of incremental ARR.

## Story 6: Customer advisory board at Beacon
- **Situation:** Beacon kept shipping features customers did not use. Build-and-remove rate was 35% higher than industry benchmark.
- **Task:** Reduce wasted engineering effort by getting structured customer input before roadmap commitment.
- **Action:** Stood up a 14-customer advisory board with a quarterly cadence. Wrote the briefing template and the structured synthesis process. Led every quarterly session personally.
- **Result:** Feature churn -35%. 3 of the top 5 roadmap items came directly from advisory board feedback.

## Story 7: Pricing experiments across 6 markets
- **Situation:** Meridian's pricing was set once at launch and never revisited. Competitors were A/B testing pricing weekly.
- **Task:** Build the experimentation muscle so pricing decisions could be made on data, not intuition.
- **Action:** Designed the assignment and analysis pipeline. Negotiated with legal on market-by-market disclosure. Ran 14 experiments over 9 months.
- **Result:** $1.4M incremental ARR. The pipeline was reused by 3 other pods and became the de-facto growth analytics tooling.

## Story 8: Cross-functional leadership under regulatory pressure
- **Situation:** EU DSA landed mid-roadmap. Aperture's ad policy was US-centric. Trust & safety was 4 FTEs.
- **Task:** Get to DSA-compliant in 4 months without a hiring spree.
- **Action:** Prioritized the 9 highest-risk policy gaps. Drove the cross-functional response. Personally owned the policy engine spec and the regulator-facing documentation.
- **Result:** 9 frameworks shipped ahead of deadline. Ad-review escalations -62%.

## Story 9: Brand-safety eval harness at Aperture
- **Situation:** Policy-engine regression incidents were increasing as we added new LLM providers. Each incident cost 2-3 days of firefighting.
- **Task:** Build an evaluation harness that catches regressions before they ship.
- **Action:** Owned the spec. Compared 4 LLM providers (Anthropic, OpenAI, Google, Mistral) against 1,200 red-team prompts spanning policy categories. Stood up the harness as a CI gate.
- **Result:** Policy regression incidents dropped 47% within one quarter. 9 LLM-rolled-out versions audited before production.

## Story 10: Retention Loops framework at Meridian
- **Situation:** D30 retention was flat across the 3 top apps. Each app team had built its own retention surface.
- **Task:** Build a reusable framework that any pod could adopt without re-designing from scratch.
- **Action:** Synthesized 32 user interviews and 5 usability studies into a 3-loop framework: habit (recurring trigger), social (peer signal), reward (variable reinforcement). Wrote the playbook. Coached 3 pods to adopt it.
- **Result:** Lifted D30 retention by 1.4 points and unblocked $400K in incremental ARR across the 6 apps that adopted the framework.
