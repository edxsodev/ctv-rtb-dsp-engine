/**
 * Pricing & ROI Data for White-Label DSP & RTB Engine (India Focus - ₹ INR)
 * Compares Subscription Licensing models vs. Revenue Share models for Indian CTV Advertising.
 */

const VENDOR_PRICING = [
    {
        name: "TeqBlaze (India License)",
        tagline: "Modular white-label DSP+SSP stack for high QPS video & Smart TV",
        monthlyFeeINR: 400000, // ₹4 Lakhs / mo
        revSharePercent: 5,
        setupTime: "2-3 Weeks",
        bestFor: "Agencies wanting full stack control & custom bidder logic in India",
        features: [
            "Smart Bidding ML Toolkit",
            "Unlimited QPS scaling",
            "Free custom Prebid adapters",
            "OpenRTB 2.5 & VAST 4.2 video support",
            "Direct Amagi ADS PLUS & Samsung Ads PMP connection"
        ]
    },
    {
        name: "AdKernel (Zero Rev-Share)",
        tagline: "High-volume RTB ad server & CTV bidder stack",
        monthlyFeeINR: 280000, // ₹2.8 Lakhs / mo
        revSharePercent: 0,
        setupTime: "1-2 Weeks",
        bestFor: "High volume agencies needing log-level transparency without spend commissions",
        features: [
            "AI-based Bid Optimizers",
            "Full log-level data export",
            "Dedicated CTV/DOOH video stack",
            "Prebid & 50+ DSP/SSP integrations",
            "Zero recurring commission on ad spend"
        ]
    },
    {
        name: "AdLib (Multi-DSP Layer)",
        tagline: "Multi-DSP aggregator & unified white-label buyer UI",
        monthlyFeeINR: 120000, // ₹1.2 Lakhs / mo
        revSharePercent: 8,
        setupTime: "4-6 Weeks",
        bestFor: "Agencies wanting access to 20+ DSPs (incl. DV360 & YouTube) under 1 roof",
        features: [
            "Aggregates 20+ underlying DSPs (DV360, TTD, Amazon)",
            "Direct YouTube buying capability",
            "Brand safety by DoubleVerify & IAS",
            "Cross-channel (CTV + Mobile + Audio)",
            "No long-term contracts"
        ]
    },
    {
        name: "Gamoshi (Quick Launch)",
        tagline: "Fast-deploy white-label DSP focused on OTT & Smart TV",
        monthlyFeeINR: 200000, // ₹2 Lakhs / mo
        revSharePercent: 4,
        setupTime: "3-5 Days",
        bestFor: "Leaner Indian agencies seeking rapid CTV market entry",
        features: [
            "Roku, Samsung, Apple TV & Tizen templates",
            "Flexible sub-agency tiering",
            "PMP Deal ID manager",
            "Contextual & cookieless targeting"
        ]
    }
];

/**
 * Calculates ROI and cost comparison between Rev-Share and Flat Subscription in INR
 * @param {number} monthlySpendINR 
 * @param {number} qpsTier 
 * @returns {object}
 */
function calculateROI(monthlySpendINR, qpsTier = 25000) {
    // Standard DSP Rev-Share fee in India: ~12% average on gross ad spend
    const revShareRate = 0.12;
    const revShareCost = monthlySpendINR * revShareRate;

    // Infrastructure estimated cloud cost based on QPS
    // ₹40,000 to ₹1,500,000 depending on volume
    const estimatedMonthlyRequests = qpsTier * 60 * 60 * 24 * 30;
    const infraCost = Math.min(200000, Math.round((estimatedMonthlyRequests / 100000000) * 12500));

    // Typical White-label fixed subscription base cost in India (₹3.5 Lakhs/mo)
    const subscriptionBaseFee = 350000;
    const totalSubscriptionCost = subscriptionBaseFee + infraCost;

    const netMonthlySavings = revShareCost - totalSubscriptionCost;
    const savingsPercentage = Math.max(0, Math.round((netMonthlySavings / revShareCost) * 100));

    return {
        monthlySpendINR,
        revShareCost,
        revShareRatePercent: revShareRate * 100,
        subscriptionBaseFee,
        infraCost,
        totalSubscriptionCost,
        netMonthlySavings,
        savingsPercentage,
        isSubscriptionBetter: netMonthlySavings > 0
    };
}
