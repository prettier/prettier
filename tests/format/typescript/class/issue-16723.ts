export class JiraCreatePixFraudDetectionGateway
  implements Pick<IssuePixFraudDetectionGateway, "createPixFraudDetectionIssue">
{
  constructor(private readonly logger: Logger) {
    this.logger = logger.child({
      context: JiraCreatePixFraudDetectionGateway.name,
    });
  }
}
export interface JiraCreatePixFraudDetectionGateway
  extends Pick<IssuePixFraudDetectionGateway, "createPixFraudDetectionIssue">
{
  method(logger: Logger): string
}

export class JiraCreatePixFraudDetectionGateway
  implements
    Pick<IssuePixFraudDetectionGateway, "createPixFraudDetectionIssue">,
    Pick<IssuePixFraudDetectionGateway, "createPixFraudDetectionIssue">
{
  constructor(private readonly logger: Logger) {
    this.logger = logger.child({
      context: JiraCreatePixFraudDetectionGateway.name,
    });
  }
}
