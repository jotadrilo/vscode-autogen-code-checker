import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main() {
	// The folder containing the Extension Manifest package.json
	// Passed to `--extensionDevelopmentPath`
	const extensionDevelopmentPath = path.resolve(__dirname, '../../');

	try {
		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './integration/index');

		// Download VS Code, unzip it and run the integration test
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: ['--disable-extensions'],  // disable all other extensions
		});
	} catch (err) {
		console.error('Failed to run integration tests: ' + err);
		process.exit(1);
	}
}

main();
