const response = await TheBackendEndpoint.EligibleCategories.get().json<
  IApiPaymentResponse<IApiEligibleCategories>
>();

const shortResponse = await endpoint.get().json<Response>();
