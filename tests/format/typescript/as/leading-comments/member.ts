export const driveItemPreview = async ({
  client,
  driveId,
  itemId,
}: {
  client: Client;
  driveId: string;
  itemId: string;
}) =>
  (
    (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      await client
        .api(`drives/${driveId}/items/${itemId}`)
        // https://learn.microsoft.com/en-us/graph/api/driveitem-preview?view=graph-rest-beta
        .version("beta")
        .select("getUrl")
        .post({})) as { getUrl: NonNullable<ItemPreviewInfo["getUrl"]> }
    ).getUrl;
