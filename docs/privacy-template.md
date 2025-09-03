# privacy-template.md
> Purpose: Drive Cursor to auto-generate a **Privacy Policy** from your actual codebase + minimal admin input, and highlight any **gaps** that may create compliance risks.

---

## 🔧 How to use (Cursor, read carefully)
1) Scan repository to auto-detect items in **Auto-Detect Matrix**.  
2) Ask me **only** the questions in **Minimal Questions** that you cannot infer.  
3) Validate with **Sanity Checks**. If conflicts → show a short diff + ask me to resolve.  
4) Generate `./legal/privacy-policy.md` (Markdown) matching **Output Spec**.  
5) After drafting, include a **Gaps & Recommendations** section pointing out missing features that weaken compliance.  

---

## 🤖 Auto-Detect Matrix (from codebase + config)
Cursor, detect these facts automatically:

| Category | What to Detect | Signals | Placeholder(s) |
|---|---|---|---|
| Personal Data Collected | user model fields, forms, cookies, uploads | DB schemas, form inputs, API routes | `{{identifiers}}`, `{{account_data}}`, `{{ugc_data}}` |
| Sensitive Data | health, financial, biometric | model names, SDKs, API calls | `{{sensitive_data}}` |
| Payments | Stripe/PayPal/etc. | SDK imports, webhooks | `{{payment_providers}}` |
| Tracking/Analytics | GA, Segment, Mixpanel, cookies | frontend scripts, env keys | `{{analytics}}`, `{{cookies}}` |
| Location Data | geolocation APIs, maps SDKs | code refs | `{{geolocation}}` |
| Sharing/Disclosure | third-party API calls | imports, env vars | `{{third_parties}}` |
| Retention | TTL fields, cron jobs, purge tasks | migrations, jobs | `{{retention_policy}}` |
| Security Measures | encryption, TLS, RBAC | bcrypt/argon2, `https`, RBAC checks | `{{security_measures}}` |
| Hosting/Transfers | cloud provider & region | IaC, configs, DNS | `{{hosting_region}}` |
| User Rights | delete/export features | routes `/delete-account`, `/export-data` | `{{has_delete}}`, `{{has_export}}` |

---

## 🧑‍💼 Minimal Questions
Ask me only if missing or ambiguous:

- **Company & Contact**
  - Legal name / brand: `{{company_name}}`
  - Address: `{{company_address}}`
  - Privacy email: `{{privacy_email}}`
- **Legal Choices**
  - Governing law: `{{governing_law}}`
  - Minimum age (13/16/18): `{{minimum_age}}`
- **Data Practices**
  - Do you resell/share data with advertisers? `{{data_resale}}`
  - Do you transfer data outside user’s country? `{{cross_border_transfers}}`
- **Policy Metadata**
  - Effective date: `{{effective_date}}`

---

## 🧱 Output Spec
- Path: `./legal/privacy-policy.md`  
- Format: GitHub-flavored Markdown  
- Sections (in this order):  
  1. Introduction  
  2. Information We Collect  
  3. How We Use Information  
  4. Sharing & Disclosure  
  5. Cookies & Tracking  
  6. Payments  
  7. Retention  
  8. Security  
  9. International Data Transfers  
  10. Your Rights  
  11. Children’s Privacy  
  12. Changes to This Policy  
  13. Contact Information  
  14. **Gaps & Recommendations**  

---

## 🧩 Clause Text (templated)

### Introduction
This Privacy Policy describes how **{{company_name}}** (“we”) collects, uses, and shares personal information. Effective: **{{effective_date}}**. Contact: **{{privacy_email}}**.

### Information We Collect
- Identifiers: {{identifiers}}  
- Account data: {{account_data}}  
- Payments: {{payment_providers}}  
- Analytics/tracking: {{analytics}}, cookies: {{cookies}}  
- Location: {{geolocation}}  
- User-generated content: {{ugc_data}}  
- Sensitive data (if any): {{sensitive_data}}  

### How We Use Information
We use your data to:
- Provide services and features  
- Process payments via {{payment_providers}}  
- Analyze product usage via {{analytics}}  
- Communicate with you (marketing opt-outs included)  
- Comply with legal obligations  

### Sharing & Disclosure
We may share with:
- Service providers: {{third_parties}}  
- Legal authorities if required  
- No sale of personal information unless `{{data_resale}} = yes`  

### Cookies & Tracking
We use cookies and tracking for {{analytics}}. You can opt out via browser settings or {{cookie_banner}} if present.

### Payments
Payments are handled by {{payment_providers}}. We do not store full credit card numbers.

### Retention
We keep data as long as {{retention_policy}} or required by law.

### Security
We apply {{security_measures}}, TLS/HTTPS, and access controls.

### International Data Transfers
Data may be processed in {{hosting_region}}. If transferred abroad, we use safeguards (e.g., SCCs).

### Your Rights
Depending on your jurisdiction, you may:
- Delete account (**{{has_delete}}**)  
- Export data (**{{has_export}}**)  
- Opt out of marketing  
- Withdraw consent  

### Children’s Privacy
Minimum age: **{{minimum_age}}**. We do not knowingly collect data from children under this age.

### Changes to This Policy
We may update this Policy. Updates are effective when posted with a new effective date.

### Contact Information
Questions? Email us at **{{privacy_email}}** or write to **{{company_address}}**.

---

## 🕳️ Gaps & Recommendations (new section)
Cursor: After scanning, surface gaps that weaken compliance.

### User Rights
- ❌ No account deletion route → ⚠️ Risk: GDPR/CCPA require deletion rights.  
- ❌ No export/data portability → ⚠️ Risk: DSAR rights unmet.  

### Cookies & Tracking
- ❌ Tracking detected but no cookie banner → ⚠️ Risk: EU ePrivacy non-compliance.  

### Payments
- ❌ Payment processing detected but no refund/cancellation clause → ⚠️ Risk: consumer law issues.  

### Security
- ❌ No encryption library detected → ⚠️ Risk: breach liability.  
- ❌ No HTTPS enforcement → ⚠️ Risk: insecure transmission.  

### Legal Basics
- ❌ No governing law set → ⚠️ Terms may be unenforceable.  
- ❌ No age threshold → ⚠️ Risk under child data laws (COPPA/GDPR).  

---

## ✅ Generation Rules
- Don’t hallucinate features or vendors.  
- If facts missing, ask once with proposed defaults.  
- Remove unused placeholders.  
- Append changelog footer: `_Generated by Cursor from codebase context: {{iso_datetime}}_`.  