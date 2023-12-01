import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as logs from "aws-cdk-lib/aws-logs";
import * as route53 from "aws-cdk-lib/aws-route53";
import {Construct} from "constructs";

interface BackendStackProps extends cdk.StackProps {
  hostedZoneId: string;
  hostedZoneName: string;
  hostedName: string;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    // TODO: Read values from next.js config file
    const containerImage = new cdk.CfnParameter(this, "containerImage", {
      type: "String",
      description: "Container image, e.g. ghcr.io/karelbemelmans/nextjs-docker:latest",
      default: "ghcr.io/karelbemelmans/nextjs-docker:main"
    });

    // Load our existing Route53 zone
    const route53Zone = route53.HostedZone.fromHostedZoneAttributes(this, "HostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.hostedZoneName
    });

    // Create a new certificate to be used by the ALB listener
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: props.hostedName + "." + props.hostedZoneName,
      validation: acm.CertificateValidation.fromDns(route53Zone)
    });

    // We create a custom VPC to make sure we have some control over it, in our case only that we want 2 AZ's max
    const vpc = new ec2.Vpc(this, "MyVpc", {maxAzs: 2});
    const cluster = new ecs.Cluster(this, "Cluster", {
      clusterName: "nextjs-cluster",
      vpc,
      containerInsights: true
    });

    // Container definitions
    const taskDefinition = new ecs.FargateTaskDefinition(this, "TaskDef", {
      family: "nextjs-docker"
    });

    // Log group
    const logGroup = new logs.LogGroup(this, "LogGroup", {
      logGroupName: "nextjs-docker",
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Container definition for our web container
    const webContainer = taskDefinition.addContainer("web", {
      image: ecs.ContainerImage.fromRegistry(containerImage.valueAsString),
      logging: new ecs.AwsLogDriver({
        logGroup,
        streamPrefix: "web",
        mode: ecs.AwsLogDriverMode.NON_BLOCKING
      })
    });

    // Add a port mapping for our container
    webContainer.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP
    });

    // This will create an ALB listening on HTTPS only
    const loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "Service", {
      serviceName: "nextjs-service",
      cluster,
      publicLoadBalancer: true,
      healthCheckGracePeriod: cdk.Duration.seconds(5),
      taskDefinition,
      certificate,

      // TODO: Our limit for the service should be the combined memory for all containers
      memoryLimitMiB: 512,
      cpu: 256,

      // Providing the DNS name and zone here will create the A ALIAS record in Route53
      domainName: props.hostedName + "." + props.hostedZoneName,
      domainZone: route53Zone
    });

    loadBalancedFargateService.targetGroup.configureHealthCheck({
      path: "/api/status",
      healthyHttpCodes: "200",
      timeout: cdk.Duration.seconds(5),
      healthyThresholdCount: 2,
      unhealthyThresholdCount: 2,
      interval: cdk.Duration.seconds(10)
    });
  }
}
