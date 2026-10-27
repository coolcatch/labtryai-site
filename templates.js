// Prompt templates. pro:true = locked behind Pro unlock.
(function(){
const F = {
  productType:{label:"Product type",ph:"e.g. printable weekly planner PDF"},
  niche:{label:"Niche / theme",ph:"e.g. ADHD-friendly productivity"},
  audience:{label:"Target buyer",ph:"e.g. busy moms, college students"},
  tone:{label:"Style / tone",type:"select",opts:["Warm & friendly","Professional & clear","Playful & fun","Minimal & calm","Luxury & elegant"]},
  features:{label:"Key features (one per line)",type:"textarea",ph:"e.g. 52 undated pages\nA4 + US Letter\nInstant download"},
  price:{label:"Price point",ph:"e.g. $6.50"},
  seeds:{label:"Seed keywords (optional)",ph:"e.g. weekly planner, adhd planner"},
  bookType:{label:"Book type",ph:"e.g. large-print Sudoku puzzle book"},
  pages:{label:"Page count / trim size",ph:"e.g. 120 pages, 8.5 x 11 in"},
  extra:{label:"Anything else the AI should know (optional)",type:"textarea",ph:"e.g. my shop style, competitors I admire"}
};
const L = s => s ? s.trim() : "";
const list = s => L(s).split(/\n+/).filter(Boolean).map(x=>"- "+x.trim()).join("\n") || "- (not provided — infer sensible features and mark them as assumptions)";
function ctx(v, kdp){
  return `## Context
- ${kdp?"Book type":"Product type"}: ${L(kdp?v.bookType:v.productType)||"(not provided)"}
- Niche / theme: ${L(v.niche)||"(not provided)"}
- Target buyer: ${L(v.audience)||"(not provided)"}
- Tone: ${L(v.tone)||"Warm & friendly"}
${kdp&&L(v.pages)?`- Pages / trim: ${L(v.pages)}\n`:""}${L(v.price)?`- Price point: ${L(v.price)}\n`:""}${L(v.seeds)?`- Seed keywords: ${L(v.seeds)}\n`:""}- Key features:
${list(v.features)}${L(v.extra)?`\n- Extra notes: ${L(v.extra)}`:""}`;
}
const ETSY_RULES = `## Etsy rules you must follow
- Listing title: max 140 characters. Etsy recommends clear, concise titles (front-load the most important words; avoid long keyword-stuffed strings and repeating words).
- Tags: exactly 13 tags, each max 20 characters (including spaces). Use multi-word phrases buyers actually type; don't repeat the same tag; don't waste tags on the category name.
- This is a DIGITAL download: state clearly that nothing physical is shipped.
- Never use trademarked brand or character names (e.g. Disney, Cricut, Stanley) unless the seller owns them.`;
const KDP_RULES = `## Amazon KDP rules you must follow
- Title + subtitle together: max 200 characters. Title must match the cover exactly.
- No unauthorized trademarked terms, other authors/titles, "bestselling", "free", promotions, or repeated generic words like "notebook, journal, gifts".
- Backend keywords: 7 slots, each max 50 characters; 2–3 word reader-search phrases; don't repeat words already in the title.
- Description: max 4,000 characters (HTML tags count toward the limit). No URLs, prices, reviews/testimonials, requests for reviews, or time-sensitive info.`;
const ROLE_E = "You are a senior Etsy SEO copywriter who has optimised thousands of digital-product listings.";
const ROLE_K = "You are an expert Amazon KDP publishing strategist and copywriter specialising in low- and medium-content books.";
const END = `## Before answering
If key information is missing, make sensible assumptions and list them at the end under "Assumptions". Do not invent reviews, sales numbers or awards.`;
function P(role, v, kdp, task, out){ return [role, ctx(v,kdp), kdp?KDP_RULES:ETSY_RULES, "## Task\n"+task, "## Output format\n"+out, END].join("\n\n"); }
const EF = ["productType","niche","audience","tone","features","price","seeds","extra"];
const KF = ["bookType","niche","audience","tone","features","pages","price","seeds","extra"];

const T = [
// ---------- ETSY ----------
{id:"etsy-title",platform:"etsy",pro:false,name:"Listing title",desc:"5 SEO titles under 140 chars",fields:EF,
 build:v=>P(ROLE_E,v,false,"Write 5 alternative Etsy listing titles for this digital product. Put the main search phrase in the first ~40 characters (what shows in search results). Each title must be 140 characters or fewer.",
 "A numbered list. After each title show its character count in brackets, e.g. [112 chars]. Then recommend the best one in one sentence and why.")},
{id:"etsy-tags",platform:"etsy",pro:false,name:"13 Etsy tags",desc:"Exactly 13 tags, ≤20 chars each",fields:EF,
 build:v=>P(ROLE_E,v,false,"Generate exactly 13 Etsy tags. Mix: 4 broad, 6 specific long-tail, 3 buyer-intent/occasion tags (e.g. gift, use-case). Each tag max 20 characters including spaces.",
 "A table: # | tag | character count | type (broad/long-tail/intent). Then one comma-separated line I can paste straight into Etsy.")},
{id:"etsy-description",platform:"etsy",pro:false,name:"Listing description",desc:"Scannable, benefit-led copy",fields:EF,
 build:v=>P(ROLE_E,v,false,"Write a high-converting Etsy listing description. The first 160 characters must work as a hook (Etsy/Google show it as a preview) and include the main keyword naturally. Lead with benefits, then what's included, file details, how to download/use, and a short FAQ.",
 "Plain text (Etsy doesn't render markdown): hook paragraph, then sections with CAPS headings and • bullets: WHAT YOU GET, HOW IT WORKS, FILE DETAILS, PLEASE NOTE (digital download, no physical item, colours may vary by printer, personal-use terms), FAQ (3 Q&As).")},
{id:"etsy-idea",platform:"etsy",pro:true,name:"Product idea research",desc:"10 validated product ideas",fields:["niche","audience","price","extra"],
 build:v=>P(ROLE_E,v,false,"Brainstorm 10 digital product ideas for this niche and buyer that can be made with AI + Canva in under a day. For each: why buyers want it, search phrases to validate on Etsy (I'll check them in eRank/Etsy search), likely competition level (your estimate, say it's an estimate), suggested price range, and a bundle/upsell idea.",
 "A table, then a ranked top 3 with a one-line reason each.")},
{id:"etsy-content",platform:"etsy",pro:true,name:"Digital product content",desc:"Page-by-page planner/printable plan",fields:EF,
 build:v=>P(ROLE_E,v,false,"Design the full content of this digital product (e.g. planner or printable pack): page list, the purpose of each page, exact headings, prompts/fields text on each page, and layout notes I can recreate in Canva. Make it genuinely useful for the target buyer, not filler.",
 "1) Product outline (page # | page name | purpose). 2) Full text for every page. 3) Canva layout + font/colour suggestions matching the tone. 4) 3 ideas for a bonus page.")},
{id:"etsy-pinterest",platform:"etsy",pro:true,name:"Pinterest pins",desc:"10 pin titles, descriptions, overlays",fields:EF,
 build:v=>P(ROLE_E,v,false,"Create 10 Pinterest pins to drive traffic to this Etsy listing. Pin titles max 100 characters; descriptions max 500 characters, keyword-rich and natural. Include a short text overlay (max 6 words) and an image idea for each.",
 "A numbered list: Title / Description / Text overlay / Image idea / Suggested board name.")},
{id:"etsy-social",platform:"etsy",pro:true,name:"Social media posts",desc:"Instagram, TikTok, Facebook posts",fields:EF,
 build:v=>P(ROLE_E,v,false,"Write a 1-week launch content plan: 3 Instagram captions, 3 TikTok/Reels video scripts (hook in first 2 seconds, 15–30s), and 1 Facebook group-friendly post (helpful, not spammy). Honest claims only.",
 "Grouped by platform, each with hashtags (max 8) and a clear call to action.")},
{id:"etsy-about",platform:"etsy",pro:true,name:"Shop announcement & About",desc:"Shop story, announcement, policies blurb",fields:["niche","audience","tone","features","extra"],
 build:v=>P(ROLE_E,v,false,"Write (1) an Etsy shop announcement (under 500 characters), (2) a shop title/headline (max 55 characters), (3) an 'About' story (250–400 words) that is authentic — if it mentions AI, be transparent that products are designed with AI assistance and curated by a human, (4) a short digital-download FAQ for shop policies.",
 "Four clearly labelled sections.")},
{id:"etsy-bundle",platform:"etsy",pro:true,bundle:true,name:"Full Etsy listing in one go",desc:"Title + 13 tags + description + pins",fields:EF,
 build:v=>P(ROLE_E,v,false,"Produce a complete, ready-to-paste Etsy listing: 3 title options (≤140 chars, with counts) and your pick; exactly 13 tags (≤20 chars, with counts) plus a paste-ready comma line; a full plain-text description (hook first 160 chars, WHAT YOU GET, HOW IT WORKS, FILE DETAILS, PLEASE NOTE, FAQ); 10 listing photo/mockup ideas in order (thumbnail first); 3 Pinterest pins; and a price recommendation with a bundle upsell.",
 "Sections in this order: TITLE, TAGS, DESCRIPTION, PHOTOS, PINTEREST, PRICING. Then a final checklist confirming every limit was respected.")},
// ---------- KDP ----------
{id:"kdp-title",platform:"kdp",pro:false,name:"Title + subtitle",desc:"5 options under 200 chars",fields:KF,
 build:v=>P(ROLE_K,v,true,"Write 5 title + subtitle combinations. Keep the title short and memorable (ideally under 60 characters — KDP notes shoppers skim past long titles); put descriptive search phrases in the subtitle. Combined length must be 200 characters or fewer.",
 "Numbered list: Title | Subtitle | combined character count. Then recommend one and explain in one sentence.")},
{id:"kdp-keywords",platform:"kdp",pro:false,name:"7 backend keywords",desc:"7 slots, ≤50 chars each",fields:KF,
 build:v=>P(ROLE_K,v,true,"Generate the 7 KDP backend keyword slots. Each slot is a 2–3 word (up to 50 character) phrase a reader would actually type. Cover: audience, use-case/occasion, format (e.g. large print), difficulty/age, theme, gift intent. Avoid words already in the title and avoid trademarks.",
 "A table: slot # | keyword phrase | character count | reasoning. Then a short list of 5 searches I should test in the Amazon search bar to validate them.")},
{id:"kdp-description",platform:"kdp",pro:false,name:"Book description",desc:"Persuasive, HTML-ready, ≤4000 chars",fields:KF,
 build:v=>P(ROLE_K,v,true,"Write a persuasive Amazon book description (aim for 1,200–2,000 characters, never over 4,000 including HTML tags). Open with a bold hook, then benefits, what's inside (bullets), who it's perfect for, and a gentle call to action (e.g. 'Scroll up and grab your copy'). No prices, URLs, reviews or promises of rank.",
 "Provide the description in KDP-supported HTML (<b>, <i>, <ul>, <li>, <br>, <h4>), then the total character count including tags.")},
{id:"kdp-niche",platform:"kdp",pro:true,name:"Book niche research",desc:"10 niche ideas + validation plan",fields:["bookType","niche","audience","extra"],
 build:v=>P(ROLE_K,v,true,"Suggest 10 sub-niches for this book type. For each: target reader, angle that differentiates it, 3 Amazon search phrases to validate, what to check on page 1 (BSR range, number of reviews, cover quality) and your estimated competition (clearly labelled as an estimate — I'll verify with real data).",
 "A table, then a top 3 with a 7-day publishing plan for the #1 pick.")},
{id:"kdp-interior",platform:"kdp",pro:true,name:"Interior content plan",desc:"Puzzle/colouring themes & page plan",fields:KF,
 build:v=>P(ROLE_K,v,true,"Plan the full interior. For puzzle books: sections, difficulty curve, puzzle counts, themed word lists (for word search, 15–20 words each), solution layout. For colouring books: 30–50 page themes, each with a detailed AI image prompt for clean black-and-white line art (thick outlines, no shading, white background, no text). Include front matter (title page, how to use, copyright page) and back matter.",
 "1) Interior outline table. 2) Full content (themes/word lists/image prompts). 3) KDP print notes: trim size, bleed or no bleed, margins, paper colour recommendation.")},
{id:"kdp-aplus",platform:"kdp",pro:true,name:"A+ Content",desc:"Module-by-module A+ copy & image briefs",fields:KF,
 build:v=>P(ROLE_K,v,true,"Write Amazon A+ Content for this book: 5 modules (e.g. header banner, 'what's inside' image + text, comparison/series chart, who it's for, sample pages). For each give headline, body copy, and an image brief with recommended dimensions. Follow A+ guidelines: no prices, reviews, time-sensitive claims, or external links.",
 "Module 1–5, each with Headline / Body / Image brief.")},
{id:"kdp-ads",platform:"kdp",pro:true,name:"Amazon Ads keywords",desc:"Keyword list for Sponsored Products",fields:KF,
 build:v=>P(ROLE_K,v,true,"Build a starter Amazon Ads (Sponsored Products) keyword list: 50 keywords grouped into broad, phrase and exact match candidates, plus 15 negative keywords. Do NOT include trademarked brand names or author names. Suggest a starting daily budget approach and bid strategy for a beginner, and what to review after 14 days.",
 "Tables per match type, then negatives, then a 5-step optimisation checklist.")},
{id:"kdp-bundle",platform:"kdp",pro:true,bundle:true,name:"KDP launch kit",desc:"Title, keywords, description, ads, launch plan",fields:KF,
 build:v=>P(ROLE_K,v,true,"Produce a complete KDP launch kit: 3 title+subtitle options (≤200 combined, with counts) and your pick; 7 backend keyword slots (≤50 chars each, with counts); an HTML book description (≤4000 chars incl. tags, with count); 2 category suggestions to look for; cover design brief (front text, imagery, colours, font style); 25 Amazon Ads starter keywords; and a 14-day launch checklist.",
 "Sections: TITLE, KEYWORDS, DESCRIPTION, CATEGORIES, COVER BRIEF, ADS, LAUNCH PLAN. End with a compliance checklist confirming every KDP limit was respected.")}
];
window.PB = {FIELDS:F, TEMPLATES:T};
})();
