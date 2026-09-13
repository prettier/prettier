async function case1(row: BingConnectionRow): Promise<{ row: BingConnectionRow; bundle: BingCredentialBundle; accessToken: string; authorizationVersion: number }> {
  return null as never;
}

function case2(row: BingConnectionRow): Record<string, { row: BingConnectionRow; bundle: BingCredentialBundle; accessToken: string; authorizationVersion: number }> {
  return null as never;
}

function case3(row: BingConnectionRow): Promise<{ [KeyOfTheConnectionRow in BingConnectionRowKeys]: BingCredentialBundleValue }> {
  return null as never;
}

function case4(row: BingConnectionRow): Promise<{
  // comment
  row: BingConnectionRow;
  bundle: BingCredentialBundle;
  accessToken: string;
}> {
  return null as never;
}
