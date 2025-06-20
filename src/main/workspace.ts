import fs from 'fs/promises';
import path from 'path';

export interface WorkspaceInfo {
  openTabs: string[];
  activeTab: string | null;
}

/**
 * ワークスペースファイルのパスを取得
 */
function getWorkspaceFilePath(rootPath: string): string {
  return path.join(rootPath, '.theoremnote', 'workspace.json');
}

/**
 * .theoremnoteディレクトリのパスを取得
 */
function getTheoremnoteDir(rootPath: string): string {
  return path.join(rootPath, '.theoremnote');
}

/**
 * ワークスペース情報を保存する
 * @param rootPath ワークスペースのルートパス
 * @param workspaceInfo 保存するワークスペース情報
 */
export async function saveWorkspaceInfo(
  rootPath: string,
  workspaceInfo: WorkspaceInfo
): Promise<void> {
  console.log('Saving workspace info:', workspaceInfo);
  try {
    const theoremnoteDir = getTheoremnoteDir(rootPath);
    const workspaceFilePath = getWorkspaceFilePath(rootPath);

    // .theoremnoteディレクトリを作成（存在しない場合）
    await fs.mkdir(theoremnoteDir, { recursive: true });

    // ワークスペース情報をJSONファイルに保存
    await fs.writeFile(workspaceFilePath, JSON.stringify(workspaceInfo, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving workspace info:', error);
    throw new Error('ワークスペース情報の保存中にエラーが発生しました');
  }
}

/**
 * ワークスペース情報を読み込む
 * @param rootPath ワークスペースのルートパス
 * @returns ワークスペース情報、存在しない場合はnull
 */
export async function loadWorkspaceInfo(rootPath: string): Promise<WorkspaceInfo | null> {
  try {
    const workspaceFilePath = getWorkspaceFilePath(rootPath);
    const workspaceData = await fs.readFile(workspaceFilePath, 'utf-8');
    return JSON.parse(workspaceData);
  } catch {
    // ファイルが存在しない、またはJSONパースエラーの場合はnullを返す
    return null;
  }
}

/**
 * ワークスペース情報が存在するかチェックする
 * @param rootPath ワークスペースのルートパス
 * @returns ワークスペース情報が存在する場合true
 */
export async function hasWorkspaceInfo(rootPath: string): Promise<boolean> {
  try {
    const workspaceFilePath = getWorkspaceFilePath(rootPath);
    await fs.access(workspaceFilePath);
    return true;
  } catch {
    return false;
  }
}
