import React from 'react';

const HomeSkeleton = () => (
  <div className="p-5 pt-10 max-w-md mx-auto">
    {/* Header */}
    <div className="text-center mb-10 flex flex-col items-center gap-2.5">
      <div className="w-16 h-16 rounded-full bg-white/10 animate-pulse" />
      <div className="h-7 w-48 rounded-md bg-white/10 animate-pulse" />
      <div className="h-3 w-64 rounded-md bg-white/10 animate-pulse" />
    </div>

    {/* Section label */}
    <div className="flex items-center gap-2 mb-4">
      <div className="w-3.5 h-3.5 rounded bg-white/10 animate-pulse" />
      <div className="h-2.5 w-28 rounded bg-white/10 animate-pulse" />
    </div>

    {/* Semester cards grid */}
    <div className="grid grid-cols-2 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-card p-4">
          <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse mb-3" />
          <div className="h-3.5 w-24 rounded bg-white/10 animate-pulse mb-2" />
          <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse mb-2" />
          <div className="h-5 w-14 rounded-full bg-white/10 animate-pulse" />
        </div>
      ))}
    </div>

    {/* Materials label */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded bg-white/10 animate-pulse" />
        <div className="h-2.5 w-20 rounded bg-white/10 animate-pulse" />
      </div>
      <div className="h-2.5 w-12 rounded bg-white/10 animate-pulse" />
    </div>

    {/* Material cards */}
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 rounded bg-white/10 animate-pulse w-3/4" />
            <div className="h-3 rounded bg-white/10 animate-pulse w-1/2" />
            <div className="h-2.5 rounded bg-white/10 animate-pulse w-1/3" />
          </div>
          <div className="w-7 h-7 rounded-md bg-white/10 animate-pulse flex-shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

export default HomeSkeleton;
