import fs from "fs";
import path from "path";
import * as vscode from "vscode";
import { getProjectName, getRemoteRepositoryUrl, validatorTracked } from "./util";

const openRemoteFile = vscode.commands.registerCommand("extension.openRemoteFile", async (uri) => {
  try {
    const fsPath = uri.fsPath as string;
    const folderPath = path.dirname(fsPath);

    const isTracked = await validatorTracked(fsPath, folderPath);

    if (!isTracked) {
      vscode.window.showErrorMessage("当前文件未被Git跟踪，无法在浏览器中打开");
      return;
    }

    const projectName = getProjectName();

    const relativePath = fsPath.split(projectName)[1];

    fs.stat(fsPath, (error, stats) => {
      if (error) {
        vscode.window.showErrorMessage(error?.message);
        return;
      }
      const remoteRepositoryUrl = getRemoteRepositoryUrl(stats.isDirectory());
      const remoteFileUrl = remoteRepositoryUrl + relativePath;
      vscode.env.openExternal(vscode.Uri.parse(remoteFileUrl));
    });
  } catch (error: any) {
    vscode.window.showErrorMessage(error?.message);
  }
});

export default openRemoteFile;
