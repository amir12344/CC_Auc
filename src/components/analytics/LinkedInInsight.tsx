"use client";

import Script from "next/script";

export const LinkedInInsight = () => (
 <>
  <Script id="linkedin-insight-tag" strategy="afterInteractive">
   {`
            _linkedin_partner_id = "7173748";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}
  </Script>
  <noscript>
   <img height="1" width="1" className="hidden" alt="" src="https://px.ads.linkedin.com/collect/?pid=7173748&fmt=gif" />
  </noscript>
 </>
);
