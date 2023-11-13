import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cloundfront from 'aws-cdk-lib/aws-cloudfront'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'

import { Stack } from 'aws-cdk-lib/core';
import { Construct } from 'constructs/lib/construct';

export class StaticSite extends Construct {
  constructor(parent: Stack, name: string) {
    super(parent,name);

    const cloundfrontOAI= new cloundfront.OriginAccessIdentity(this, 'aws-RSS-oai')
    // The code that defines your stack goes here
    const bucket = new s3.Bucket(this, 'MyFirstBucket',{
      bucketName:"aws-rss-bucket",
      websiteIndexDocument:'index.html',
      publicReadAccess:false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      blockPublicAccess:s3.BlockPublicAccess.BLOCK_ALL
    });

    bucket.addToResourcePolicy(new iam.PolicyStatement({
      actions:["S3:GetObject"],
      resources:[bucket.arnForObjects("*")],
      principals:[new iam.ArnPrincipal("arn:aws:iam::446364006000:user/Admin")]
    }))

    const distribution=new cloundfront.CloudFrontWebDistribution(this,'aws-RSS-distribution',{
      originConfigs:[{
        s3OriginSource:{
          s3BucketSource:bucket,
          originAccessIdentity:cloundfrontOAI,
        },
        behaviors:[
          {
            isDefaultBehavior:true
          }
        ]
      }]
    })

    new s3deploy.BucketDeployment(this,'aws-RSS-bucket deplyment',{
      sources:[s3deploy.Source.asset('../frontend/build')],
      destinationBucket:bucket,
      distribution,
      distributionPaths:['/*']
    })
  }
}
