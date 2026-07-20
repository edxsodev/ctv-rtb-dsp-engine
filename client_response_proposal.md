# Executive Response & Technical Proposal for CTV DSP Project

**Prepared for:** Nitin Sir & Client  
**Subject:** White-Label CTV DSP & RTB Engine Architecture, DV360 Compatibility, PMP Deal Pricing, and Tech Management Proposal  
**Live Interactive Simulator:** [http://142.93.213.101:8085](http://142.93.213.101:8085)  

---

## 1. Response to Specific Client Queries

### Q2. Is this interface built to execute live campaigns, or is it a concept prototype?
> **Answer:**  
> The link provided ([http://142.93.213.101:8085](http://142.93.213.101:8085)) is an **interactive prototype & architecture simulator** built specifically to demonstrate how a White-Label DSP, OpenRTB 2.5 bidder, and VAST video serving engine operate end-to-end.
> 
> Once we finalize your preferred White-Label engine vendor (e.g. TeqBlaze, AdKernel, or Epom), we will brand the production platform under your agency's logo and domain, connecting it live to production exchanges for real campaign execution.

---

### Q3. Which platform should we select for our Connected TV (CTV) needs?
> **Answer & Recommendation:**  
> Based on your agency's goals in the Indian CTV market, we recommend selecting between these three proven options:
> 
> 1. **TeqBlaze (Recommended for Owned Stack)**: Best if you want a dedicated, white-label DSP+SSP engine with complete control over bidding algorithms, high QPS video scaling, and direct OpenRTB connection to Amagi ADS PLUS and Samsung Ads.
> 2. **AdKernel**: Best if you require full log-level transparency and a zero-commission model (flat subscription).
> 3. **AdLib**: Best if your primary requirement is a single dashboard that aggregates 20+ underlying DSPs (including direct YouTube & DV360 buying capabilities).
> 
> *We can schedule direct technical integration calls with any shortlisted vendor.*

---

### Q4. Can I access Google DV360 through all white-label CTV engines?
> **Answer & Technical Clarification:**  
> In programmatic advertising, **DV360 (Google Display & Video 360) is a Demand-Side Platform (DSP)**, just like your White-Label DSP. One DSP does not bid *through* another DSP. Instead, **both DV360 and your White-Label DSP bid into the SAME Supply-Side Platforms (SSPs)** (such as Google AdX, Amagi ADS PLUS, Samsung Ads, PubMatic, and Magnite).
> 
> If access to **YouTube & Google DV360 ecosystem** under one branded interface is mandatory:
> - **Option A (AdLib)**: Operates as a "DSP-of-DSPs" aggregator wrapper that natively exposes DV360 & YouTube buying inside one unified dashboard.
> - **Option B (Direct OpenRTB)**: Your white-label DSP (TeqBlaze/AdKernel) connects directly to Google AdX (CTV Video) via OpenRTB, giving you access to all non-YouTube Google programmatic inventory.

---

### Q5. I will negotiate special rates directly with supply networks (Amagi, Samsung, LG). Will these systems allow custom pricing?
> **Answer:**  
> **YES, absolutely!** This is handled via **PMP (Private Marketplace) Deal IDs**.
> 
> When you negotiate custom eCPMs or volume discounts directly with supply networks (Amagi, Samsung Ads, LG Channels, Hotstar), the publisher issues a unique **Deal ID** (e.g., `DEAL-AMAGI-AGENCY-2026`).
> 
> Inside your White-Label DSP, when creating a campaign, you simply input your custom **Deal ID**. The RTB bidder automatically passes this ID in the OpenRTB 2.5 payload, ensuring your custom negotiated pricing and priority auction access are enforced.

---

### Q6. Technical Oversight & Execution Management Proposal (Costs)

To manage both sides of the interface (demand setup + supply integrations) and oversee technical operations, we propose a two-phase technical management engagement:

| Service Phase | Scope & Deliverables | Projected Fee |
| :--- | :--- | :--- |
| **Phase 1: Setup, Onboarding & Integration** *(One-Time)* | • White-label platform deployment & DNS mapping<br>• Custom branding (agency logo, domain, CSS styling)<br>• PMP Deal ID setup (Amagi, Samsung, Hotstar)<br>• OpenRTB 2.5 / VAST 4.2 server tag testing & validation | **₹1,75,000** *(One-time)* |
| **Phase 2: Monthly Tech Ops & Execution Oversight** *(Retainer)* | • 24/7 RTB bidder monitoring & QPS optimization<br>• Campaign creation, VAST tag validation & pacing oversight<br>• Troubleshooting bid errors, floor prices, and VCR completion<br>• Monthly tech reporting & vendor coordination | **₹85,000 / month** *(or 2% of managed media spend)* |
