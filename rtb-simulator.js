/**
 * OpenRTB 2.5 Connected TV Bidder & Auction Simulator (Indian Market - ₹ INR)
 * Simulates high-volume live RTB environment, processing bid requests
 * against active DSP campaigns in Rupees.
 */

class CTBRTBSimulator {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.campaigns = [];
        this.logCallback = null;
        this.statsCallback = null;
        
        // Internal tracking counters
        this.stats = {
            totalRequests: 0,
            bidsPlaced: 0,
            bidsWon: 0,
            totalSpendINR: 0,
            impressions: 0,
            vastStarts: 0,
            vast25: 0,
            vast50: 0,
            vast75: 0,
            vast100: 0,
            byPublisher: {
                "Amagi ADS PLUS": { requests: 0, bids: 0, wins: 0, spend: 0 },
                "Samsung Ads India": { requests: 0, bids: 0, wins: 0, spend: 0 },
                "LG Channels India": { requests: 0, bids: 0, wins: 0, spend: 0 },
                "Xiaomi PatchWall": { requests: 0, bids: 0, wins: 0, spend: 0 },
                "Disney+ Hotstar Exchange": { requests: 0, bids: 0, wins: 0, spend: 0 }
            },
            byDevice: {
                "Samsung Tizen TV": 0,
                "LG webOS TV": 0,
                "Android TV (Sony/Vu)": 0,
                "Fire TV Stick": 0,
                "Apple TV 4K": 0
            }
        };

        // Indian Cities for geotargeting
        this.indianCities = [
            { city: "Mumbai", region: "MH" },
            { city: "Delhi NCR", region: "DL" },
            { city: "Bengaluru", region: "KA" },
            { city: "Chennai", region: "TN" },
            { city: "Hyderabad", region: "TG" },
            { city: "Kolkata", region: "WB" },
            { city: "Pune", region: "MH" },
            { city: "Ahmedabad", region: "GJ" }
        ];

