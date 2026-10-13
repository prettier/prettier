async function f1(row: BingConnectionRow): Promise<{ row: BingConnectionRow; bundle: BingCredentialBundle; accessToken: string; authorizationVersion: number }> {
  return null as never;
}

function f2(row: BingConnectionRow): Record<string, { row: BingConnectionRow; bundle: BingCredentialBundle; accessToken: string; authorizationVersion: number }> {
  return null as never;
}

function f3(row: BingConnectionRow): Promise<{ [KeyOfTheConnectionRow in BingConnectionRowKeys]: BingCredentialBundleValue }> {
  return null as never;
}

function f4(row: BingConnectionRow): Promise<{
  // comment
  row: BingConnectionRow;
  bundle: BingCredentialBundle;
  accessToken: string;
}> {
  return null as never;
}

// https://github.com/angular/angular/blob/3f9191166936166085320652eef1a562504aa3e4/devtools/projects/ng-devtools/src/lib/shared/signal-graph/utils.ts#L70-L84
export function checkClusterMatch(n: DebugSignalGraphNode): {
  clusterType: ClusterLabelFormatType;
  clusterName: string;
  signalName: string;
} | null {
}
