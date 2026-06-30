import type { Database } from '@sqlite.org/sqlite-wasm';
import type { Network } from '$lib/domain/types';
import { selectAll } from '../sqlHelpers';

/** All networks present in the feed, from `networks.txt`.
 *  Returns an empty array for feeds that pre-date networks.txt support. */
export function getNetworks(db: Database): Network[] {
  const tables = selectAll<{ name: string }>(
    db,
    `SELECT name FROM sqlite_master WHERE type='table' AND name='networks';`,
  );
  if (tables.length === 0) return [];
  return selectAll<Network>(
    db,
    `SELECT network_id AS id, network_name AS name FROM networks ORDER BY network_id;`,
  );
}
