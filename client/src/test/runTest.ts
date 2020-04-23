import * as path from 'path';
import * as fs from 'fs';
import { instrument } from '../coverage';
import { runTests } from 'vscode-test';


async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
		console.log('Extension root path: ' + extensionDevelopmentPath);
		// The path to test runner
		// Passed to --extensionTestsPath
		var extensionTestsPath = path.resolve(__dirname, './suite/index');

		const packageJsonPath = path.resolve(extensionDevelopmentPath, 'package.json');
		const package_json = fs.readFileSync(packageJsonPath, 'utf8');
		var content = JSON.parse(package_json);

		var outPath;
		if (process.argv.indexOf('--coverage') >= 0) {
			// Override main file path
			console.log('Hello from IF.');
			content.main = 'out-cov/src/extension';
			console.log('Before instrument.');
			// generate instrumented files at out-cov
			instrument();
			console.log('After instrument.');
			// load the instrumented files
			outPath = path.resolve(extensionDevelopmentPath + '/client', 'out-cov');

			// signal that the coverage data should be gathered
			process.env['GENERATE_COVERAGE'] = '1';
		} else {
			console.log('Hello from ELSE.');
			// Override main file path
			content.main = 'out/src/extension';

			outPath = path.resolve(extensionDevelopmentPath + '/client', 'out');
		}

		extensionTestsPath = path.resolve(outPath, 'test/suite/index');
		console.log('Extension tests path: ' + extensionTestsPath);

		// Download VS Code, unzip it and run the integration test
		runTests({ extensionDevelopmentPath, extensionTestsPath })
			.catch(err => {
				console.error('Failed to run tests', err);
				process.exit(1);
			})
			.then(() => process.exit(0));
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
