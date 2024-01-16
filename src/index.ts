import * as vscode from "vscode";

import openRemoteRepository from "./open-remote-repository";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(openRemoteRepository);
}

// This method is called when your extension is deactivated
export function deactivate() {}
