#!/usr/bin/env node
/**
 * Every JSON file the package ships must be importable.
 *
 * `files` decides what goes into the tarball; `exports` decides what a consumer
 * may import. A file in the first and not the second ships but cannot be read:
 * `import "@tracepass/dpp-schemas/units.json"` fails with
 * ERR_PACKAGE_PATH_NOT_EXPORTED. This resolves each shipped JSON file through
 * Node's own resolver, by the package's self-reference, exactly as a consumer
 * would, and fails on any that does not resolve to itself.
 *
 * Usage: node scripts/check-exports.mjs [packageDir]
 */
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * The shipped JSON files that a consumer cannot import.
 * @param {string} dir The package directory.
 * @returns {string[]} Paths relative to the package, e.g. `units.json`.
 */
export function unexportedJson(dir) {
	const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
	const shipped = [];
	for (const entry of pkg.files ?? []) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) {
			for (const name of readdirSync(path)) if (name.endsWith('.json')) shipped.push(`${entry}/${name}`);
		} else if (entry.endsWith('.json')) {
			shipped.push(entry);
		}
	}
	const require = createRequire(join(dir, 'package.json'));
	const main = typeof pkg.exports === 'object' ? pkg.exports['.'] : pkg.exports;
	return shipped.filter((file) => {
		if (main === `./${file}`) return false; // reachable as the package root
		try {
			return require.resolve(`${pkg.name}/${file}`) !== resolve(dir, file);
		} catch {
			return true;
		}
	});
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const missing = unexportedJson(resolve(process.argv[2] ?? '.'));
	if (missing.length) {
		console.error(`Shipped but not importable (add to "exports" in package.json):\n  ${missing.join('\n  ')}`);
		process.exit(1);
	}
	console.log('check:exports — every shipped JSON file is importable');
}
