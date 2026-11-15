import { expect, test } from 'vitest';
import { afterBlock, blockFor, maxBlocks, nextUnit, passes, startIndex, startSearch, testableUnits, type PlacementItem } from '../src/lib/placement';
import bank from '../content/placement.json';

/** Runs the test for a learner who passes exactly the first `knows` units. */
function place(unitCount: number, knows: number) {
  let s = startSearch(unitCount);
  const asked: number[] = [];
  for (let unit = nextUnit(s); unit !== null; unit = nextUnit(s)) {
    asked.push(unit);
    s = afterBlock(s, unit < knows);
  }
  return { start: startIndex(s, unitCount), asked };
}

test.each([1, 6, 10, 31])('a learner who knows the first N of %i units starts at unit N+1', (unitCount) => {
  for (let knows = 0; knows <= unitCount; knows++) {
    const { start, asked } = place(unitCount, knows);
    // knowing every unit still starts at the last one
    expect(start).toBe(Math.min(knows, unitCount - 1));
    expect(asked.length).toBeLessThanOrEqual(maxBlocks(unitCount));
    expect(new Set(asked).size).toBe(asked.length);
  }
});

test('the full course of 31 units never takes more than 5 blocks', () => {
  expect(maxBlocks(31)).toBe(5);
});

test('two of three right passes a block', () => {
  expect([0, 1, 2, 3].map(passes)).toEqual([false, false, true, true]);
});

test('only units with a full block are tested', () => {
  const item = (unit: string) => ({ unit }) as PlacementItem;
  const items = [item('u02'), item('u01'), item('u01'), item('u02'), item('u01'), item('u03'), item('u02'), item('u01')];
  expect(testableUnits(items)).toEqual(['u01', 'u02']);
  expect(blockFor(items, 'u01')).toHaveLength(3);
});

test('the real bank has a block for every unit it mentions', () => {
  const items = bank as PlacementItem[];
  expect(testableUnits(items)).toEqual([...new Set(items.map((i) => i.unit))].sort());
});
