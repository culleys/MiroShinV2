'use client';

import { useEffect } from 'react';

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  className?: string;
}

export default function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  className = 'my-4',
}: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden flex justify-center bg-zinc-900/30 min-h-[100px] items-center text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-lg ${className}`}>
      {/* Placeholder text for development/preview */}
      <span className="absolute z-0 pointer-events-none">Advertisement Space</span>
      
      <ins
        className="adsbygoogle relative z-10 w-full"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
