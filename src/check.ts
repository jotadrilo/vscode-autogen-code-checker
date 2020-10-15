'use strict';

import * as vscode from 'vscode';
import * as path from 'path';

type Patterns = {
	filename: RegExp[],
	header: RegExp[],
};

function getPatterns(): Patterns {
	const filename: string[] = vscode.workspace.getConfiguration().get('autogencc.patterns.filename');
	const header: string[] = vscode.workspace.getConfiguration().get('autogencc.patterns.header');
	const patterns: Patterns = {
		filename: filename.map((p: string) => { return new RegExp(p); }),
		header: header.map((p: string) => { return new RegExp(p); }),
	};
	console.log('using filename: ', filename);
	console.log('using header: ', header);
	console.log('using patterns.filename: ', patterns.filename);
	console.log('using patterns.header: ', patterns.header);
	return patterns;
}

function isGeneratedTextDocument(d: vscode.TextDocument): boolean {
	// Skip on untitled documents 
	if (d.isUntitled === true) {
		return false;
	}

	const patterns: Patterns = getPatterns();
	const filename: string = path.basename(d.fileName);
	const header: string = d.lineAt(0).text;

	// reducer will reduce an array of `match` results to a single result.
	// This result will be non-null if at least one of the results matched
	// correctly.
	const reducer = function (prev: RegExpMatchArray | null, curr: RegExpMatchArray | null): RegExpMatchArray | null { return prev || curr; };

	// Is a generated file if:
	return (
		// - The file name matches any of the expected patterns.
		patterns.filename.map(re => filename.match(re)).reduce(reducer) !== null ||
		// - The header of the file matches any of the expected patterns.
		patterns.header.map(re => header.match(re)).reduce(reducer) !== null
	);
}

export async function notifyIfGeneratedFileOnSave(e: vscode.TextDocument) {
	if (isGeneratedTextDocument(e)) {
		await vscode.window.showErrorMessage('This file seems to be generated. DO NOT EDIT.');
	}
}
