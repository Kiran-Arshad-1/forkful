import React from 'react';

// ── Base shimmer block ────────────────────────────────────────────────────────
const Sb = ({ h = 'h-4', w = 'w-full', rounded = 'rounded-md', className = '' }) => (
  <div className={`shimmer ${h} ${w} ${rounded} ${className}`} />
);

// ── Shared card wrapper ───────────────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div
    className={`rounded-xl p-4 md:p-6 ${className}`}
    style={{ background: '#1B2A8B', border: '1px solid rgba(201,168,76,0.15)' }}
  >
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Business Profile skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const BusinessProfileSkeleton = () => (
  <div className="space-y-4 lg:space-y-6">
    {/* Business Info card */}
    <Card>
      <Sb h="h-5" w="w-40" className="mb-5" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Sb h="h-3" w="w-24" />
          <Sb h="h-10" />
        </div>
        <div className="space-y-2">
          <Sb h="h-3" w="w-24" />
          <Sb h="h-10" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Sb h="h-3" w="w-24" />
          <Sb h="h-20" />
        </div>
        <div className="space-y-2">
          <Sb h="h-3" w="w-24" />
          <Sb h="h-10" />
        </div>
        <div className="space-y-2">
          <Sb h="h-3" w="w-24" />
          <Sb h="h-10" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Sb h="h-3" w="w-24" />
          <Sb h="h-10" />
        </div>
      </div>
    </Card>

    {/* Map card */}
    <Card>
      <Sb h="h-5" w="w-32" className="mb-4" />
      <Sb h="h-56" rounded="rounded-lg" />
      <div className="flex gap-3 mt-3">
        <Sb h="h-9" w="w-32" rounded="rounded-lg" />
        <Sb h="h-9" w="w-32" rounded="rounded-lg" />
      </div>
    </Card>

    {/* Opening Hours card */}
    <Card>
      <Sb h="h-5" w="w-36" className="mb-5" />
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Sb h="h-4" w="w-24" />
            <Sb h="h-9" w="w-28" rounded="rounded-lg" />
            <Sb h="h-4" w="w-4" />
            <Sb h="h-9" w="w-28" rounded="rounded-lg" />
            <Sb h="h-7" w="w-20" rounded="rounded-full" className="ml-auto" />
          </div>
        ))}
      </div>
    </Card>

    {/* Contact Info card */}
    <Card>
      <Sb h="h-5" w="w-32" className="mb-5" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Sb h="h-3" w="w-20" />
            <Sb h="h-10" />
          </div>
        ))}
      </div>
    </Card>

    {/* Save button */}
    <div className="flex justify-end">
      <Sb h="h-10" w="w-32" rounded="rounded-lg" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Menu skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const MenuSkeleton = () => (
  <div className="w-full space-y-4 lg:space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Sb h="h-5" w="w-28" />
        <Sb h="h-3" w="w-40" />
      </div>
      <Sb h="h-10" w="w-28" rounded="rounded-lg" />
    </div>

    {/* Item rows */}
    <Card className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 py-3 border-b last:border-b-0" style={{ borderColor: 'rgba(155,164,232,0.1)' }}>
          <Sb h="h-14" w="w-14" rounded="rounded-xl" className="flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <Sb h="h-4" w="w-36" />
            <Sb h="h-3" w="w-56" />
            <Sb h="h-3" w="w-16" />
          </div>
          <div className="flex gap-2 pt-1">
            <Sb h="h-8" w="w-16" rounded="rounded-lg" />
            <Sb h="h-8" w="w-16" rounded="rounded-lg" />
          </div>
        </div>
      ))}
    </Card>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Reviews skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const ReviewsSkeleton = () => (
  <div className="space-y-4 lg:space-y-6">
    {/* Summary card */}
    <Card>
      <Sb h="h-5" w="w-40" className="mb-5" />
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex flex-col items-center gap-2 sm:w-32">
          <Sb h="h-14" w="w-20" rounded="rounded-xl" />
          <Sb h="h-4" w="w-28" rounded="rounded-full" />
          <Sb h="h-3" w="w-16" />
        </div>
        <div className="flex-1 space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Sb h="h-3" w="w-4" />
              <Sb h="h-2" rounded="rounded-full" className="flex-1" />
              <Sb h="h-3" w="w-5" />
            </div>
          ))}
        </div>
      </div>
    </Card>

    {/* Review cards */}
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <div className="flex items-start gap-3 mb-3">
          <Sb h="h-10" w="w-10" rounded="rounded-full" className="flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Sb h="h-4" w="w-32" />
            <Sb h="h-3" w="w-24" />
          </div>
          <Sb h="h-4" w="w-24" />
        </div>
        <div className="space-y-2 pl-13">
          <Sb h="h-3" />
          <Sb h="h-3" w="w-4/5" />
        </div>
      </Card>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Photos skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const PhotosSkeleton = () => (
  <div className="w-full space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Sb h="h-5" w="w-36" />
        <Sb h="h-3" w="w-52" />
      </div>
      <Sb h="h-10" w="w-32" rounded="rounded-lg" />
    </div>

    {/* Drop zone placeholder */}
    <Sb h="h-36" rounded="rounded-xl" />

    {/* Photo grid */}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ background: '#1B2A8B', border: '1px solid rgba(155,164,232,0.1)' }}>
          <div className="shimmer w-full" style={{ paddingBottom: '100%' }} />
          <div className="p-2 space-y-1.5">
            <Sb h="h-3" w="w-3/4" />
            <Sb h="h-5" w="w-24" rounded="rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
