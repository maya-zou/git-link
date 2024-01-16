import * as vscode from "vscode";
import { init } from "vscode-nls-i18n";
import openRemoteFile from "./open-remote-file";
import openRemoteRepository from "./open-remote-repository";

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  init(context.extensionPath);

  context.subscriptions.push(openRemoteRepository);
  context.subscriptions.push(openRemoteFile);
}

// This method is called when your extension is deactivated
export function deactivate() {}
