export class JiraCreatePixFraudDetectionGateway
  implements Pick<IssuePixFraudDetectionGateway, "createPixFraudDetectionIssue">
{
  constructor(private readonly logger: Logger) {
    this.logger = logger.child({
      context: JiraCreatePixFraudDetectionGateway.name,
    });
  }
}
