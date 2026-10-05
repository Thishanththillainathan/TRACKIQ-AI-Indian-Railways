import React from 'react';

export default function TrainTrackHero() {
  return (
    <div className="relative overflow-hidden min-h-[380px] md:min-h-[460px] lg:min-h-[500px] w-full rounded-2xl border border-[#E2E4E0] shadow-sm bg-black select-none flex items-center justify-center">
      <video
        src="https://www.image2url.com/r2/default/videos/1788676503688-5b8b2d42-3e56-4339-8cbc-615fc4144a0d.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full min-h-[380px] md:min-h-[460px] lg:min-h-[500px] object-contain md:object-cover object-center rounded-2xl absolute inset-0"
      />
    </div>
  );
}
