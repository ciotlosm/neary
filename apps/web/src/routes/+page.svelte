<!--
  Stations — the default landing route. Until a feed is selected, shows
  an empty state pointing to Settings. With a feed selected, fetches the
  nearest stops (GPS or default location) and renders a StationCard list
  with the bucketed arrivals board for each.

  Side effect: starts the location watch on mount so the header's GPS dot
  lights up immediately (any other route doesn't need GPS so the prompt
  doesn't appear until you've at least visited /).
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Bus, MapPin, Settings } from 'lucide-svelte';
  import {
    Box, Button, Card, CardContent, Spinner, Stack, StationCard, Typography,
  } from '$lib/ui';
  import { getGtfsRepo } from '$lib/data/gtfs/repo';
  import type { StopWithDistance } from '$lib/data/gtfs/types';
  import {
    bucketOf, compareForBoard, filterForStationView, type ArrivalBucket,
  } from '$lib/domain/buckets';
  import type { Route, Vehicle } from '$lib/domain/types';
  import { locationStore } from '$lib/stores/locationStore.svelte';
  import { userPrefs } from '$lib/stores/userPrefs.svelte';

  // Demo fallback location when GPS is unavailable or denied: Piața Mihai
  // Viteazul, central Cluj. Lets the page work in dev / offline / before
  // the location prompt is accepted.
  const FALLBACK_LAT = 46.7712;
  const FALLBACK_LON = 23.6236;
  const SEARCH_RADIUS_M = 500;
  const MAX_STATIONS = 8;
  const ARRIVALS_WINDOW_MIN = 60;

  onMount(() => {
    locationStore.start();
  });

  const hasGps = $derived(locationStore.position != null);
  const queryLat = $derived(locationStore.position?.coords.latitude ?? FALLBACK_LAT);
  const queryLon = $derived(locationStore.position?.coords.longitude ?? FALLBACK_LON);

  let stops = $state<StopWithDistance[] | null>(null);
  let stopsError = $state<string | null>(null);
  let arrivalsByStop = $state<Record<number, Vehicle[]>>({});
  let expandedStopId = $state<number | null>(null);

  // Re-tick every minute so ETAs and buckets stay current without
  // re-fetching from SQLite.
  let nowMs = $state(Date.now());
  $effect(() => {
    const t = setInterval(() => (nowMs = Date.now()), 30_000);
    return () => clearInterval(t);
  });

  // Round the query lat/lon so jitter doesn't refire the effect.
  const queryLatRounded = $derived(Math.round(queryLat * 1e4) / 1e4);
  const queryLonRounded = $derived(Math.round(queryLon * 1e4) / 1e4);

  $effect(() => {
    const fid = userPrefs.feedId;
    if (!fid) return;
    const lat = queryLatRounded;
    const lon = queryLonRounded;
    (async () => {
      try {
        const repo = getGtfsRepo();
        await repo.ready();
        const ss = await repo.getStopsNear(lat, lon, SEARCH_RADIUS_M, MAX_STATIONS);
        stops = ss;
        stopsError = null;
        const next: Record<number, Vehicle[]> = {};
        for (const s of ss) {
          next[s.id] = await repo.getStationArrivals(s.id, Date.now(), ARRIVALS_WINDOW_MIN);
        }
        arrivalsByStop = next;
      } catch (e) {
        stopsError = e instanceof Error ? e.message : String(e);
      }
    })();
  });

  function nowMinSinceMidnight(ts: number) {
    const d = new Date(ts);
    return d.getHours() * 60 + d.getMinutes();
  }

  type ArrivalRow = { vehicle: Vehicle; bucket: ArrivalBucket; etaMinutes: number };

  function processArrivals(vehicles: Vehicle[]): ArrivalRow[] {
    const nowMin = nowMinSinceMidnight(nowMs);
    const items: ArrivalRow[] = vehicles.map((v) => ({
      vehicle: v,
      bucket: bucketOf(v.kind, {
        etaMinutes: v.eta?.minutes ?? 0,
        distanceToStopMeters: 0,
        scheduledArrivalMin: v.schedule?.scheduledArrival,
        scheduledDepartureMin: v.schedule?.scheduledDeparture,
        nowMin,
      }),
      etaMinutes: v.eta?.minutes ?? 0,
    }));
    return filterForStationView(items, {
      showDepartedVehicles: userPrefs.showDepartedVehicles,
      showDropOffOnly: userPrefs.showDropOffOnly,
      showScheduleOnlyVehicles: userPrefs.showScheduleOnlyVehicles,
    }).sort(compareForBoard);
  }

  function routesAtStop(vehicles: Vehicle[]): Route[] {
    const map = new Map<number, Route>();
    for (const v of vehicles) map.set(v.route.id, v.route);
    return Array.from(map.values()).sort((a, b) => {
      const an = Number(a.shortName);
      const bn = Number(b.shortName);
      if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return an - bn;
      return a.shortName.localeCompare(b.shortName);
    });
  }
</script>

<div class="mx-auto max-w-3xl px-4 py-6">
  {#if userPrefs.feedId == null}
    <Card class="text-center">
      <CardContent>
        <Stack spacing={2} align="center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)]">
            <Bus size={24} />
          </div>
          <Typography variant="h4">Select your transit feed</Typography>
          <Typography variant="body2" class="max-w-prose text-[color:var(--color-fg-muted)]">
            Neary needs a transit feed to load schedules and routes. Pick
            one in Settings to get started. The data downloads once and is
            cached for offline use — no account needed.
          </Typography>
          {#snippet settingsIcon()}<Settings size={16} />{/snippet}
          <Button startIcon={settingsIcon} onclick={() => goto('/settings')}>
            Open Settings
          </Button>
        </Stack>
      </CardContent>
    </Card>
  {:else if stopsError}
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6" class="text-[color:var(--color-danger)]">Failed to load nearby stations</Typography>
          <Typography variant="caption">{stopsError}</Typography>
        </Stack>
      </CardContent>
    </Card>
  {:else if !stops}
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} align="center">
          <Spinner size={16} />
          <Typography variant="caption">Loading nearby stations…</Typography>
        </Stack>
      </CardContent>
    </Card>
  {:else if stops.length === 0}
    <Card>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="h6">No nearby stations</Typography>
          <Typography variant="caption">
            No stops within {SEARCH_RADIUS_M} m of {hasGps ? 'your current position' : 'the fallback location'}.
            Try moving closer to a transit corridor or enabling location.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  {:else}
    <Stack spacing={1}>
      {#if !hasGps}
        <Box class="px-2 py-1 text-xs text-[color:var(--color-fg-muted)]">
          <Stack direction="row" spacing={1} align="center">
            <MapPin size={12} />
            <span>No GPS — showing stations near a fallback location ({FALLBACK_LAT}, {FALLBACK_LON}).</span>
          </Stack>
        </Box>
      {/if}
      {#each stops as stop (stop.id)}
        {@const allArrivals = arrivalsByStop[stop.id] ?? []}
        {@const processed = processArrivals(allArrivals)}
        <StationCard
          station={{ id: stop.id, name: stop.name, distance: stop.distance, lat: stop.lat, lon: stop.lon }}
          routes={routesAtStop(allArrivals)}
          vehicles={processed.map((p) => p.vehicle)}
          expanded={expandedStopId === stop.id}
          ontoggle={() => (expandedStopId = expandedStopId === stop.id ? null : stop.id)}
        />
      {/each}
    </Stack>
  {/if}
</div>
