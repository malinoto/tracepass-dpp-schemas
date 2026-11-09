import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unexportedJson } from './check-exports.mjs';

/** A throwaway package with the given exports, shipping a root file and a folder. */
function plant(exports) {
	const dir = mkdtempSync(join(tmpdir(), 'check-exports-'));
	mkdirSync(join(dir, 'guidance'));
	for (const file of ['index.json', 'units.json', 'guidance/a.json']) writeFileSync(join(dir, file), '{}');
	writeFileSync(
		join(dir, 'package.json'),
		JSON.stringify({ name: '@planted/pkg', exports, files: ['index.json', 'units.json', 'guidance', 'README.md'] }),
	);
	writeFileSync(join(dir, 'README.md'), '');
	return dir;
}

test('reports shipped JSON that exports does not reach', () => {
	assert.deepEqual(unexportedJson(plant({ '.': './index.json' })), ['units.json', 'guidance/a.json']);
});

test('accepts exact and pattern exports, and the root entry', () => {
	const dir = plant({ '.': './index.json', './units.json': './units.json', './guidance/*.json': './guidance/*.json' });
	assert.deepEqual(unexportedJson(dir), []);
});

test('reports an export that points at a different file', () => {
	const dir = plant({ '.': './index.json', './units.json': './index.json', './guidance/*.json': './guidance/*.json' });
	assert.deepEqual(unexportedJson(dir), ['units.json']);
});

test('the real package exports everything it ships', () => {
	assert.deepEqual(unexportedJson(join(import.meta.dirname, '..')), []);
});
