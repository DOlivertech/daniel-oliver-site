import tracksData from '../data/tracks.json';

export interface Track {
  id: string;
  name: string;
  country: string;
  flag: string;
  iso: string;
  viewBox?: string;
  path?: string;
}

export const tracks = tracksData as Track[];

/** Resolve an event's track record by id (null if unset/unknown). */
export const trackById = (id?: string | null): Track | null =>
  id ? tracks.find((t) => t.id === id) ?? null : null;