        // Indian CTV Video content channels
        this.ctvChannels = [
            { name: "JioCinema Sports Live", category: "Sports" },
            { name: "Amagi Food & Travel", category: "Lifestyle" },
            { name: "Samsung TV Plus Movies", category: "Entertainment" },
            { name: "LG Channels Music & Hits", category: "Music" },
            { name: "NDTV India Live", category: "News" },
            { name: "SonyLIV Special HD", category: "Entertainment" }
        ];
    }

    setCampaigns(campaigns) {
        this.campaigns = campaigns;
    }

    onLog(callback) {
        this.logCallback = callback;
    }

    onStatsUpdate(callback) {
        this.statsCallback = callback;
    }

    start(speedMs = 1500) {
        if (this.isRunning) return;
        this.isRunning = true;
        this.log("RTB Engine Bidder start ho gaya - Listening on Port 8080...", "system");
        this.log("Amagi ADS PLUS, Samsung Ads, aur LG Channels se connect ho gaya.", "system");
        
        this.intervalId = setInterval(() => {
            this.processAuction();
        }, speedMs);
    }

    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.intervalId);
        this.log("RTB Engine Bidder pause kar diya gaya.", "system");
    }

    log(message, type = "info", details = null) {
        if (this.logCallback) {
            this.logCallback({
                timestamp: new Date().toLocaleTimeString('en-IN'),
                message,
                type,
                details
            });
        }
    }

    generateBidRequest() {
        const publishers = Object.keys(this.stats.byPublisher);
        const publisher = publishers[Math.floor(Math.random() * publishers.length)];
        
        const deviceBrands = [
            { brand: "Samsung", os: "Samsung Tizen TV", w: 1920, h: 1080 },
            { brand: "LG", os: "LG webOS TV", w: 1920, h: 1080 },
            { brand: "Sony Bravia", os: "Android TV (Sony/Vu)", w: 3840, h: 2160 },
            { brand: "Xiaomi", os: "Android TV (Sony/Vu)", w: 1920, h: 1080 },
            { brand: "Amazon FireTV", os: "Fire TV Stick", w: 1920, h: 1080 },
            { brand: "Apple TV", os: "Apple TV 4K", w: 3840, h: 2160 }
        ];
        const device = deviceBrands[Math.floor(Math.random() * deviceBrands.length)];
        const geo = this.indianCities[Math.floor(Math.random() * this.indianCities.length)];
        const channel = this.ctvChannels[Math.floor(Math.random() * this.ctvChannels.length)];
        
        const reqId = "br-in-" + Math.random().toString(36).substring(2, 12);
        const impId = "imp-1";
        // Indian CTV Floor prices range from ₹350 to ₹650 eCPM
        const floorPrice = +(Math.random() * 300 + 350).toFixed(2); 

        // OpenRTB 2.5 format for CTV Video
        const openRtbReq = {
            id: reqId,
            imp: [{
                id: impId,
                video: {
                    mimes: ["video/mp4", "video/webm"],
                    minduration: 5,
                    maxduration: 30,
                    protocols: [2, 3, 5, 6],
                    w: device.w,
                    h: device.h,
                    startdelay: 0,
                    linearity: 1,
                    skip: 0,
                    delivery: [3],
                    api: [1, 2]
                },
                bidfloor: floorPrice,
                bidfloorcur: "INR",
                secure: 1
            }],
            app: {
                name: channel.name,
                bundle: `in.ctv.${channel.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
                domain: "streaming.in",
                publisher: {
                    id: `pub-${publisher.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
                    name: publisher
                }
            },
            device: {
                ua: "Mozilla/5.0 (SmartTV; India) AppleWebKit/537.36",
                ip: `49.${Math.floor(Math.random() * 200) + 1}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`,
                geo: {
                    country: "IND",
                    region: geo.region,
                    city: geo.city
                },
                make: device.brand,
                model: device.os,
                devicetype: 3 // Connected TV
            },
            user: {
                id: "ctv-user-" + Math.random().toString(36).substring(2, 8)
            },
            tmax: 120
        };

        return { openRtbReq, publisher, device, geo, channel };
    }

    processAuction() {
        this.stats.totalRequests++;
        const { openRtbReq, publisher, device, geo, channel } = this.generateBidRequest();
        
        this.stats.byPublisher[publisher].requests++;
        this.stats.byDevice[device.os]++;

        const logDetails = {
            publisher,
            device: `${device.brand} (${device.os})`,
            geo: `${geo.city}, India`,
            channel: channel.name,
            floor: `₹${openRtbReq.imp[0].bidfloor} eCPM`,
            reqJson: JSON.stringify(openRtbReq, null, 2)
        };

        this.log(`Smart TV se Bid Request aayi [${publisher}] -> Channel: [${channel.name}] (${device.brand}, ${geo.city})`, "request", logDetails);

        // Find matching campaigns
        const activeCampaigns = this.campaigns.filter(c => c.status === "active");
        if (activeCampaigns.length === 0) {
            this.log(`Bidding skip: Koi active campaign nahi mila.`, "warning");
            if (this.statsCallback) this.statsCallback(this.stats);
            return;
        }

        let bestCampaign = null;
        let highestScore = -1;
        let bidPrice = 0;

        for (const camp of activeCampaigns) {
            let matches = true;

            if (camp.spend >= camp.budget) {
                matches = false;
                continue;
            }

            if (camp.publishers && camp.publishers.length > 0) {
                if (!camp.publishers.includes(publisher)) {
                    matches = false;
                    continue;
                }
            }

            if (camp.geo && camp.geo !== "Pan-India") {
                if (camp.geo !== geo.city) {
                    matches = false;
                    continue;
                }
            }

            const floor = openRtbReq.imp[0].bidfloor;
            if (camp.cpm < floor) {
                matches = false;
                continue;
            }

            if (matches) {
                const score = camp.cpm - floor;
                if (score > highestScore) {
                    highestScore = score;
                    bestCampaign = camp;
                    bidPrice = Math.min(camp.cpm, floor + (score * 0.5) + Math.random() * 20);
                    bidPrice = +bidPrice.toFixed(2);
                }
            }
        }

        if (!bestCampaign) {
            this.log(`Bid nahi lagayi: Campaign targeting ya Floor price (₹${openRtbReq.imp[0].bidfloor}) match nahi hua.`, "nobid");
            if (this.statsCallback) this.statsCallback(this.stats);
            return;
        }

        this.stats.bidsPlaced++;
        this.stats.byPublisher[publisher].bids++;
        
        const bidId = "bid-in-" + Math.random().toString(36).substring(2, 10);
        const vastXml = `<VAST version="4.2">
  <Ad id="${bestCampaign.id}">
    <InLine>
      <AdSystem>WL-RTB-India-Engine</AdSystem>
      <AdTitle>${bestCampaign.name}</AdTitle>
      <Impression><![CDATA[https://rtb-dsp.in/track/imp?bid=${bidId}]]></Impression>
      <Creatives>
        <Creative id="cr-1">
          <Linear>
            <Duration>00:00:15</Duration>
            <MediaFiles>
              <MediaFile delivery="progressive" type="video/mp4" width="1920" height="1080">
                <![CDATA[${bestCampaign.creativeUrl || "https://assets.mixkit.co/videos/preview/mixkit-car-driving-in-neon-city-43184-large.mp4"}]]>
              </MediaFile>
            </MediaFiles>
          </Linear>
        </Creative>
      </Creatives>
    </InLine>
  </Ad>
</VAST>`;

        const openRtbResp = {
            id: openRtbReq.id,
            seatbid: [{
                bid: [{
                    id: bidId,
                    impid: openRtbReq.imp[0].id,
                    price: bidPrice,
                    adid: bestCampaign.id.toString(),
                    nurl: `https://rtb-dsp.in/track/win?price=\${AUCTION_PRICE}`,
                    adm: vastXml,
                    cid: bestCampaign.id.toString()
                }],
                seat: "WL-INDIA-DSP"
            }],
            cur: "INR"
        };

        const bidLogDetails = {
            campaignName: bestCampaign.name,
            cpmBid: `₹${bidPrice} eCPM`,
            targetCpm: `₹${bestCampaign.cpm}`,
            floorPrice: `₹${openRtbReq.imp[0].bidfloor}`,
            respJson: JSON.stringify(openRtbResp, null, 2)
        };

        this.log(`✅ Bid Lagayi: ₹${bidPrice} eCPM for [${bestCampaign.name}] (Floor: ₹${openRtbReq.imp[0].bidfloor})`, "bid", bidLogDetails);

        const margin = bidPrice - openRtbReq.imp[0].bidfloor;
        const winProbability = margin > (openRtbReq.imp[0].bidfloor * 0.1) ? 0.80 : 0.45;
        
        setTimeout(() => {
            if (Math.random() < winProbability) {
                this.simulateWin(bestCampaign, bidPrice, publisher, bidId);
            } else {
                this.log(`❌ Auction lost: Kisi aur DSP ne zyada bol lagayi.`, "loss");
                if (this.statsCallback) this.statsCallback(this.stats);
            }
        }, 120);
    }

    simulateWin(campaign, bidPrice, publisher, bidId) {
        this.stats.bidsWon++;
        this.stats.impressions++;
        this.stats.byPublisher[publisher].wins++;
        
        // Dynamic CPM charge simulation in INR
        // Spend = BidPrice / 1000
        const cost = bidPrice / 1000;
        this.stats.totalSpendINR += cost;
        this.stats.byPublisher[publisher].spend += cost;
        
        campaign.spend = +(campaign.spend + cost).toFixed(2);
        campaign.impressions = (campaign.impressions || 0) + 1;

        this.log(`🏆 Auction JEET GAYE! Dynamic Charge: ₹${bidPrice} eCPM. Smart TV par ad start hua.`, "win");

        this.stats.vastStarts++;
        campaign.starts = (campaign.starts || 0) + 1;

        setTimeout(() => {
            this.stats.vast25++;
            campaign.q1 = (campaign.q1 || 0) + 1;
            
            setTimeout(() => {
                this.stats.vast50++;
                campaign.q2 = (campaign.q2 || 0) + 1;
                
                setTimeout(() => {
                    this.stats.vast75++;
                    campaign.q3 = (campaign.q3 || 0) + 1;
                    
                    setTimeout(() => {
                        if (Math.random() < 0.92) {
                            this.stats.vast100++;
                            campaign.q4 = (campaign.q4 || 0) + 1;
                            this.log(`🎬 [VAST Event] 100% Video Finish - Customer ne poora ad dekha! (${campaign.name})`, "complete-ad");
                        }
                        if (this.statsCallback) this.statsCallback(this.stats);
                    }, 800);
                }, 800);
            }, 800);
        }, 800);

        if (this.statsCallback) this.statsCallback(this.stats);
    }
}
