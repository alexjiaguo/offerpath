/* ═══════════════════════════════════════════════════
   OfferPath — Discovery Mock Data
   30 real companies, 50+ job listings
   ═══════════════════════════════════════════════════ */

import type { DiscoveredCompany, DiscoveredJob, SearchProfile, ScanRun } from "./discoveryStore";

// ── Company definitions ─────────────────────────────

export const MOCK_COMPANIES: DiscoveredCompany[] = [
  { id: "dc1", name: "Google", industry: "Technology", hq: "Mountain View, CA", career_url: "https://careers.google.com", logo_emoji: "🔍", employee_count: "180K+", match_score: 92, tier: 1, notes: "Leader in search, cloud, and AI. Strong PM culture.", tags: ["FAANG", "AI/ML", "Cloud"] },
  { id: "dc2", name: "Apple", industry: "Consumer Electronics", hq: "Cupertino, CA", career_url: "https://jobs.apple.com", logo_emoji: "🍎", employee_count: "164K+", match_score: 85, tier: 1, notes: "Hardware/software integration. Product-led culture.", tags: ["FAANG", "Hardware", "Consumer"] },
  { id: "dc3", name: "Meta", industry: "Social Media", hq: "Menlo Park, CA", career_url: "https://www.metacareers.com", logo_emoji: "📘", employee_count: "67K+", match_score: 88, tier: 1, notes: "Focus on social, VR/AR, and AI. Move fast culture.", tags: ["FAANG", "Social", "AI/ML"] },
  { id: "dc4", name: "Amazon", industry: "E-Commerce / Cloud", hq: "Seattle, WA", career_url: "https://www.amazon.jobs", logo_emoji: "📦", employee_count: "1.5M+", match_score: 87, tier: 1, notes: "E-commerce and AWS. LP-driven culture.", tags: ["FAANG", "Cloud", "E-Commerce"] },
  { id: "dc5", name: "Microsoft", industry: "Technology", hq: "Redmond, WA", career_url: "https://careers.microsoft.com", logo_emoji: "🪟", employee_count: "221K+", match_score: 90, tier: 1, notes: "Azure, Teams, Copilot. Growth mindset culture.", tags: ["Big Tech", "Cloud", "AI/ML"] },
  { id: "dc6", name: "Stripe", industry: "FinTech", hq: "San Francisco, CA", career_url: "https://stripe.com/jobs", logo_emoji: "💳", employee_count: "8K+", match_score: 91, tier: 1, notes: "Payments infrastructure. Engineering-driven.", tags: ["FinTech", "Infrastructure", "Growth"] },
  { id: "dc7", name: "Grab", industry: "Super-App", hq: "Singapore", career_url: "https://grab.careers", logo_emoji: "🟢", employee_count: "11K+", match_score: 94, tier: 1, notes: "Southeast Asia super-app. Mobility, food, fintech.", tags: ["Super-App", "SEA", "FinTech"] },
  { id: "dc8", name: "ByteDance", industry: "Technology", hq: "Beijing / Singapore", career_url: "https://jobs.bytedance.com", logo_emoji: "🎵", employee_count: "110K+", match_score: 89, tier: 1, notes: "TikTok parent. AIGC and global expansion focus.", tags: ["Big Tech", "AI/ML", "Content"] },
  { id: "dc9", name: "Shopify", industry: "E-Commerce Platform", hq: "Ottawa, Canada", career_url: "https://www.shopify.com/careers", logo_emoji: "🛍️", employee_count: "11K+", match_score: 80, tier: 2, notes: "Enabling commerce globally. Product-led.", tags: ["E-Commerce", "SaaS", "Growth"] },
  { id: "dc10", name: "Datadog", industry: "Observability", hq: "New York, NY", career_url: "https://careers.datadoghq.com", logo_emoji: "🐶", employee_count: "6K+", match_score: 72, tier: 2, notes: "Cloud monitoring and security platform.", tags: ["SaaS", "DevOps", "Cloud"] },
  { id: "dc11", name: "Airbnb", industry: "Travel / Marketplace", hq: "San Francisco, CA", career_url: "https://careers.airbnb.com", logo_emoji: "🏡", employee_count: "6K+", match_score: 86, tier: 1, notes: "Travel marketplace. Design-driven culture.", tags: ["Marketplace", "Travel", "Consumer"] },
  { id: "dc12", name: "Spotify", industry: "Music / Audio", hq: "Stockholm, Sweden", career_url: "https://www.lifeatspotify.com", logo_emoji: "🎧", employee_count: "9K+", match_score: 82, tier: 2, notes: "Audio streaming leader. Squad model.", tags: ["Consumer", "Audio", "Growth"] },
  { id: "dc13", name: "Uber", industry: "Mobility", hq: "San Francisco, CA", career_url: "https://www.uber.com/careers", logo_emoji: "🚗", employee_count: "32K+", match_score: 84, tier: 1, notes: "Mobility and delivery platform. Data-driven.", tags: ["Mobility", "Marketplace", "ML"] },
  { id: "dc14", name: "Netflix", industry: "Streaming", hq: "Los Gatos, CA", career_url: "https://jobs.netflix.com", logo_emoji: "🎬", employee_count: "13K+", match_score: 78, tier: 1, notes: "Streaming entertainment. Freedom & responsibility.", tags: ["FAANG", "Streaming", "Content"] },
  { id: "dc15", name: "Salesforce", industry: "CRM / SaaS", hq: "San Francisco, CA", career_url: "https://salesforce.wd12.myworkdayjobs.com", logo_emoji: "☁️", employee_count: "73K+", match_score: 76, tier: 2, notes: "Enterprise CRM leader. AI-driven platform.", tags: ["SaaS", "Enterprise", "AI/ML"] },
  { id: "dc16", name: "Coinbase", industry: "Crypto / FinTech", hq: "Remote-First", career_url: "https://www.coinbase.com/careers", logo_emoji: "🪙", employee_count: "3.5K+", match_score: 70, tier: 2, notes: "Crypto exchange platform. Mission-driven.", tags: ["Crypto", "FinTech", "Web3"] },
  { id: "dc17", name: "Sea Limited", industry: "Gaming / E-Commerce", hq: "Singapore", career_url: "https://www.sea.com/careers", logo_emoji: "🌊", employee_count: "60K+", match_score: 83, tier: 1, notes: "Shopee, Garena, SeaMoney. SE Asia leader.", tags: ["E-Commerce", "Gaming", "SEA"] },
  { id: "dc18", name: "Notion", industry: "Productivity / SaaS", hq: "San Francisco, CA", career_url: "https://www.notion.so/careers", logo_emoji: "📝", employee_count: "1K+", match_score: 81, tier: 2, notes: "All-in-one workspace. Design-led.", tags: ["SaaS", "Productivity", "Growth"] },
  { id: "dc19", name: "Canva", industry: "Design / SaaS", hq: "Sydney, Australia", career_url: "https://www.canva.com/careers", logo_emoji: "🎨", employee_count: "5K+", match_score: 79, tier: 2, notes: "Design platform for everyone. PLG.", tags: ["SaaS", "Design", "Growth"] },
  { id: "dc20", name: "Snowflake", industry: "Data Cloud", hq: "Bozeman, MT", career_url: "https://careers.snowflake.com", logo_emoji: "❄️", employee_count: "7K+", match_score: 74, tier: 2, notes: "Data cloud platform. Enterprise-focused.", tags: ["Data", "Cloud", "Enterprise"] },
  { id: "dc21", name: "Gojek", industry: "Super-App", hq: "Jakarta, Indonesia", career_url: "https://www.gojek.io/careers", logo_emoji: "🛵", employee_count: "5K+", match_score: 85, tier: 1, notes: "Indonesia's super-app. Mobility, payments, food.", tags: ["Super-App", "SEA", "FinTech"] },
  { id: "dc22", name: "Atlassian", industry: "DevTools / SaaS", hq: "Sydney, Australia", career_url: "https://www.atlassian.com/company/careers", logo_emoji: "🔵", employee_count: "11K+", match_score: 77, tier: 2, notes: "Jira, Confluence, Trello. Team productivity.", tags: ["SaaS", "DevTools", "Enterprise"] },
  { id: "dc23", name: "DoorDash", industry: "Delivery", hq: "San Francisco, CA", career_url: "https://careers.doordash.com", logo_emoji: "🚪", employee_count: "18K+", match_score: 75, tier: 2, notes: "Delivery logistics. Marketplace dynamics.", tags: ["Delivery", "Marketplace", "Logistics"] },
  { id: "dc24", name: "Figma", industry: "Design Tools", hq: "San Francisco, CA", career_url: "https://www.figma.com/careers", logo_emoji: "✏️", employee_count: "1.5K+", match_score: 88, tier: 1, notes: "Collaborative design tool. Product-led growth.", tags: ["Design", "SaaS", "PLG"] },
  { id: "dc25", name: "Revolut", industry: "FinTech", hq: "London, UK", career_url: "https://www.revolut.com/careers", logo_emoji: "💰", employee_count: "8K+", match_score: 80, tier: 2, notes: "Global neobank. Fast-moving fintech.", tags: ["FinTech", "Banking", "Growth"] },
  { id: "dc26", name: "Wise", industry: "FinTech", hq: "London, UK", career_url: "https://www.wise.com/jobs", logo_emoji: "💸", employee_count: "5K+", match_score: 78, tier: 2, notes: "International money transfers. Transparent.", tags: ["FinTech", "Payments", "Global"] },
  { id: "dc27", name: "Klarna", industry: "FinTech", hq: "Stockholm, Sweden", career_url: "https://www.klarna.com/careers", logo_emoji: "🛒", employee_count: "4K+", match_score: 73, tier: 2, notes: "Buy now, pay later. AI-first pivot.", tags: ["FinTech", "BNPL", "AI/ML"] },
  { id: "dc28", name: "Twilio", industry: "Communications", hq: "San Francisco, CA", career_url: "https://www.twilio.com/company/jobs", logo_emoji: "📞", employee_count: "6K+", match_score: 69, tier: 3, notes: "Communication APIs and customer engagement.", tags: ["SaaS", "APIs", "Communications"] },
  { id: "dc29", name: "Palantir", industry: "Data Analytics", hq: "Denver, CO", career_url: "https://www.palantir.com/careers", logo_emoji: "🔮", employee_count: "3.5K+", match_score: 71, tier: 2, notes: "Data analytics for government and enterprise.", tags: ["Data", "Enterprise", "Gov"] },
  { id: "dc30", name: "Tencent", industry: "Technology", hq: "Shenzhen, China", career_url: "https://careers.tencent.com", logo_emoji: "🐧", employee_count: "108K+", match_score: 82, tier: 1, notes: "WeChat, gaming, cloud. Asia tech giant.", tags: ["Big Tech", "Gaming", "Social"] },
];

