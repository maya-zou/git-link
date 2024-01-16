import * as vscode from "vscode";
import { convertGitUrlToHttpsUrl, getGitInfo, hasUpstreamBranch } from "./util";

const openRemoteRepository = vscode.commands.registerCommand("extension.openRemoteRepository", () => {
  const { remoteUrl, currentBranch } = getGitInfo();

  // 将SSH格式转换为HTTPS格式
  let remoteRepositoryUrl = convertGitUrlToHttpsUrl(remoteUrl as string);

  const hasRemoteBranch = hasUpstreamBranch();

  // 判断是否存在远程分支
  if (hasRemoteBranch) {
    let branchUrl = currentBranch ? "/tree/" + currentBranch : "";
    remoteRepositoryUrl = remoteRepositoryUrl + branchUrl;
  }

  if (!remoteRepositoryUrl) {
    vscode.window.showErrorMessage("远程仓库地址不存在，无法打开远程仓库");
    return;
  }
  vscode.env.openExternal(vscode.Uri.parse(remoteRepositoryUrl)); // 打开浏览器
});

export default openRemoteRepository;
