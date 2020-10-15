'use strict';

import * as vscode from 'vscode';

import { notifyIfGeneratedFileOnSave } from './check';

export function activate(ctx: vscode.ExtensionContext) {
	vscode.workspace.onDidSaveTextDocument(notifyIfGeneratedFileOnSave, null, ctx.subscriptions);
}

export function deactivate() { }
