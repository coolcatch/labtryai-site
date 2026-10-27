// ===== Single place to change brand, pricing, links =====
window.APP_CONFIG = {
  BRAND_NAME: "Lab Try AI",
  TAGLINE: "AI prompts that write better Etsy & KDP listings",
  SITE_URL: "https://labtryai.com", // set after choosing domain (also update sitemap.xml, robots.txt, OG tags)
  PRO_PRICE: "$19 USD",
  PRO_PRICE_NOTE: "one-time, lifetime access",
  PAYMENT_LINK_URL: "https://labtryai.gumroad.com/l/REPLACE_ME", // Gumroad / Lemon Squeezy product checkout URL
  EMAIL_FORM_ACTION: "", // e.g. Formspree/Resend endpoint. Empty = stored locally only (placeholder)
  // Licence keys: set GUMROAD_PRODUCT_ID (Gumroad product > Content > License key > product_id).
  // When set, Pro unlock verifies the buyer's licence key with Gumroad's public API (CORS-enabled).
  GUMROAD_PRODUCT_ID: "",
  // Fallback honour-system codes, used ONLY when GUMROAD_PRODUCT_ID is empty.
  UNLOCK_CODES: ["LAB-PRO-2026"],
  CONTACT_EMAIL: "hello@labtryai.com"
};
