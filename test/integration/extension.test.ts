'use strict';

import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, ms)
	});
}

suite('Extension Tests', function () {
	this.timeout(15000);

	let testdataPath: string;

	suiteSetup(async () => {
		const testdataSourcePath: string = path.join(__dirname, '..', '..', '..', 'test', 'integration', 'testdata');
		testdataPath = path.join(__dirname, 'testdata');

		fs.removeSync(testdataPath);
		fs.copySync(testdataSourcePath, testdataPath);
	});

	suiteTeardown(() => {
		fs.removeSync(testdataPath);
	});

	teardown(() => {
		sinon.restore();
	});

	// Helper functions
	async function getEditorWithFile(p: string): Promise<vscode.TextEditor> {
		const uri = vscode.Uri.file(path.join(testdataPath, p));
		const document = await vscode.workspace.openTextDocument(uri);
		const editor = await vscode.window.showTextDocument(document);
		await sleep(500);
		return editor;
	}

	async function assertFileShowsErrorsOnEditAndSave(p: string, n: number) {
		const editor = await getEditorWithFile(p);
		const spy = sinon.spy(vscode.window, 'showErrorMessage');
		await editor.edit((e: vscode.TextEditorEdit) => { e.insert(new vscode.Position(1, 0), 'foo'); });
		await editor.document.save().then(() => {
			const msg: string = 'should have shown ' + n + ' error message' + (n>1 ? 's' : '');
			assert.strictEqual(spy.callCount, n, msg);
		});
	}

	async function assertFileDoesNotShowErrorsOnEditAndSave(p: string) {
		const editor = await getEditorWithFile(p);
		const spy = sinon.spy(vscode.window, 'showErrorMessage');
		await editor.edit((e: vscode.TextEditorEdit) => { e.insert(new vscode.Position(1, 0), 'foo'); });
		await editor.document.save().then(() => {
			assert.strictEqual(spy.callCount, 0, 'should have not shown error messages');
		});
	}

	// Tests
	test('should not show an error message when saving an empty file', async () => {
		await assertFileDoesNotShowErrorsOnEditAndSave('empty.json');
	});

	test('should show an error message when saving a file with a generated filename', async () => {
		await assertFileShowsErrorsOnEditAndSave('generated.empty.json', 1);
	});

	test('should show an error message when saving a file with a generated header', async () => {
		await assertFileShowsErrorsOnEditAndSave('foo.pb.go', 1);
	});
});