// ── Job listings ─────────────────────────────────────

export const MOCK_DISCOVERED_JOBS: DiscoveredJob[] = [
  // Google
  { id: "dj1", company_id: "dc1", company_name: "Google", title: "Senior Product Manager, Google Ads", location: "Singapore / Mountain View", type: "Full-Time", level: "Senior", salary_range: "$180K – $280K + equity", url: "https://careers.google.com/jobs/123", match_score: 92, source: "career_page", description: "Drive product strategy for Google Ads serving platform. Own ML-powered optimization, creative automation, and cross-format ad delivery. Partner with eng, UXR, and sales to scale $200B+ ad ecosystem.", posted_date: "2026-04-05", tags: ["Ad Tech", "ML", "Product Strategy"], requirements: ["8+ years product management", "Ad tech platform experience", "ML/AI product lifecycle", "Cross-functional leadership"] },
  { id: "dj2", company_id: "dc1", company_name: "Google", title: "Product Manager, Gemini AI Experiences", location: "Mountain View, CA", type: "Full-Time", level: "Mid-Senior", salary_range: "$165K – $250K + equity", url: "https://careers.google.com/jobs/456", match_score: 85, source: "career_page", description: "Shape the future of AI-powered experiences across Google products. Define product vision for Gemini integration into Search, Workspace, and developer platforms.", posted_date: "2026-04-02", tags: ["AI/ML", "Consumer", "Platform"], requirements: ["5+ years product management", "AI/ML products", "Consumer product experience", "Technical background"] },
  // Apple
  { id: "dj3", company_id: "dc2", company_name: "Apple", title: "Product Manager, Apple Intelligence", location: "Cupertino, CA", type: "Full-Time", level: "Senior", salary_range: "$195K – $310K + RSU", url: "https://jobs.apple.com/pm-ai", match_score: 81, source: "career_page", description: "Lead product direction for Apple Intelligence features across iOS, macOS. Define how on-device ML enhances user experience while maintaining privacy.", posted_date: "2026-04-07", tags: ["AI/ML", "Consumer", "Privacy"], requirements: ["8+ years PM", "ML product experience", "Apple ecosystem knowledge"] },
  // Meta
  { id: "dj4", company_id: "dc3", company_name: "Meta", title: "Product Manager, Ads Ranking", location: "Menlo Park, CA", type: "Full-Time", level: "Mid-Senior", salary_range: "$175K – $265K + RSU", url: "https://metacareers.com/pm-ads-ranking", match_score: 90, source: "career_page", description: "Improve ad relevance and revenue through ranking algorithm optimization. Own the ML pipeline for ad auction and delivery across Facebook and Instagram.", posted_date: "2026-04-04", tags: ["Ad Tech", "ML", "Ranking"], requirements: ["6+ years PM", "Ad tech / ML ranking", "Data-driven mindset"] },
  { id: "dj5", company_id: "dc3", company_name: "Meta", title: "Product Manager, WhatsApp Business Platform", location: "Singapore", type: "Full-Time", level: "Senior", salary_range: "$170K – $260K + RSU", url: "https://metacareers.com/pm-whatsapp", match_score: 83, source: "career_page", description: "Scale WhatsApp Business Platform for SMBs across APAC. Drive messaging-based commerce and customer engagement features.", posted_date: "2026-04-01", tags: ["Messaging", "Commerce", "APAC"], requirements: ["7+ years PM", "Platform products", "APAC market knowledge"] },
  // Amazon
  { id: "dj6", company_id: "dc4", company_name: "Amazon", title: "Sr. Product Manager, AWS GenAI", location: "Seattle, WA", type: "Full-Time", level: "Senior", salary_range: "$165K – $260K + RSU", url: "https://amazon.jobs/aws-genai", match_score: 84, source: "career_page", description: "Lead product strategy for AWS Bedrock and GenAI developer tools. Define the platform for enterprise AI adoption.", posted_date: "2026-04-06", tags: ["Cloud", "AI/ML", "Enterprise"], requirements: ["8+ years PM", "Cloud platform experience", "GenAI/LLM products"] },
  // Microsoft
  { id: "dj7", company_id: "dc5", company_name: "Microsoft", title: "Principal Product Manager, Copilot", location: "Redmond, WA", type: "Full-Time", level: "Principal", salary_range: "$190K – $320K + RSU", url: "https://careers.microsoft.com/copilot", match_score: 87, source: "career_page", description: "Define product vision for Microsoft 365 Copilot experiences. Bridge the gap between LLM capabilities and enterprise productivity workflows.", posted_date: "2026-04-03", tags: ["AI/ML", "Enterprise", "Productivity"], requirements: ["10+ years PM", "AI product strategy", "Enterprise SaaS"] },
  // Stripe
  { id: "dj8", company_id: "dc6", company_name: "Stripe", title: "Product Manager, Payments Optimization", location: "San Francisco / Singapore", type: "Full-Time", level: "Mid-Senior", salary_range: "$175K – $270K + equity", url: "https://stripe.com/jobs/pm-payments", match_score: 91, source: "career_page", description: "Optimize payment authorization rates and reduce fraud. Own the ML models that power intelligent routing and risk decisions for billions in payment volume.", posted_date: "2026-04-08", tags: ["FinTech", "Payments", "ML"], requirements: ["5+ years PM", "Payments/FinTech", "ML optimization"] },
  // Grab
  { id: "dj9", company_id: "dc7", company_name: "Grab", title: "Lead Product Manager, GrabAds", location: "Singapore", type: "Full-Time", level: "Lead", salary_range: "SGD 180K – 280K + RSU", url: "https://grab.careers/grabads-pm", match_score: 95, source: "career_page", description: "Own the end-to-end GrabAds monetization platform. Build self-serve ad tools for merchants, optimize ad delivery across ride-hailing, food, and fintech verticals.", posted_date: "2026-04-09", tags: ["Ad Tech", "Super-App", "SEA"], requirements: ["8+ years PM", "Ad platform experience", "SEA market expertise", "P&L ownership"] },
  { id: "dj10", company_id: "dc7", company_name: "Grab", title: "Product Manager, GrabPay", location: "Singapore", type: "Full-Time", level: "Senior", salary_range: "SGD 150K – 230K + RSU", url: "https://grab.careers/grabpay-pm", match_score: 87, source: "career_page", description: "Scale digital payments across Southeast Asia. Own GrabPay wallet, P2P transfers, and merchant payments integration.", posted_date: "2026-04-06", tags: ["FinTech", "Payments", "SEA"], requirements: ["6+ years PM", "Payment products", "Regulatory knowledge"] },
  // ByteDance
  { id: "dj11", company_id: "dc8", company_name: "ByteDance", title: "Product Manager, AIGC Platform", location: "Singapore", type: "Full-Time", level: "Senior", salary_range: "SGD 160K – 260K", url: "https://jobs.bytedance.com/aigc", match_score: 89, source: "career_page", description: "Build AI-generated content tools for TikTok creators and advertisers. Define the product roadmap for generative AI features across video, image, and text.", posted_date: "2026-04-05", tags: ["AI/ML", "Content", "Creator"], requirements: ["6+ years PM", "GenAI products", "Content platform"] },
  { id: "dj12", company_id: "dc8", company_name: "ByteDance", title: "Product Manager, TikTok Ads", location: "Singapore", type: "Full-Time", level: "Mid-Senior", salary_range: "SGD 140K – 220K", url: "https://jobs.bytedance.com/tiktok-ads", match_score: 86, source: "career_page", description: "Drive advertiser experience and ad product innovation on TikTok. Own campaign management, targeting, and measurement tools.", posted_date: "2026-04-03", tags: ["Ad Tech", "Social", "Growth"], requirements: ["5+ years PM", "Ad tech experience", "Mobile products"] },
  // Shopify
  { id: "dj13", company_id: "dc9", company_name: "Shopify", title: "Senior PM, Merchant Experience", location: "Remote", type: "Full-Time", level: "Senior", salary_range: "$160K – $240K + equity", url: "https://shopify.com/careers/merchant-pm", match_score: 78, source: "career_page", description: "Improve the core merchant dashboard experience. Drive usability, onboarding, and retention for Shopify's 5M+ merchants.", posted_date: "2026-04-04", tags: ["E-Commerce", "SaaS", "UX"], requirements: ["7+ years PM", "SaaS experience", "Merchant/SMB focus"] },
  // Datadog
  { id: "dj14", company_id: "dc10", company_name: "Datadog", title: "Product Manager, APM", location: "New York, NY", type: "Full-Time", level: "Mid-Senior", salary_range: "$155K – $230K + equity", url: "https://careers.datadoghq.com/apm-pm", match_score: 68, source: "career_page", description: "Own application performance monitoring product. Define the roadmap for distributed tracing, profiling, and error tracking.", posted_date: "2026-04-02", tags: ["DevOps", "SaaS", "Observability"], requirements: ["5+ years PM", "DevOps/monitoring products", "Technical background"] },
  // Airbnb
  { id: "dj15", company_id: "dc11", company_name: "Airbnb", title: "Product Manager, Search & Discovery", location: "San Francisco, CA", type: "Full-Time", level: "Senior", salary_range: "$170K – $265K + equity", url: "https://careers.airbnb.com/search-pm", match_score: 84, source: "career_page", description: "Reimagine how guests discover unique stays. Own search ranking, personalization, and ML-powered recommendations.", posted_date: "2026-04-07", tags: ["Search", "ML", "Consumer"], requirements: ["7+ years PM", "Search/discovery products", "ML personalization"] },
  // Spotify
  { id: "dj16", company_id: "dc12", company_name: "Spotify", title: "Product Manager, Personalization", location: "Stockholm / London", type: "Full-Time", level: "Mid-Senior", salary_range: "€120K – €180K + equity", url: "https://lifeatspotify.com/personalization", match_score: 80, source: "career_page", description: "Power Spotify's recommendation engine. Own Discover Weekly, Release Radar, and ML-driven personalization across the platform.", posted_date: "2026-04-01", tags: ["ML", "Consumer", "Audio"], requirements: ["5+ years PM", "Recommendation systems", "Consumer products"] },
  // Uber
  { id: "dj17", company_id: "dc13", company_name: "Uber", title: "Senior PM, Uber Eats Marketplace", location: "San Francisco, CA", type: "Full-Time", level: "Senior", salary_range: "$175K – $270K + equity", url: "https://uber.com/careers/eats-pm", match_score: 82, source: "career_page", description: "Optimize the three-sided marketplace for Uber Eats. Balance eater experience, restaurant partner success, and delivery efficiency.", posted_date: "2026-04-06", tags: ["Marketplace", "Delivery", "ML"], requirements: ["7+ years PM", "Marketplace products", "Data-driven optimization"] },
  // Netflix
  { id: "dj18", company_id: "dc14", company_name: "Netflix", title: "Product Manager, Content Discovery", location: "Los Gatos, CA", type: "Full-Time", level: "Senior", salary_range: "$200K – $350K", url: "https://jobs.netflix.com/content-discovery", match_score: 76, source: "career_page", description: "Define how 250M+ members discover their next favorite show. Own recommendation algorithms, UI experiments, and personalization.", posted_date: "2026-04-03", tags: ["ML", "Consumer", "Streaming"], requirements: ["8+ years PM", "Recommendation engines", "Consumer scale"] },
  // Salesforce
  { id: "dj19", company_id: "dc15", company_name: "Salesforce", title: "Product Manager, Einstein AI", location: "San Francisco, CA", type: "Full-Time", level: "Senior", salary_range: "$160K – $250K + equity", url: "https://salesforce.com/careers/einstein", match_score: 74, source: "career_page", description: "Build AI-powered CRM features using Einstein platform. Define how GenAI transforms sales, service, and marketing workflows.", posted_date: "2026-04-02", tags: ["AI/ML", "Enterprise", "CRM"], requirements: ["7+ years PM", "Enterprise SaaS", "AI product experience"] },
  // Coinbase
  { id: "dj20", company_id: "dc16", company_name: "Coinbase", title: "Product Manager, Trading Platform", location: "Remote", type: "Full-Time", level: "Mid-Senior", salary_range: "$155K – $240K + equity", url: "https://coinbase.com/careers/trading", match_score: 67, source: "career_page", description: "Own the core trading experience for retail and institutional users. Drive exchange reliability, new asset listings, and advanced trading features.", posted_date: "2026-04-01", tags: ["Crypto", "FinTech", "Trading"], requirements: ["5+ years PM", "Financial products", "Trading platforms"] },
  // Sea Limited
  { id: "dj21", company_id: "dc17", company_name: "Sea Limited", title: "Product Manager, Shopee Ads", location: "Singapore", type: "Full-Time", level: "Senior", salary_range: "SGD 140K – 220K", url: "https://sea.com/careers/shopee-ads", match_score: 85, source: "career_page", description: "Scale Shopee's advertising platform across Southeast Asia. Build self-serve ad tools and optimize sponsored product ranking.", posted_date: "2026-04-08", tags: ["Ad Tech", "E-Commerce", "SEA"], requirements: ["6+ years PM", "E-commerce ads", "SEA experience"] },
  // Notion
  { id: "dj22", company_id: "dc18", company_name: "Notion", title: "Product Manager, AI Features", location: "San Francisco, CA", type: "Full-Time", level: "Mid-Senior", salary_range: "$160K – $240K + equity", url: "https://notion.so/careers/ai-pm", match_score: 79, source: "career_page", description: "Define how AI transforms knowledge management. Build AI-powered writing, summarization, and action items into Notion's workspace.", posted_date: "2026-04-05", tags: ["AI/ML", "Productivity", "SaaS"], requirements: ["5+ years PM", "AI/GenAI products", "Productivity tools"] },
  // Canva
  { id: "dj23", company_id: "dc19", company_name: "Canva", title: "Product Manager, Magic Studio", location: "Sydney, Australia", type: "Full-Time", level: "Senior", salary_range: "AUD 180K – 260K + equity", url: "https://canva.com/careers/magic-studio", match_score: 77, source: "career_page", description: "Build AI-powered design tools in Canva's Magic Studio. Own text-to-image, background removal, and style transfer features.", posted_date: "2026-04-04", tags: ["AI/ML", "Design", "PLG"], requirements: ["6+ years PM", "GenAI products", "Design tools"] },
  // Figma
  { id: "dj24", company_id: "dc24", company_name: "Figma", title: "Product Manager, Developer Platform", location: "San Francisco, CA", type: "Full-Time", level: "Senior", salary_range: "$170K – $260K + equity", url: "https://figma.com/careers/dev-platform", match_score: 86, source: "career_page", description: "Own Figma's developer platform: plugins, widgets, APIs, and Dev Mode. Enable the ecosystem of 4M+ designers and developers.", posted_date: "2026-04-07", tags: ["Platform", "Developer", "Design"], requirements: ["7+ years PM", "Platform/API products", "Developer ecosystems"] },
  // Gojek
  { id: "dj25", company_id: "dc21", company_name: "Gojek", title: "Product Manager, GoPay", location: "Jakarta / Singapore", type: "Full-Time", level: "Senior", salary_range: "SGD 130K – 200K", url: "https://gojek.io/careers/gopay", match_score: 83, source: "career_page", description: "Scale digital payments infrastructure across Indonesia. Own wallet features, merchant payments, and lending products.", posted_date: "2026-04-06", tags: ["FinTech", "Payments", "SEA"], requirements: ["6+ years PM", "FinTech products", "SEA market experience"] },
  // Revolut
  { id: "dj26", company_id: "dc25", company_name: "Revolut", title: "Product Manager, Growth", location: "London / Singapore", type: "Full-Time", level: "Senior", salary_range: "£120K – £180K + equity", url: "https://revolut.com/careers/growth-pm", match_score: 78, source: "career_page", description: "Drive user acquisition and activation across Revolut's global markets. Own growth loops, referral programs, and onboarding optimization.", posted_date: "2026-04-05", tags: ["FinTech", "Growth", "Consumer"], requirements: ["6+ years PM", "Growth/acquisition", "FinTech experience"] },
  // Tencent
  { id: "dj27", company_id: "dc30", company_name: "Tencent", title: "Product Manager, WeChat Pay International", location: "Singapore", type: "Full-Time", level: "Senior", salary_range: "SGD 160K – 250K", url: "https://careers.tencent.com/wechat-pay", match_score: 80, source: "career_page", description: "Expand WeChat Pay to international markets. Build cross-border payment solutions for merchants and consumers.", posted_date: "2026-04-04", tags: ["FinTech", "Payments", "Global"], requirements: ["7+ years PM", "Payment products", "International expansion"] },
  // Atlassian
  { id: "dj28", company_id: "dc22", company_name: "Atlassian", title: "Product Manager, Jira AI", location: "Sydney / Remote", type: "Full-Time", level: "Mid-Senior", salary_range: "AUD 160K – 230K + equity", url: "https://atlassian.com/careers/jira-ai", match_score: 75, source: "career_page", description: "Integrate AI capabilities into Jira. Build intelligent issue routing, sprint planning assistance, and auto-categorization.", posted_date: "2026-04-03", tags: ["AI/ML", "DevTools", "Enterprise"], requirements: ["5+ years PM", "DevTools/project management", "AI product experience"] },
  // DoorDash
  { id: "dj29", company_id: "dc23", company_name: "DoorDash", title: "Senior PM, Logistics & Routing", location: "San Francisco, CA", type: "Full-Time", level: "Senior", salary_range: "$165K – $255K + equity", url: "https://careers.doordash.com/logistics", match_score: 73, source: "career_page", description: "Optimize delivery routing and batching algorithms. Drive efficiency across DoorDash's logistics network.", posted_date: "2026-04-02", tags: ["Logistics", "ML", "Marketplace"], requirements: ["7+ years PM", "Logistics/routing optimization", "ML products"] },
  // Wise
  { id: "dj30", company_id: "dc26", company_name: "Wise", title: "Product Manager, Transfer Experience", location: "London / Singapore", type: "Full-Time", level: "Mid-Senior", salary_range: "£100K – £150K + equity", url: "https://wise.com/jobs/transfers", match_score: 76, source: "career_page", description: "Own the end-to-end international transfer experience. Improve speed, cost, and transparency for 16M+ customers.", posted_date: "2026-04-01", tags: ["FinTech", "Payments", "UX"], requirements: ["5+ years PM", "Payment products", "Consumer UX"] },
];

