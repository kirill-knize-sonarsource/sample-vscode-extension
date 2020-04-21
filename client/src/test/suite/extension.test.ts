import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getDocumentSelector } from '../../extension';
import * as path from 'path';
// import * as myExtension from '../extension';

const sampleFolderLocation = '../../../../';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Document selector test', ()=>{
		var documentSelector = getDocumentSelector();
		assert.equal(documentSelector[0].language, '*');
		assert.equal(documentSelector[0].scheme, 'file');
	});

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('knize.sample'));
	});

	test('Should activate', function() {
		this.timeout(1 * 60 * 1000);
		var extension = vscode.extensions.getExtension('sample');
		
		return extension?.activate().then(api => {
			assert.ok(true);
		});
	});


	test('Document characters count', async function() {
		var file = path.join(__dirname, sampleFolderLocation, 'text.txt');
		console.log('FILE: ' + file);
		const fileUri = vscode.Uri.file(file);
		const document = await vscode.workspace.openTextDocument(fileUri);
		const editor = await vscode.window.showTextDocument(document);
		var diags = await waitForSonarLintDiagnostics(fileUri);
		console.log('DIAGS: ' + JSON.stringify(diags));
		assert.deepEqual(diags.length, 1);
		var isWin = false;
		if(process.platform == 'win32') {
			isWin = true;
		}
		let expectedResult = "Document characters count: 52."
		if(isWin) {
			expectedResult = "Document characters count: 54."
		}
		assert.equal(diags[0].message, expectedResult);

		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
	  }).timeout(60 * 1000);



});
	


async function waitForSonarLintDiagnostics(fileUri:vscode.Uri) {
    var diags = getSonarLintDiagnostics(fileUri);
    while (diags.length === 0) {
	  await sleep(2000);
	  console.log('WAITING DIAGS...');
      diags = getSonarLintDiagnostics(fileUri);
    }
    return diags;
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
}


function getSonarLintDiagnostics(fileUri: any) {
	var diags = vscode.languages.getDiagnostics(fileUri);
	console.log('DIAGS:' + JSON.stringify(diags));
	return diags;
}