import * as vscode from "vscode";

const openRemoteRepository = vscode.commands.registerCommand("extension.openRemoteRepository", () => {
  const gitExtension = vscode.extensions.getExtension("vscode.git")?.exports;
  const gitAPI = gitExtension.getAPI(1);
  const repository = gitAPI.repositories[0]; // 获取第一个仓库
  const remote = repository.state.remotes[0]; // 获取第一个远程仓库
  const remoteUrl = remote.fetchUrl || remote.pushUrl; // 获取远程仓库的URL
  const currentBranch = repository.state.HEAD.name; // 获取当前分支
  const remoteRepositoryUrl = convertGitUrlToHttpsUrl(remoteUrl, currentBranch); // 将SSH格式转换为HTTPS格式
  if (!remoteRepositoryUrl) {
    vscode.window.showErrorMessage("无法打开远程仓库");
    return;
  }
  vscode.env.openExternal(vscode.Uri.parse(remoteRepositoryUrl)); // 打开浏览器
});

function convertGitUrlToHttpsUrl(url: string, branch?: string) {
  let branchUrl = branch ? "/tree/" + branch : "";
  // 判断是否是SSH格式
  if (url.startsWith("git@")) {
    // 移除git@前缀和'.git'后缀
    let urlBody = url.substring(4, url.length - 4);
    // 替换冒号为斜杠并添加HTTPS前缀
    urlBody = urlBody.replace(":", "/");

    // 添加HTTPS前缀
    return "https://" + urlBody + branchUrl;
  }

  // 判断是否是HTTPS格式
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // 移除'.git'后缀
    let urlBody = url.substring(0, url.length - 4);
    // 添加HTTPS前缀
    return urlBody + branchUrl;
  }
}

export default openRemoteRepository;