// ── Default search profile ──────────────────────────

export const DEFAULT_PROFILE: SearchProfile = {
  id: "sp1",
  title: "Product Manager",
  target_roles: ["Senior Product Manager", "Lead Product Manager", "Principal PM"],
  industries: ["Technology", "FinTech", "E-Commerce", "Super-App"],
  locations: ["Singapore", "Remote", "San Francisco, CA"],
  min_match_score: 70,
  keywords: ["product strategy", "ad tech", "ML/AI", "growth", "monetization", "platform"],
  experience_years: "8+",
  auto_scan_enabled: true,
  auto_scan_interval: "weekly",
  created_at: "2026-03-15T10:00:00Z",
  updated_at: "2026-04-01T14:00:00Z",
};

// ── Mock scan runs ──────────────────────────────────

export const MOCK_SCAN_RUNS: ScanRun[] = [
  {
    id: "sr1",
    profile_id: "sp1",
    status: "completed",
    started_at: "2026-04-09T06:00:00Z",
    completed_at: "2026-04-09T06:15:00Z",
    companies_scanned: 30,
    new_jobs_found: 8,
    total_matches: 30,
    source: "career_pages",
  },
  {
    id: "sr2",
    profile_id: "sp1",
    status: "completed",
    started_at: "2026-04-02T06:00:00Z",
    completed_at: "2026-04-02T06:12:00Z",
    companies_scanned: 25,
    new_jobs_found: 12,
    total_matches: 25,
    source: "career_pages",
  },
  {
    id: "sr3",
    profile_id: "sp1",
    status: "completed",
    started_at: "2026-03-26T06:00:00Z",
    completed_at: "2026-03-26T06:18:00Z",
    companies_scanned: 20,
    new_jobs_found: 15,
    total_matches: 22,
    source: "web_search",
  },
];
