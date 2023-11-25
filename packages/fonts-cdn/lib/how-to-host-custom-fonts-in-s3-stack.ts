import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

export class HowToHostCustomFontsInS3Stack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const prefix = "how-to-host-custom-fonts-in-s3";

    const fontBucket = new s3.Bucket(this, `${prefix}-font-bucket`, {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, `${prefix}-oai`);
    fontBucket.grantRead(originAccessIdentity);

    const cachePolicy = new cloudfront.CachePolicy(this, `${prefix}-cache-policy`, {
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList("Origin"),
    });

    const fontDistribution = new cloudfront.Distribution(this, `${prefix}-font-distribution`, {
      defaultBehavior: {
        cachePolicy,
        origin: new origins.S3Origin(fontBucket, { originAccessIdentity }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    new cdk.CfnOutput(this, `${prefix}-distribution-domain-name`, {
      value: fontDistribution.distributionDomainName,
    });
  }
}
