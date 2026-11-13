import type { Unit } from './types';

// One chunk per unit, fetched when the unit is opened.
const files = import.meta.glob<Unit>('../../content/u*.json', { import: 'default' });

export function loadUnit(id: string): Promise<Unit> {
  const file = files[`../../content/${id}.json`];
  if (!file) return Promise.reject(new Error(`Unknown unit ${id}`));
  return file();
}

// Every unit, in file-name order (u01, u02, ...).
export function loadAllUnits(): Promise<Unit[]> {
  return Promise.all(Object.keys(files).sort().map((k) => files[k]()));
}
