import React from 'react';

const LibrarySkeleton = () => (
  <div className="p-5 pt-8 max-w-4xl mx-auto pb-24">
    {/* Header */}
    <div className="text-center mb-4 flex flex-col items-center gap-2">
      <div className="h-6 w-40 rounded-md bg-white/10 animate-pulse" />
      <div className="h-3 w-72 rounded-md bg-white/10 animate-pulse" />
    </div>

    {/* Filter card */}
    <div className="glass-card p-4 mb-4">
      <div className="space-y-3">
        {/* Search + sort row */}
        <div className="flex gap-3">
          <div className="flex-1 h-10 rounded-xl bg-white/10 animate-pulse" />
          <div className="w-11 h-10 rounded-xl bg-white/10 animate-pulse flex-shrink-0" />
        </div>
        {/* Dropdowns row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="h-10 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-10 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-10 rounded-2xl bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>

    {/* Count line */}
    <div className="h-3 w-40 rounded bg-white/10 animate-pulse mb-3" />

    {/* Material cards */}
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="glass-card p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 rounded bg-white/10 animate-pulse" style={{ width: `${[70, 55, 80, 60, 75][i]}%` }} />
            <div className="h-3 rounded bg-white/10 animate-pulse" style={{ width: `${[45, 40, 50, 42, 48][i]}%` }} />
            <div className="h-2.5 rounded bg-white/10 animate-pulse" style={{ width: `${[30, 25, 35, 28, 32][i]}%` }} />
          </div>
          <div className="w-7 h-7 rounded-md bg-white/10 animate-pulse flex-shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

export default LibrarySkeleton;
