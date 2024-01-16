import { exec } from "child_process";
import path from "path";
import * as vscode from "vscode";
import { GitExtension } from "./types/git";

function getGitExtension() {
  return vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
}

export function getGitInfo() {
  const gitExtension = getGitExtension();
  const gitAPI = gitExtension?.getAPI(1);
  const repository = gitAPI?.repositories[0]; // 获取第一个仓库
  const remote = repository?.state.remotes[0]; // 获取第一个远程仓库
  const remoteUrl = remote?.fetchUrl || remote?.pushUrl; // 获取远程仓库的URL
  const currentBranch = repository?.state.HEAD?.name; // 获取当前分支
  return { repository, remote, remoteUrl, currentBranch };
}

/**
 * @description 验证是否存在远程分支
 */
export function hasUpstreamBranch() {
  const { repository } = getGitInfo();
  const head = repository?.state.HEAD;
  return !!head?.upstream;
}

/**
 * @description 验证文件是否被Git跟踪
 * @param filePath
 * @param folderPath
 * @returns
 */
export function validatorTracked(filePath: string, folderPath: string) {
  return new Promise<boolean>((resolve, reject) => {
    exec("git ls-files --error-unmatch " + filePath, { cwd: folderPath }, (error) => {
      if (error) {
        resolve(false);
      }
      resolve(true);
    });
  });
}

/**
 * @description 获取项目名称
 */
export function getProjectName() {
  const { repository } = getGitInfo();
  const projectName = path.basename(repository?.rootUri.fsPath as string);
  return projectName;
}

/**
 * @description 将Git仓库clone地址转换为HTTPS地址
 * @param url
 * @returns
 */
export function convertGitUrlToHttpsUrl(url: string) {
  // 判断是否是SSH格式
  if (url.startsWith("git@")) {
    // 移除git@前缀和'.git'后缀
    let urlBody = url.substring(4, url.length - 4);
    // 替换冒号为斜杠并添加HTTPS前缀
    urlBody = urlBody.replace(":", "/");
    // 添加HTTPS前缀
    return "https://" + urlBody;
  }

  // 判断是否是HTTPS格式
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // 移除'.git'后缀
    let urlBody = url.substring(0, url.length - 4);
    // 添加HTTPS前缀
    return urlBody;
  }
}

/**
 * @description 获取远程仓库地址
 * @returns
 */
export function getRemoteRepositoryUrl(isDirectory?: boolean) {
  const { remoteUrl, currentBranch } = getGitInfo();

  let remoteRepositoryUrl = convertGitUrlToHttpsUrl(remoteUrl as string);
  if (!remoteRepositoryUrl) {
    vscode.window.showErrorMessage("远程仓库地址不存在，无法打开远程仓库");
    return;
  }

  const hasRemoteBranch = hasUpstreamBranch();
  if (!hasRemoteBranch) {
    vscode.window.showErrorMessage("当前分支不存在远程分支，无法在浏览器中打开");
    return;
  }

  const type = isDirectory ? "tree" : "blob";

  let branchUrl = currentBranch ? `/${type}/` + currentBranch : "";
  remoteRepositoryUrl = remoteRepositoryUrl + branchUrl;

  return remoteRepositoryUrl;
}
