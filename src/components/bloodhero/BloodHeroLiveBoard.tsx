"use client";

import { useEffect, useRef, useState } from "react";
import { BloodHeroWardTiles } from "@/components/bloodhero/BloodHeroWardTiles";
import { BloodHeroNumberTicker } from "@/components/bloodhero/BloodHeroNumberTicker";
import {
  BLOOD_GROUPS,
  fetchPublicRequests,
  fetchPublicStats,
  type BloodGroup,
  type PublicRequest,
  type PublicStats,
} from "@/lib/bloodhero/public-board";

const POLL_MS = 25_000;
const RIPPLE_MS = 900;

function tallyByGroup(requests: PublicRequest[]): Record<BloodGroup, number> {
  const tally = Object.fromEntries(BLOOD_GROUPS.map((g) => [g, 0])) as Record<BloodGroup, number>;
  for (const r of requests) tally[r.blood_group] += r.request_quantity;
  return tally;
}

/**
 * Client-side polling wrapper around the ward board + stat line.
 * Server renders the initial values (SEO, no-JS); this re-fetches the same public,
 * PII-free view every 25s and animates whatever actually changed.
 */
export function BloodHeroLiveBoard({
  initialRequests,
  initialStats,
}: {
  initialRequests: PublicRequest[];
  initialStats: PublicStats | null;
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [stats, setStats] = useState(initialStats);
  const [rippling, setRippling] = useState<Set<BloodGroup>>(new Set());
  const tallyRef = useRef(tallyByGroup(initialRequests));

  useEffect(() => {
    let cancelled = false;
    const id = window.setInterval(async () => {
      const [nextRequests, nextStats] = await Promise.all([fetchPublicRequests(), fetchPublicStats()]);
      if (cancelled) return;

      const nextTally = tallyByGroup(nextRequests);
      const changed = BLOOD_GROUPS.filter((g) => nextTally[g] !== tallyRef.current[g]);
      tallyRef.current = nextTally;

      if (changed.length > 0) {
        setRippling(new Set(changed));
        window.setTimeout(() => {
          if (!cancelled) setRippling(new Set());
        }, RIPPLE_MS);
      }

      setRequests(nextRequests);
      setStats(nextStats);
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div className="mt-3">
      {stats ? (
        <p className="text-sm text-(--bh-ink-soft) tabular-nums">
          <BloodHeroNumberTicker value={stats.active_donors} /> donors ready ·{" "}
          <BloodHeroNumberTicker value={stats.open_requests} /> open ·{" "}
          <BloodHeroNumberTicker value={stats.fulfilled_requests} /> fulfilled
        </p>
      ) : null}
      <div className="mt-5">
        <BloodHeroWardTiles requests={requests} ripplingGroups={rippling} />
      </div>
    </div>
  );
}
