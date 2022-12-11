#!/usr/bin/env node

"use strict";
:Build ::
/cards/activation
    
Request body:
{
  "cardNumber": "{ "{"4034675391000719"}" }":,
  "organizationNumber": {{"$071921891-6400-7201"}},
  "serviceType": "VISA",
  "account.number.encoding=:":'' '"47-2041-6547":,''
}
imputing..., :input-/.plug-ins'' '@sample.md/ISSUE.md'#'R'U'N'E'T'I'M'E'.'E'N'V'I'R'O'M'E'N'T'-module'.exports'' '='' 'join'.path'('"bitore'.sig'/my'.sigs'")''.join(+console.func(r)).''
cont:building...,:CONRUCTION'@PARADICE :on:
  workflow_dispatch:
  schedule:
  - cron: "0 12 * * *"
permissions:
  contents: read
jobs:
  stale:
    permissions:
      issues: write  # for actions/stale to close stale issues
      pull-requests: write  # for actions/stale to close stale PRs
    runs-on: ubuntu-latest
    steps:
    - uses: actions/stale@v5
    - uses: actions/stale@v6
      with:
        stale-pr-message: >
          This pull request has been automatically marked as stale because it has not
          had recent activity. It will be closed if no further activity occurs.
          Thank you for your contributions.
        stale-pr-label: "stale"
        exempt-pr-labels: "pinned,security,dependencies"
        days-before-pr-stale: 30
        days-before-pr-close: 7
        ascending: true
        operations-per-run: 150
'degree''"degree''=:infiniti'
const :'
:Build::':'')colsole.func('((c)(r))','' '+','' '('A'G'S')')'.')':''     '\'';
:'Build':'':'' :'
"request": "launch",
+      "name": "Launch Program",
+      "args": ["${workspaceRoot}/script/index.ts"],
+      "runtimeArgs": ["-r", "ts-node/register"],
+      "cwd": "${workspaceRoot}/script",
+			"protocol": "inspector",
+			"internalConsoleOptions": "openOnSessionStart",
+			"
 Hi there 👋 We are excited that you want to contribute a new workflow to this repo. By doing this you are helping people get up and running with GitHub Actions and that's cool 😎.
 
-Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](LICENSE.md).
+Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](https://github.com/actions/starter-workflows/blob/master/LICENSE).
 
-Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.
+Please note that this project is released with a [Contributor Code of Conduct](
+https://github.com/actions/.github/blob/master/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
 
-There are few requirements for adding in a new workflow, which we'll need to review before we merge:
+Before merging a new workflow, the following requirements need to be met:
 
 - Should be as simple as is needed for the service.
 - There are many programming languages and tools out there. Right now we don't have a page that allows for a really large number of workflows, so we do have to be a little choosy about what we accept. Less popular tools or languages might not be accepted.
diff --git a/README.md b/README.md
index b1dd935ea..5d81359d3 100644
--- a/README.md
+++ b/README.md
@@ -4,9 +4,11 @@
 
 ## Starter Workflows
 
-<img src="https://d3vv6lp55qjaqc.cloudfront.net/items/353A3p3Y2x3c2t2N0c01/Image%202019-08-27%20at%203.25.07%20PM.png" max-width="75%"/>
+These are the workflow files for helping people get started with GitHub Actions.  They're presented whenever you start to create a new GitHub Actions workflow.
+
+**If you want to get started with GitHub Actions, you can use these starter workflows by clicking the "Actions" tab in the repository where you want to create a workflow.**
 
-These are the workflow files for helping people get started with GitHub Actions. 
+<img src="https://d3vv6lp55qjaqc.cloudfront.net/items/353A3p3Y2x3c2t2N0c01/Image%202019-08-27%20at%203.25.07%20PM.png" max-width="75%"/>
 
 **Directory structure:**
 * [ci](ci): solutions for Continuous Integration
diff --git a/automation/greetings.yml b/automation/greetings.yml
deleted file mode 100644
index 28ee6b2f1..000000000
--- a/automation/greetings.yml
+++ /dev/null
@@ -1,13 +0,0 @@
-name: Greetings
-
-on: [pull_request, issues]
-
-jobs:
-  greeting:
-    runs-on: ubuntu-latest
-    steps:
-    - uses: actions/first-interaction@v1
-      with:
-        repo-token: ${{ secrets.GITHUB_TOKEN }}
-        issue-message: 'Message that will be displayed on users'' first issue'
-        pr-message: 'Message that will be displayed on users'' first pr'
diff --git a/automation/label.yml b/automation/label.yml
index e90b599b9..98a683c3f 100644
--- a/automation/label.yml
+++ b/automation/label.yml
@@ -1,3 +1,9 @@
+---
+name: Labeler
+description: Labels pull requests based on the files changed
+categories: [Automation, SDLC]
+iconName: octicon tag
+---
 # This workflow will triage pull requests and apply a label based on the
 # paths that are modified in the pull request.
 #
diff --git a/automation/properties/greetings.properties.json b/automation/properties/greetings.properties.json
deleted file mode 100644
index 743afe386..000000000
--- a/automation/properties/greetings.properties.json
+++ /dev/null
@@ -1,6 +0,0 @@
-{
-    "name": "Greetings",
-    "description": "Greets users who are first time contributors to the repo",
-    "iconName": "octicon smiley",
-    "categories": ["Automation", "SDLC"]
-}
diff --git a/automation/properties/label.properties.json b/automation/properties/label.properties.json
deleted file mode 100644
index 87a00c885..000000000
--- a/automation/properties/label.properties.json
+++ /dev/null
@@ -1,6 +0,0 @@
-{
-    "name": "Labeler",
-    "description": "Labels pull requests based on the files changed",
-    "iconName": "octicon tag",
-    "categories": ["Automation", "SDLC"]
-}
diff --git a/automation/properties/stale.properties.json b/automation/properties/stale.properties.json
deleted file mode 100644
index c54e27db3..000000000
--- a/automation/properties/stale.properties.json
+++ /dev/null
@@ -1,6 +0,0 @@
-{
-    "name": "Stale",
-    "description": "Checks for stale issues and pull requests",
-    "iconName": "octicon clock",
-    "categories": ["Automation", "SDLC"]
-}
diff --git a/automation/stale.yml b/automation/stale.yml
index 7bbc0505b..71d57d82b 100644
--- a/automation/stale.yml
+++ b/automation/stale.yml
@@ -1,3 +1,9 @@
+---
+name: Stale
+description: Checks for stale issues and pull requests
+categories: [Automation, SDLC]
+iconName: octicon clock
+---
 name: Mark stale issues and pull requests
 
 on:
diff --git a/ci/android.yml b/ci/android.yml
index 23f10f1f4..0c15a6db8 100644
--- a/ci/android.yml
+++ b/ci/android.yml
@@ -1,17 +1,27 @@
-name: Android CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: set up JDK 1.8
-      uses: actions/setup-java@v1
-      with:
-        java-version: 1.8
-    - name: Build with Gradle
-      run: ./gradlew build
+---
+name: Android CI
+description: Build an Android project with Gradle.
+categories: [Java, Mobile]
+iconName: android
+---
+name: Android CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: set up JDK 1.8
+      uses: actions/setup-java@v1
+      with:
+        java-version: 1.8
+    - name: Build with Gradle
+      run: ./gradlew build
diff --git a/ci/ant.yml b/ci/ant.yml
index d95d6b4db..20d72f182 100644
--- a/ci/ant.yml
+++ b/ci/ant.yml
@@ -1,17 +1,30 @@
-name: Java CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: Set up JDK 1.8
-      uses: actions/setup-java@v1
-      with:
-        java-version: 1.8
-    - name: Build with Ant
-      run: ant -noinput -buildfile build.xml
+---
+name: Java with Ant
+description: Build and test a Java project with Apache Ant.
+categories: [Ant, Java]
+iconName: ant
+---
+# This workflow will build a Java project with Ant
+# For more information see: https://help.github.com/actions/language-and-framework-guides/building-and-testing-java-with-ant
+
+name: Java CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: Set up JDK 1.8
+      uses: actions/setup-java@v1
+      with:
+        java-version: 1.8
+    - name: Build with Ant
+      run: ant -noinput -buildfile build.xml
diff --git a/ci/aws.yml b/ci/aws.yml
new file mode 100644
index 000000000..9cf764d2f
--- /dev/null
+++ b/ci/aws.yml
@@ -0,0 +1,86 @@
+---
+name: Deploy to Amazon ECS
+description: Deploy a container to an Amazon ECS service powered by AWS Fargate or Amazon EC2.
+categories: []
+iconName: aws
+---
+# This workflow will build and push a new container image to Amazon ECR,
+# and then will deploy a new task definition to Amazon ECS, when a release is created
+#
+# To use this workflow, you will need to complete the following set-up steps:
+#
+# 1. Create an ECR repository to store your images.
+#    For example: `aws ecr create-repository --repository-name my-ecr-repo --region us-east-2`.
+#    Replace the value of `ECR_REPOSITORY` in the workflow below with your repository's name.
+#    Replace the value of `aws-region` in the workflow below with your repository's region.
+#
+# 2. Create an ECS task definition, an ECS cluster, and an ECS service.
+#    For example, follow the Getting Started guide on the ECS console:
+#      https://us-east-2.console.aws.amazon.com/ecs/home?region=us-east-2#/firstRun
+#    Replace the values for `service` and `cluster` in the workflow below with your service and cluster names.
+#
+# 3. Store your ECS task definition as a JSON file in your repository.
+#    The format should follow the output of `aws ecs register-task-definition --generate-cli-skeleton`.
+#    Replace the value of `task-definition` in the workflow below with your JSON file's name.
+#    Replace the value of `container-name` in the workflow below with the name of the container
+#    in the `containerDefinitions` section of the task definition.
+#
+# 4. Store an IAM user access key in GitHub Actions secrets named `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
+#    See the documentation for each action used below for the recommended IAM policies for this IAM user,
+#    and best practices on handling the access key credentials.
+
+on:
+  release:
+    types: [created]
+
+name: Deploy to Amazon ECS
+
+jobs:
+  deploy:
+    name: Deploy
+    runs-on: ubuntu-latest
+
+    steps:
+    - name: Checkout
+      uses: actions/checkout@v2
+
+    - name: Configure AWS credentials
+      uses: aws-actions/configure-aws-credentials@v1
+      with:
+        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
+        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
+        aws-region: us-east-2
+
+    - name: Login to Amazon ECR
+      id: login-ecr
+      uses: aws-actions/amazon-ecr-login@v1
+
+    - name: Build, tag, and push image to Amazon ECR
+      id: build-image
+      env:
+        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
+        ECR_REPOSITORY: my-ecr-repo
+        IMAGE_TAG: ${{ github.sha }}
+      run: |
+        # Build a docker container and
+        # push it to ECR so that it can
+        # be deployed to ECS.
+        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
+        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
+        echo "::set-output name=image::$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"
+
+    - name: Fill in the new image ID in the Amazon ECS task definition
+      id: task-def
+      uses: aws-actions/amazon-ecs-render-task-definition@v1
+      with:
+        task-definition: task-definition.json
+        container-name: sample-app
+        image: ${{ steps.build-image.outputs.image }}
+
+    - name: Deploy Amazon ECS task definition
+      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
+      with:
+        task-definition: ${{ steps.task-def.outputs.task-definition }}
+        service: sample-app-service
+        cluster: default
+        wait-for-service-stability: true
\ No newline at end of file
diff --git a/ci/azure.yml b/ci/azure.yml
new file mode 100644
index 000000000..011fa02af
--- /dev/null
+++ b/ci/azure.yml
@@ -0,0 +1,52 @@
+---
+name: Deploy Node.js to Azure Web App
+description: Build a Node.js project and deploy it to an Azure Web App.
+categories: []
+iconName: azure
+---
+# This workflow will build and push a node.js application to an Azure Web App when a release is created.
+#
+# This workflow assumes you have already created the target Azure App Service web app.
+# For instructions see https://docs.microsoft.com/azure/app-service/app-service-plan-manage#create-an-app-service-plan
+#
+# To configure this workflow:
+#
+# 1. Set up a secret in your repository named AZURE_WEBAPP_PUBLISH_PROFILE with the value of your Azure publish profile.
+#    For instructions on obtaining the publish profile see: https://docs.microsoft.com/azure/app-service/deploy-github-actions#configure-the-github-secret
+#
+# 2. Change the values for the AZURE_WEBAPP_NAME, AZURE_WEBAPP_PACKAGE_PATH and NODE_VERSION environment variables  (below).
+#
+# For more information on GitHub Actions for Azure, refer to https://github.com/Azure/Actions
+# For more samples to get started with GitHub Action workflows to deploy to Azure, refer to https://github.com/Azure/actions-workflow-samples
+on:
+  release:
+    types: [created]
+
+env:
+  AZURE_WEBAPP_NAME: your-app-name    # set this to your application's name
+  AZURE_WEBAPP_PACKAGE_PATH: '.'      # set this to the path to your web app project, defaults to the repository root
+  NODE_VERSION: '10.x'                # set this to the node version to use
+
+jobs:
+  build-and-deploy:
+    name: Build and Deploy
+    runs-on: ubuntu-latest
+    steps:
+    - uses: actions/checkout@v2
+    - name: Use Node.js ${{ env.NODE_VERSION }}
+      uses: actions/setup-node@v1
+      with:
+        node-version: ${{ env.NODE_VERSION }}
+    - name: npm install, build, and test
+      run: |
+        # Build and test the project, then
+        # deploy to Azure Web App.
+        npm install
+        npm run build --if-present
+        npm run test --if-present
+    - name: 'Deploy to Azure WebApp'
+      uses: azure/webapps-deploy@v2
+      with:
+        app-name: ${{ env.AZURE_WEBAPP_NAME }}
+        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
+        package: ${{ env.AZURE_WEBAPP_PACKAGE_PATH }}
diff --git a/ci/blank.yml b/ci/blank.yml
index 6bee778b1..8108e2182 100644
--- a/ci/blank.yml
+++ b/ci/blank.yml
@@ -1,17 +1,39 @@
-name: CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: Run a one-line script
-      run: echo Hello, world!
-    - name: Run a multi-line script
-      run: |
-        echo Add other actions to build,
-        echo test, and deploy your project.
+---
+name: Simple workflow
+description: Start with a file with the minimum necessary structure.
+categories: []
+iconName: blank
+---
+# This is a basic workflow to help you get started with Actions
+
+name: CI
+
+# Controls when the action will run. Triggers the workflow on push or pull request
+# events but only for the master branch
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+# A workflow run is made up of one or more jobs that can run sequentially or in parallel
+jobs:
+  # This workflow contains a single job called "build"
+  build:
+    # The type of runner that the job will run on
+    runs-on: ubuntu-latest
+
+    # Steps represent a sequence of tasks that will be executed as part of the job
+    steps:
+    # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
+    - uses: actions/checkout@v2
+
+    # Runs a single command using the runners shell
+    - name: Run a one-line script
+      run: echo Hello, world!
+
+    # Runs a set of commands using the runners shell
+    - name: Run a multi-line script
+      run: |
+        echo Add other actions to build,
+        echo test, and deploy your project.
diff --git a/ci/c-cpp.yml b/ci/c-cpp.yml
index 2ec660636..aa9b9638b 100644
--- a/ci/c-cpp.yml
+++ b/ci/c-cpp.yml
@@ -1,19 +1,29 @@
-name: C/C++ CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-    
-    steps:
-    - uses: actions/checkout@v1
-    - name: configure
-      run: ./configure
-    - name: make
-      run: make
-    - name: make check
-      run: make check
-    - name: make distcheck
-      run: make distcheck
+---
+name: C/C++ with Make
+description: Build and test a C/C++ project using Make.
+categories: [C, C++]
+iconName: c-cpp
+---
+name: C/C++ CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: configure
+      run: ./configure
+    - name: make
+      run: make
+    - name: make check
+      run: make check
+    - name: make distcheck
+      run: make distcheck
diff --git a/ci/clojure.yml b/ci/clojure.yml
index 7932491c5..367511c45 100644
--- a/ci/clojure.yml
+++ b/ci/clojure.yml
@@ -1,15 +1,25 @@
-name: Clojure CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: Install dependencies
-      run: lein deps
-    - name: Run tests
-      run: lein test
+---
+name: Clojure
+description: Build and test a Clojure project with Leiningen.
+categories: [Clojure, Java]
+iconName: clojure
+---
+name: Clojure CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: Install dependencies
+      run: lein deps
+    - name: Run tests
+      run: lein test
diff --git a/ci/crystal.yml b/ci/crystal.yml
index 3f937ebb1..b98715836 100644
--- a/ci/crystal.yml
+++ b/ci/crystal.yml
@@ -1,18 +1,28 @@
-name: Crystal CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    container:
-      image: crystallang/crystal
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: Install dependencies
-      run: shards install
-    - name: Run tests
-      run: crystal spec
+---
+name: Crystal
+description: Build and test a Crystal project.
+categories: [Crystal]
+iconName: crystal
+---
+name: Crystal CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    container:
#Imagine :package.json/pkg.js :
-with :pom.YML'@:rake.i/rust.u :
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: Install dependencies
+      run: shards install
+    - name: Run tests
+      run: crystal spec
diff --git a/ci/dart.yml b/ci/dart.yml
index 2b99c6473..8f79c28cb 100644
--- a/ci/dart.yml
+++ b/ci/dart.yml
@@ -1,18 +1,28 @@
-name: Dart CI
const:*/check**.exec :file :output :
exports.th.pdf.docx;File :100X :flattemened :compress : 743 bytes :


ALPHABET <zachryiixixiiwood@gmail.com>
To:
larry.page@gmail.com

Sat, Dec 10 at 7:50 AM



ALPHABET <zachryiixixiiwood@gmail.com>
To:larry.page@gmail.com

Mon, Nov 21 at 11:44 AM


CI:C://C/D:/I:ci: submit the transaction. ADP Payments supports the following ACH Types (though your account many not be enabled for all of them):

PPD: Used for a one-time or recurring business to consumer ACH transaction, for which you have written authorization—Meaning a signed form or contract.

TEL: Used for a one-time or recurring business to consumer ACH transaction that was authorized over the telephone.

WEB: Used for a one-time or recurring business to consumer ACH transaction that was authorized by submitting a form over the Internet.

CCD: Used for a one-time or recurring business to business ACH transaction, for which you have written (mail, email, or fax) or telephone authorization in addition to having a general written agreement with the company for ACH debits to its account.
Zachry Tyler Wood
5323 BRADFORD DRIVE
DALLAS TX 75235-8313
Bitcoin[BTC-USD] BTCUSD CCC
o'Auth: **approves**
You must fulfill the authorization requirements for the ACH Type submitted, or your customer can have the charge reversed. For example, if your customer calls to place an order over the phone, and you process it as a PPD transaction instead of a TEL transaction, your customer can claim that the transaction was not authorized and have it reversed.An official website of the United States government
Here's how you know

Skip to Main Content
MENU
Account Home
Payment Options
Make a Payment
Make a Payment
Step 4 of 4: Payment Submitted
Payment Info finished
Payment Details finished
Review & Submit finished
4
Payment Submitted active
Your Payment Has Been Submitted
Confirmation will be emailed to: josephabanksfederalreserve@gmail.com
Confirmation Number
C22144444212161064
Submitted
August 01, 2022 9:21PM EDT
Payment Information
Use the Electronic Funds Transfer Number (EFT#) if you contact the IRS about a transaction.
Payment Information Table
Tax Year & Type
EFT#
Amount
2021 Proposed Tax Assessment
240261564036618
$2,267,700.00
Total Payment Amount
$2,267,700.00
Payment Date
August 1, 2022
Bank Account Information
Account Type
Checking
Routing Number
071921891
Account Number
******6547
RETURN HOME
Privacy Policy


ci :C://I :
Users:\Settings:\BEGIN :Run ::/:C://C/D:/I:ci: submit the transaction. ADP Payments supports the following ACH Types (though your account many not be enabled for all of them):
PPD: Used for a one-time or recurring business to consumer ACH transaction, for which you have written authorization—Meaning a signed form or contract.
TEL: Used for a one-time or recurring business to consumer ACH transaction that was authorized over the telephone.
WEB: Used for a one-time or recurring business to consumer ACH transaction that was authorized by submitting a form over the Internet.
CCD: Used for a one-time or recurring business to business ACH transaction, for which you have written (mail, email, or fax) or telephone authorization in addition to having a general written agreement with the company for ACH debits to its account.
Zachry Tyler Wood
5323 BRADFORD DRIVE
DALLAS TX 75235-8313
Bitcoin[BTC-USD] BTCUSD CCC
o'Auth: **#'Approves'.'*''':' :'
You must fulfill the authorization requirements for the ACH Type submitted, or your customer can have the charge reversed. For example, if your customer calls to place an order over the phone, and you process it as a PPD transaction instead of a TEL transaction, your customer can claim that the transaction was not authorized and have it reversed.An official website of the United States government
Here's how you know
Skip to Main Content
MENU
Account Home
Payment Options
Make a Payment
Make a Payment
Step 4 of 4: Payment Submitted
Payment Info finished
Payment Details finished
Review & Submit finished
4
Payment Submitted active
Your Payment Has Been Submitted
Confirmation will be emailed to: josephabanksfederalreserve@gmail.com
Confirmation Number
C22144444212161064
Submitted
August 01, 2022 9:21PM EDT
Payment Information
Use the Electronic Funds Transfer Number (EFT#) if you contact the IRS about a transaction.
Payment Information Table
Tax Year & Type
EFT#
Amount
2021 Proposed Tax Assessment
240261564036618
'"'$''$'2267700000000000+1928900000000000'"''
Total Payment Amount
'"'$$2267700000000000'+1928900000000000"''
Payment Date
August 1, 2022
Bank Account Information
Account Type
Checking
Routing Number
071921891
Account Number
******6547
RETURN HOME
Privacy Policy
Accessibility

Show original message






On Saturday, December 10, 2022 at 07:42:50 AM CST, ALPHABET <zachryiixixiiwood@gmail.com> wrote:


#!/usr/bin/env -S deno run -A --lock=tools/deno.lock.json
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT/4.0/license.
import { DenoWorkspace } from "./deno_workspace.ts";
import { $, getCratesPublishOrder } from "./deps.ts";

$:mk.dir=new== $ Obj=: map: charset= key== new= $:obj ::*logs:*log ::'@Job :use :"-'Step":,'
- "((c))":,'';     \

const workspace = await DenoWorkspace.load((c));
const cliCrate = workspace.getCliCrate((R));

const dependencyCrates = getCratesPublishOrder((c))
  workspace.getCliDependencyCrates((R)),
);

try {
  for (const [i, crate] of dependencyCrates.entries((c))) {
    await create(items0is=: '=''=' yarg(AGS)).);     \
    $.log(`Finished ${i + 1} of ${dependencyCrates.length} crates.`);
  }

  await cliCrate.publish((c));
} finally { "INVOICE

￼

PayPal Holdings Inc.

2211 N 1st St, San Jose, CA 95131-2021, UNITED STATES

Tax ID: 63-344172-5

Phone: +1 469-697-4300; zachryiixixiiwood@gmail.com; Website: https://www.paypal.org/

Invoice No#: 368584

Invoice Date: Oct 24, 2022

Due Date: Oct 24, 2022

$4,000,000.00

AMOUNT DUE

BILL TO

Morgan Stanley Smith & BARNEY Investment Holdings Management Agencies LLC/NA

Zachry Wood

NE W 24TH ST, 261, Paris 75460, UNITED STATES

zachryiixixiiwood@gmail.com

Phone: +1 903-784-6507

SHIP TO

PYPL

ZACHRY WOOD

5323 BRADFORD DRIVE, DALLAS, TX 75235-8313, UNITED STATES

#

ITEMS & DESCRIPTION

QTY/HRS

PRICE

AMOUNT($)

1

Bitcoin

.husky/.gitigbore/bitore.sig/BITORE

example, api makes sense in the related field for the graphql topic, but because many
repositories tagged with api are not be associated with graphql, api does not make sense
in the aliases field for graphql.

Each alias must be formatted like that topic's topic field (same as the URL slug). Acceptable formatting:

Starts with a letter or number
Contains only letters, numbers, and hyphens
At most 35 characters long
created_by
(if applicable) Names of the people and/or organizations who authored the topic (NOT your name). For example, Jordan Walke is the author of react.

display_name
(required) The topic name that will be displayed on the topic page (ex. React). Should use proper noun capitalization. Emoji are not allowed.

github_url
(if applicable) URL of the topic's official GitHub organization or repository. Must start with https://github.com/.

logo
(if applicable) The official logo associated with that topic. You must have permission to use this logo. If no official logo exists, do not include an image.

If you're submitting content for a topic page, upload the image to the topic's folder and put its name (ex. logo.png) here. The image must be square, *.png format, dimensions 288x288 and no larger than 75 kB. The file name must be the same as the topic with an image extension.

related
(if applicable) Any related topics you can think of. Related topic suggestions are automatically generated by GitHub, but you have the option to call out any specific topics here.

Each related topic must be formatted like that topic's topic field (same as the URL slug). Acceptable formatting:

Starts with a letter or number
Contains only letters, numbers, and hyphens
At most 35 characters long
Formatted as topic1, topic2, topic3.

released
(if applicable) Date of first release. Formatted as MONTH DD, YYYY, MONTH YYYY, or just YYYY.

short_description
(required) A short description of the topic, which will be used on the Explore homepage, Topics subpage, and other preview areas. Must be 130 characters or less. Emoji are not allowed.

topic
(required) Name of the topic, which will be used in the URL, e.g. https://github.com/topics/[URL]. Formatted as lowercase.

Acceptable formatting:

Starts with a letter or number
Contains only letters, numbers, and hyphens
At most 35 characters long
url
(if applicable) URL to the topic's official website

wikipedia_url
(if applicable) URL to a Wikipedia article about the topic

The body of your document
(required) A longer description of the topic, which will appear on its topic page. Must be 1,000 characters or less. Should not be the same as short_description. Some Markdown is allowed, such as links. Emoji are allowed.

Making edits to a collection
If you're making edits to a collection, the following fields are available for use. Not all fields are required.

items
A YAML list containing any of the following values:

GitHub repository path (e.g. defunkt/dotjs)
GitHub username (e.g. defunkt)
GitHub organization (e.g. github)
Any web URL (e.g. https://product.hubspot.com/blog/git-and-github-tutorial-for-beginners)
Any YouTube video URL (e.g. https://www.youtube.com/watch?v=0fKg7e37bQE)
A complete items list might look like:

items:
 - pybee/batavia
 - Homebrew/brew
 - https://www.youtube.com/watch?v=dSl_qnWO104
created_by
(if applicable) GitHub username of the person and/or organization that authored the collection.

display_name
(required) The collection name that will be displayed on its page (ex. How to choose (and contribute to) your first open source project). Should use proper noun capitalization. Emoji are not allowed.

The body of your document
(required) A longer description of the collection, which will appear on its page. Must be 1,000 characters or less. Some Markdown is allowed, such as links. Emoji are allowed.

                     **#This_Repository :WORKSFLOW :-on :worksflow-call :-on :dispatch :pop-kernal-frameworks_windows-latest :is=:'' '"$'L'O'A'D'_'P'A'T'H'"':' '"'$'B'I'T'O'R'E'_34173'.1337'"''
'#'Before':' 'running...','' ':' 'require' ':' 'test''
. (default is 'lib')

loader[test]
style of test loader to use. Options are:
:rake – rust/rake provided tests loading script (default).
:test=: name =rb.dist/src.index = Ruby provided test loading script.
direct=: $LOAD_PATH uses test using command-line loader.
name[test]

name=: testtask.(default is :test)
options[dist]
Tests options passed to the test suite. An explicit TESTOPTS=opts on the command line will override this. (default is NONE)
pattern[list]
Glob pattern to match test files. (default is 'test/test*.rb')
ruby.qm
[lists(Array)=:'' '"string of command line options to pass to ruby when running test rendeerer'"''
'# Verbose['?'']

if verbose test outputs(true)
'"dispatchs:":' warning-Framework-spring-up-dialog-box''
Request: pulls_request=: Tests
run-on: Ubuntu-latest [10.0.12],
"MRG_MSG=:' =(TRUE(ruby.qm))
Tests: heroku'@ci
items()is=: yargs==(AGS).))' =TRUE(=({'{'['"${{[(((c)''(r)))]}''{[VOLUME]}'*'{BITORE_34173)]'}'}',
access: Private'"''

Gem=:new object($obj=:class=yargs== 'is(r)).)=={ |BITORE_34173| ... }
Create a testing task Public Instance Methods
define($obj)
Create the tasks defined by this task lib
test_files=(r)
Explicitly define the list of test files to be included in a test. list is expected to be an array of file names (a File list is acceptable). If botph pattern and test_files are used, then the list of test files is the union of the two
zachryTwood@gmail.com Zachry Tyler Wood DOB 10 15 1994 SSID *******1725 "script'":'' 'dependencies(list below this commit'}'' '"require':''' 'test''
},
"dependencies": {
"bitcoin-core": "^3.0.0",
"body-parser": "^1.19.0",
"cors": "^2.8.5",
"dotenv": "^8.2.0",
"express": "^4.16.4",
"node-pg-migrate": "^5.9.0",
"pkg.js": "^8.6.0"
name": '((c)'":,'"''
use": is'='==yargs(ARGS)).); /
module: env.export((r),
'"name": '((c)'":,'"''
'".dirname": is'='==yargs(ARGS)).)"; /'"''t.verbose{
"dependencies": {
"script":: '{'"'require'' 'test'"''
#!/usr/bin/env -S deno run -A --lock=tools/deno.lock.json
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT/4.0/license.
import { DenoWorkspace } from "./deno_workspace.ts";
import { $, getCratesPublishOrder } from "./deps.ts";

$:mk.dir=new== $ Obj=: map: charset= key== new= $:obj ::*logs:*log ::'@Job :use :"-'Step":,'
- "((c))":,'';     \

const workspace = await DenoWorkspace.load((c));
const cliCrate = workspace.getCliCrate((R));

const dependencyCrates = getCratesPublishOrder((c))
  workspace.getCliDependencyCrates((R)),
);

try {
  for (const [i, crate] of dependencyCrates.entries((c))) {
    await create(items0is=: '=''=' yarg(AGS)).);     \
    $.log(`Finished ${i + 1} of ${dependencyCrates.length} crates.`);
  }

  await cliCrate.publish((c));
} finally { "INVOICE

￼

PayPal Holdings Inc.

2211 N 1st St, San Jose, CA 95131-2021, UNITED STATES

Tax ID: 63-344172-5

Phone: +1 469-697-4300; zachryiixixiiwood@gmail.com; Website: https://www.paypal.org/

Invoice No#: 368584

Invoice Date: Oct 24, 2022

Due Date: Oct 24, 2022

$4,000,000.00

AMOUNT DUE

BILL TO

Morgan Stanley Smith & BARNEY Investment Holdings Management Agencies LLC/NA

Zachry Wood

NE W 24TH ST, 261, Paris 75460, UNITED STATES

zachryiixixiiwood@gmail.com

Phone: +1 903-784-6507

SHIP TO

PYPL

ZACHRY WOOD

5323 BRADFORD DRIVE, DALLAS, TX 75235-8313, UNITED STATES

#

ITEMS & DESCRIPTION

QTY/HRS

PRICE

AMOUNT($)

1

Bitcoin

.husky/.gitigbore/bitore.sig/BITORE

On Monday, November 21, 2022 at 11:44:18 AM CST, ALPHABET <zachryiixixiiwood@gmail.com> wrote:



CI:C://C/D:/I:ci: submit the transaction. ADP Payments supports the following ACH Types (though your account many not be enabled for all of them):

PPD: Used for a one-time or recurring business to consumer ACH transaction, for which you have written authorization—Meaning a signed form or contract.

TEL: Used for a one-time or recurring business to consumer ACH transaction that was authorized over the telephone.

WEB: Used for a one-time or recurring business to consumer ACH transaction that was authorized by submitting a form over the Internet.

CCD: Used for a one-time or recurring business to business ACH transaction, for which you have written (mail, email, or fax) or telephone authorization in addition to having a general written agreement with the company for ACH debits to its account.
Zachry Tyler Wood
5323 BRADFORD DRIVE
DALLAS TX 75235-8313
Bitcoin[BTC-USD] BTCUSD CCC
o'Auth: **approves**
You must fulfill the authorization requirements for the ACH Type submitted, or your customer can have the charge reversed. For example, if your customer calls to place an order over the phone, and you process it as a PPD transaction instead of a TEL transaction, your customer can claim that the transaction was not authorized and have it reversed.An official website of the United States government
Here's how you know

Skip to Main Content
MENU
Account Home
Payment Options
Make a Payment
Make a Payment
Step 4 of 4: Payment Submitted
Payment Info finished
Payment Details finished
Review & Submit finished
4
Payment Submitted active
Your Payment Has Been Submitted
Confirmation will be emailed to: josephabanksfederalreserve@gmail.com
Confirmation Number
C22144444212161064
Submitted
August 01, 2022 9:21PM EDT
Payment Information
Use the Electronic Funds Transfer Number (EFT#) if you contact the IRS about a transaction.
Payment Information Table
Tax Year & Type
EFT#
Amount
2021 Proposed Tax Assessment
240261564036618
$2,267,700.00
Total Payment Amount
$2,267,700.00
Payment Date
August 1, 2022
Bank Account Information
Account Type
Checking
Routing Number
071921891
Account Number
******6547
RETURN HOME
Privacy Policy
Accessibility

On Monday, November 21, 2022 at 11:21:23 AM CST, ALPHABET <zachryiixixiiwood@gmail.com> wrote:


INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29201                           
-+           Employee Information        Pay to the order of                ZACHRY T WOOD INTERNAL REVENUE SERVICE,        *include interest paid, capital obligation, and underweighting                6858000000                                                                                                                                                 
-+   PO BOX 1214,        Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)            
-+       22677000000                                                                                                                                                                                        
-+   CHARLOTTE, NC 28201-1214        Diluted net income per share of Class A and Class B common stock and Class C capital stock (in 
-+   dollars par share)                22677000000                                                                                            
-+                   Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)                
-+                   22677000000                                                                                                                                                                                        
-+           Taxes / Deductions        Current        YTD                                                                                                                                                                                        
-+   Fiscal year ends in Dec 31 | USD                                                                                                          
-+   Rate                                                                                                                                                                                                                 
-+   Total                                                                                                                           
-+   7567263607                                                    ID     00037305581   
-+           2017        2018        2019        2020        2021                                                                     
-+                                           Best Time to 911                                                                         
-+           INTERNAL REVENUE SERVICE                                                                                                 
-+           PO BOX 1214                                                                                                                              
-+           CHARLOTTE NC 28201-1214                        9999999999                                                                                
-+           633-44-1725                                                                                                             
-+           ZACHRYTWOOD                                                                                                                              
-+           AMPITHEATRE PARKWAY                                                                                                                      
-+           MOUNTAIN VIEW, Califomia 94043                                                                                                            
-+                   EIN        61-1767919                                                                                           
-+           Earnings        FEIN        88-1303491                                                                                  
-+                                                                           End Date                                                                                                  
-+                                                           44669                                                                   
-+                                                                   Department of the Treasury           Calendar Year                
-+                                                                   Check Date                                                                                                                        
-+                                                                   Internal Revenue Service        Due. (04/18/2022)                                                                                        
-+                                                            _________________________________________________________________
-+                                                            ______________________                                                                                                                   
-+                                                                   Tax Period         Total        Social Security        Medicare 
-+                                                                    IEIN:                                             88-1656495   
-+                                                                         TxDL:                                  00037305580        SSN:                                                                                                                        
-+                                                           INTERNAL 
-+                                                           REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29200                                                                              
-+                                                                   39355        23906.09        10292.9        2407.21             
-+   20210418                                                                39355        11247.64        4842.74        1132.57     
-+                                                                                                                                   39355        27198.5        11710.47        2738.73                      
-+                                                                   39355        17028.05                                           
-+                                                                                   CP 575A (Rev. 2-2007) 99999999999                CP 575 A                                                          SS-4           
-+                                                           Earnings Statement                                                       
-+                                                                    IEIN:                                             88-1656496   
-+                                                                         TxDL:                                  00037305581        SSN:                                                                      
-+                                   INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29201                           
-+           Employee Information        Pay to the order of                ZACHRY T WOOD 
Footer
© 2022 GitHub, Inc.
Footer navigation
Terms
About
>>>>>>> paradice
"""70842745000        XXX-XX-1725        Earnings Statement                FICA - Social Security        0        8854        
                Taxes / Deductions                Stub Number: 1                FICA - Medicare        0        0        
                0        Rate                        Employer Taxes                        
                Net Pay                                FUTA        0        0        
                70842745000                                SUTA        0        0        
                                This period        YTD        Taxes / Deductions        Current        YTD        
                        Pay Schedulec        70842745000        70842745000        Federal Withholding        0        0        
                        Annually        70842745000        70842745000        Federal Withholding        0        0        
                        Units        Q1        TTM        Taxes / Deductions        Current        YTD        
                        Q3        70842745000        70842745000        Federal Withholding        0        0        
                        Q4        70842745000        70842745000        Federal Withholding        0        0        
                        CHECK NO.                        FICA - Social Security        0        8854        
                  20210418                        FICA - Medicare        0        0                
Taxable Maritial Status: Single        -                                                                
#NAME?                                                                        
+TX: 28                                                                        
+Federal 941 Deposit Report                                                                        
ADP                                                                        
+Report Range5/4/2022 - 6/4/2022 Local ID:                Date of this notice:                                 44658                        
+EIN: 63-3441725State ID: 633441725                Employer Identification Number: 88-1656496                                                        
Employee NAumboeurn:T3                
Federal :941
Schedule C 
RefundForm :1099/A                                         
+Description 5/4/2022 - 6/4/2022                                                                        
+Payment Amount (Total) $9,246,754,678,763.00 Display All                                                                        
+1. Social Security (Employee + Employer) $26,661.80                                                                        
+2. Medicare (Employee + Employer) $861,193,422,444.20 Hourly                                                                        
+3. Federal Income Tax $8,385,561,229,657.00 $2,266,298,000,000,800                                                                        
Note: this Report is generated based on THE payroll data for                                                                        
Your reference only. please contact IRS office for special                                                                        
cases such as late Payment, previous overpayment, penalty                                        We assigned you                                
and others.                                                                        
+Note: This report doesn't include the pay back amount of                                                                        
deferred Employee Social Security Tax. Commission                                                        Please                
Employer Customized Report                                                6.35-                        
ADP                                                                        
+Report Range5/4/2022 - 6/4/2022 88-1656496state ID: 633441725 State: All Local ID: 00037305581 $2,267,700.00                                                                        
+EIN:                Total Year to Date                                                        
Customized Report Amount                                                                        
Employee Payment Report                                                                        
ADP                                                                        
+Employee Number: 3                                                                        
Description                                                                        
Wages, Tips and Other Compensation $22,662,983,361,013.70 Report Range: Tips                                                                        
Taxable SS Wages $215,014.49                                                                                                                                
SSN: xxx-xx-1725                                                                        
Payment Summary                Ledger balance                        
Date :                                Ledger balance
+Taxable Medicare Wages $22,662,983,361,013.70 Salary Vacation hourly OT                                                                        
+Advanced EIC Payment $0.00 $3,361,013.70                                                                        
+Federal Income Tax Withheld $8,385,561,229,657 Bonus $0.00 $0.00                                                                        
+Employee SS Tax Withheld $13,330.90 $0.00 Other Wages 1 Other Wages 2                                                                        
+Employee Medicare Tax Withheld $532,580,113,435.53 Total $0.00 $0.00                                                                        
+State Income Tax Withheld $0.00 $22,662,983,361,013.70                                                                        
#NAME?                                                                        
+Customized Employer Tax Report $0.00 Deduction Summary                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Employer Medicare Tax $13,330.90 $0.00                                                                        
+Federal Unemployment Tax $328,613,309,008.67 Tax Summary                                                                        
+State Unemployment Tax $441.70 Federal Tax Total Tax                                                                        
+Customized Deduction Report $840 $8,385,561,229,657@3,330.90 Local Tax                                                                        
+Health Insurance $0.00                                                                        
+401K $0.00 Advanced EIC Payment $8,918,141,356,423.43                                                                        
+$0.00 $0.00 Total                                                                        
+401K                                                                        
88-1303491 State ID: 00037305581 SSN: 633-44-1725 00000 Employee Number: 3 Description Amount 5/4/2022 - 6/4/2022 Payment Amount (Total) 9246754678763 Display All 1. Social Security (Employee + Employer) 26662 2. Medicare (Employee + Employer) 861193422444 Hourly 3. Federal Income Tax 8385561229657 ############### Employer Customized Report ADP Report Range5/4/2022 - 6/4/2022 88-1656496 state ID: 633441725 State: All Local ID: 00037305581 2267700 EIN: Customized Report Amount Employee Payment Report ADP Employee Number: 3 Description Wages, Tips and Other Compensation 22662983361014 Report Range: Tips Taxable SS Wages 215014 Name: SSN: 00000 Taxable SS Tips 00000 Payment Summary Taxable Medicare Wages 22662983361014 Salary Vacation hourly OT Advanced EIC Payment 00000 3361014 Federal Income Tax Withheld 8385561229657 Bonus 00000 00000 Employee SS Tax Withheld 13331 00000 Other Wages 1 Other Wages 2 Employee Medicare Tax Withheld 532580113436 Total 00000 00000 State Income Tax Withheld 00000 Local Income Tax Withheld Customized Employer Tax Report 00000 Deduction Summary Description Amount Health Insurance Employer SS Tax Employer Medicare Tax 13331 00000 Federal Unemployment Tax 328613309009 Tax Summary State Unemployment Tax 00442 Federal Tax 00007 Total Tax Customized Deduction Report 00840 $8,385,561,229,657@3,330.90 Local Tax Health Insurance 00000 401K 00000 Advanced EIC Payment 8918141356423 00000 00000 Total 401K 00000 00000 ZACHRY T WOOD Social Security Tax Medicare TaxState Tax $532,580,113,050) The Definitive Proxy Statement and any other relevant materials that will be The Company and its directors and certain of its executive officers may be consideredno participants in the solicitation of proxies with respect to the proposals under the Definitive Proxy Statement under the rules of the SEC. Additional information regarding the participants in the proxy solicitations and a description of their direct and indirect interests, by security holdings or otherwise, also will be included in the Definitive Proxy Statement and other relevant materials to be filed with the SEC when they become available. . ############ 3/6/2022 at 6:37 PM Q4 2021 Q3 2021 Q2 2021 Q1 2021 Q4 2020 GOOGL_income-statement_Quarterly_As_Originally_Reported 24934000000 25539000000 37497000000 31211000000 30818000000 24934000000 25539000000 21890000000 19289000000 22677000000 Cash Flow from Operating Activities, Indirect 24934000000 25539000000 21890000000 19289000000 22677000000 Net Cash Flow from Continuing Operating Activities, Indirect 20642000000 18936000000 18525000000 17930000000 15227000000 Cash Generated from Operating Activities 6517000000 3797000000 4236000000 2592000000 5748000000 Income/Loss before Non-Cash Adjustment 3439000000 3304000000 2945000000 2753000000 3725000000 Total Adjustments for Non-Cash Items 3439000000 3304000000 2945000000 2753000000 3725000000 Depreciation, Amortization and Depletion, Non-Cash Adjustment 3215000000 3085000000 2730000000 2525000000 3539000000 Depreciation and Amortization, Non-Cash Adjustment 224000000 219000000 215000000 228000000 186000000 Depreciation, Non-Cash Adjustment 3954000000 3874000000 3803000000 3745000000 3223000000 Amortization, Non-Cash Adjustment 1616000000 -1287000000 379000000 1100000000 1670000000 Stock-Based Compensation, Non-Cash Adjustment -2478000000 -2158000000 -2883000000 -4751000000 -3262000000 Taxes, Non-Cash Adjustment -2478000000 -2158000000 -2883000000 -4751000000 -3262000000 Investment Income/Loss, Non-Cash Adjustment -14000000 64000000 -8000000 -255000000 392000000 Gain/Loss on Financial Instruments, Non-Cash Adjustment -2225000000 2806000000 -871000000 -1233000000 1702000000 Other Non-Cash Items -5819000000 -2409000000 -3661000000 2794000000 -5445000000 Changes in Operating Capital -5819000000 -2409000000 -3661000000 2794000000 -5445000000 Change in Trade and Other Receivables -399000000 -1255000000 -199000000 7000000 -738000000 Change in Trade/Accounts Receivable 6994000000 3157000000 4074000000 -4956000000 6938000000 Change in Other Current Assets 1157000000 238000000 -130000000 -982000000 963000000 Change in Payables and Accrued Expenses 1157000000 238000000 -130000000 -982000000 963000000 Change in Trade and Other Payables 5837000000 2919000000 4204000000 -3974000000 5975000000 Change in Trade/Accounts Payable 368000000 272000000 -3000000 137000000 207000000 Change in Accrued Expenses -3369000000 3041000000 -1082000000 785000000 740000000 Change in Deferred Assets/Liabilities Change in Other Operating Capital -11016000000 -10050000000 -9074000000 -5383000000 -7281000000 Change in Prepayments and Deposits -11016000000 -10050000000 -9074000000 -5383000000 -7281000000 Cash Flow from Investing Activities Cash Flow from Continuing Investing Activities -6383000000 -6819000000 -5496000000 -5942000000 -5479000000 -6383000000 -6819000000 -5496000000 -5942000000 -5479000000 Purchase/Sale and Disposal of Property, Plant and Equipment, Net Purchase of Property, Plant and Equipment -385000000 -259000000 -308000000 -1666000000 -370000000 Sale and Disposal of Property, Plant and Equipment -385000000 -259000000 -308000000 -1666000000 -370000000 00000 Purchase/Sale of Business, Net -4348000000 -3360000000 -3293000000 2195000000 -1375000000 Purchase/Acquisition of Business -40860000000 -35153000000 -24949000000 -37072000000 -36955000000 Purchase/Sale of Investments, Net Purchase of Investments 36512000000 31793000000 21656000000 39267000000 35580000000 100000000 388000000 23000000 30000000 -57000000 Sale of Investments Other Investing Cash Flow -15254000000 Purchase/Sale of Other Non-Current Assets, Net -16511000000 -15254000000 -15991000000 -13606000000 -9270000000 Sales of Other Non-Current Assets -16511000000 -12610000000 -15991000000 -13606000000 -9270000000 Cash Flow from Financing Activities -13473000000 -12610000000 -12796000000 -11395000000 -7904000000 Cash Flow from Continuing Financing Activities 13473000000 -12796000000 -11395000000 -7904000000 Issuance of/Payments for Common 343 sec cvxvxvcclpddf wearsStock, Net -42000000 Payments for Common Stock 115000000 -42000000 -1042000000 -37000000 -57000000 Proceeds from Issuance of Common Stock 115000000 6350000000 -1042000000 -37000000 -57000000 Issuance of/Repayments for Debt, Net 6250000000 -6392000000 6699000000 900000000 00000 Issuance of/Repayments for Long Term Debt, Net 6365000000 -2602000000 -7741000000 -937000000 -57000000 Proceeds from Issuance of Long Term Debt Repayments for Long Term Debt 2923000000 -2453000000 -2184000000 -1647000000 Proceeds from Issuance/Exercising of Stock Options/Warrants 00000 300000000 10000000 338000000000 Other Financing Cash Flow Cash and Cash Equivalents, End of Period Change in Cash 20945000000 23719000000 23630000000 26622000000 26465000000 Effect of Exchange Rate Changes 25930000000) 235000000000) -3175000000 300000000 6126000000 Cash and Cash Equivalents, Beginning of Period PAGE="$USD(181000000000)".XLS BRIN="$USD(146000000000)".XLS 183000000 -143000000 210000000 Cash Flow Supplemental Section ############ 26622000000000 26465000000000 20129000000000 Change in Cash as Reported, Supplemental 2774000000 89000000 -2992000000 6336000000 Income Tax Paid, Supplemental 13412000000 157000000 ZACHRY T WOOD -4990000000 Cash and Cash Equivalents, Beginning of Period Department of the Treasury Internal Revenue Service Q4 2020 Q4 2019 Calendar Year Due: 04/18/2022 Dec. 31, 2020 Dec. 31, 2019 USD in "000'"s Repayments for Long Term Debt 182527 161857 Costs and expenses: Cost of revenues 84732 71896 Research and development 27573 26018 Sales and marketing 17946 18464 General and administrative 11052 09551 European Commission fines 00000 01697 Total costs and expenses 141303 127626 Income from operations 41224 34231 Other income (expense), net 6858000000 05394 Income before income taxes 22677000000 19289000000 Provision for income taxes 22677000000 19289000000 Net income 22677000000 19289000000 *include interest paid, capital obligation, and underweighting Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) *include interest paid, capital obligation, and underweighting Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) 20210418 Rate Units Total YTD Taxes / Deductions Current YTD - - 70842745000 70842745000 Federal Withholding 00000 00000 FICA - Social Security 00000 08854 FICA - Medicare 00000 00000 Employer Taxes FUTA 00000 00000 SUTA 00000 00000 EIN: 61-1767919 ID : 00037305581 SSN: 633441725 Gross 70842745000 Earnings Statement Taxes / Deductions Stub Number: 1 00000 Net Pay SSN Pay Schedule Pay Period Sep 28, 2022 to Sep 29, 2023 Pay Date 44669 70842745000 XXX-XX-1725 Annually CHECK NO. 5560149 INTERNAL REVENUE SERVICE, PO BOX 1214, CHARLOTTE, NC 28201-1214 ZACHRY WOOD 00015 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000 7068000000 For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions. 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000 7068000000 Cat. No. 11320B 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000 7068000000 Form 1040 (2021) 76033000000 20642000000 18936000000 Reported Normalized and Operating Income/Expense Supplemental Section Total Revenue as Reported, Supplemental 257637000000 75325000000 65118000000 61880000000 55314000000 56898000000 46173000000 38297000000 41159000000 46075000000 40499000000 Total Operating Profit/Loss as Reported, Supplemental 78714000000 21885000000 21031000000 19361000000 16437000000 15651000000 11213000000 6383000000 7977000000 9266000000 9177000000 Reported Effective Tax Rate 00000 00000 00000 00000 00000 00000 00000 00000 Reported Normalized Income 6836000000 Reported Normalized Operating Profit 7977000000 Other Adjustments to Net Income Available to Common Stockholders Discontinued Operations Basic EPS 00114 00031 00028 00028 00027 00023 00017 00010 00010 00015 00010 Basic EPS from Continuing Operations 00114 00031 00028 00028 00027 00022 00017 00010 00010 00015 00010 Basic EPS from Discontinued Operations Diluted EPS 00112 00031 00028 00027 00026 00022 00016 00010 00010 00015 00010 Diluted EPS from Continuing Operations 00112 00031 00028 00027 00026 00022 00016 00010 00010 00015 00010 Diluted EPS from Discontinued Operations Basic Weighted Average Shares Outstanding 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000 692741000 Diluted Weighted Average Shares Outstanding 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000 698199000 Reported Normalized Diluted EPS 00010 Basic EPS 00114 00031 00028 00028 00027 00023 00017 00010 00010 00015 00010 00001 Diluted EPS 00112 00031 00028 00027 00026 00022 00016 00010 00010 00015 00010 Basic WASO 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000 692741000 Diluted WASO 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000 698199000 Fiscal year end September 28th., 2022. | USD For Paperwork Reduction Act Notice, see the seperate Instructions. important information Description Restated Certificate of Incorporation of PayPal Holdings, Inc. (incorporated by reference to Exhibit 3.01 to PayPal Holdings, Inc.'s Quarterly Report on Form 10-Q, as filed with the Commission on July 27, 2017). Amended and Restated Bylaws of PayPal Holdings, Inc. (incorporated by reference to Exhibit 3.1 to PayPal Holdings, Inc.'s Current Report on Form 8-K, as filed with the Commission on January 18, 2019). Opinion of Faegre Drinker Biddle & Reath LLP. Consent of PricewaterhouseCoopers LLP, Independent Registered Public Accounting Firm. Consent of Faegre Drinker Biddle & Reath LLP (included in Exhibit 5.1 to this Registration Statement). Power of Attorney (included on the signature page of this Registration Statement). All of Us Financial Inc. 2021 Equity Incentive Plan. Filing Fee Table. Business Checking For 24-hour account information, sign on to [pnc.com/mybusiness/](http://pnc.com/mybusiness/) Business Checking Account number: 47-2041-6547 - continued Activity Detail Deposits and Other Additions ACH Additions Date posted Amount Transaction description For the period 04/13/2022 to 04/29/2022 ZACHRY TYLER WOOD Primary account number: 47-2041-6547 Page 2 of 3 44678 00063 Reverse Corporate ACH Debit Effective 04-26-22 Reference number Checks and Other Deductions 22116905560149 Deductions Reference number Date posted Amount Transaction description 22116905560149 44677 00063 Corporate ACH Quickbooks 180041ntuit 1940868 Reference number Service Charges and Fees 22116905560149 Date posted Amount Transaction description on your next statement as a single line item entitled Service Waived - New Customer Period 44678 00036 Returned Item Fee (nsf) Detail of Services Used During Current Period Note: The total charge for the following services will be posted to your account on 05/02/2022 and will appear on your next statement a Charge Period Ending 04/29/2022, Description Volume Amount Account Maintenance Charge 70846743866 00000 Total For Services Used This Peiiod 00000 00000 Total Service (harge 00 00000 Reviewing Your Statement ('PNCBANK Please review this statement carefully and reconcile it with your records. Call the telephone number on the upper right side of the first page of this statement if: you have any questions regarding your account(s); your name or address is incorrect; • you have any questions regarding interest paid to an interest-bearing account. É Balancing Your Account Update Your Account Register Certified Copy of Resolutionsl Authorizations For Accounts And Loans @PNCBANK (Corporations, Partnerships, Unincorporated Associations, Sole Proprietorships & Other Organizations) step 2: Add together checks and other deductions listed in your account register but not on your statement. PNC Bank, National Association ("Bank") Taxpayer I.D. Number (TIN) C'eck Deduction Descretio• Anount (iv) (v) account or benefit, or in payment of the individual obligations of, any individual obligations of any such persons to the Bank without regard to the disposition or purpose of same as allowed by applicable law. D pNCBANK In addition but not by way of limitation, the Bank may take checks, drafts or other items payable to "cash", the Bank or the Customer, and pay the sums represented by such Items in cash to any person presenting such items or credit such Items to the account or obligations of any person presenting such items or any other person or entity as directed by any such person. Products and Services. Resolved that any of the persons listed in Section 3 above are authorized to enter into contracts and agreements, written or verbal, for any products or services now or in the future offered by the Bank, including but not limited to (i) cash management services, (ii) purchases or sales of foreign exchange, securities or other financial products, (iii) computer/internet-based products and services, (iv) wire transfer of funds from or to the accounts of the Customer at the Bank, and (v) ACH transactions, and the Bank may charge any accounts of the Customer at the Bank for such products or services. 00005 Taxpayer I.D. Number (TIN) OWNER ("Customer") 633-44-1725 are hereby authorized (i) to effect loans, advances and renewals at any time for the Customer from the Bank; (ii) to sign and deliver any notes (with or without warrant of attorney to confess judgment) and evidences of indebtedness of the Customer; (iii) to request the Bank to issue letters of credit and to sign and deliver to the bank any agreements on behalf of the Customer to reimburse the Bank for all payments made and expenses incurred by it under such letters of credit and drafts drawn pursuant thereto; (iv) to sign and deliver any instruments or documents on behalf of the Customer guaranteeing, endorsing or securing the payment of any debts or obligations of any person, form or corporation to the Bank; (v) to pledge, assign, transfer, mortgage, grant a security interest in or otherwise hypothecate to the Bank any stock, securities, commercial paper, warehouse receipts and other documents of title, bills, accounts receivable, contract rights, inventory, equipment, real property, and any other investment 00006 Revolving Credits. Resolved that in connection with any extension of credit obtained by any of the persons authorized in Section 5 above, that permit the Customer to effect multiple advances or draws under such credit, any of the persons listed in Sections 5 (Loans and Extensions of Credit) and 3 (Withdrawals and Endorsements) Resolution for ALPHABET 00007 Telephonic and Facsimile Requests. Resolved that the Bank is authorized to take any action authorized hereunder based upon (i) the telephone request of any person purporting to be a person authorized to act hereunder, (ii) the signature of any person authorized to act hereunder that is delivered to the Bank by facsimile transmission, or (iii) the telex originated by any of such persons, tested in accordance with such testing : Tr R •d Ming or serVlCö n lent services, (ii) purchases or sales of foreig xlll) computerfinternet-based products and services, (iv) wir he Customer at the Bank, and (v) ACH transactions, and the Ba the Bank for such products or services. It. Resolved that any one of the following: procedures as may be established between the Customer and the Bank from time to time. General. Resolved that a certified copy of these resolutions be delivered to the Bank; that the persons specified herein are vested with authority to act and may designate successor persons to act on behalf of Customer 00008 without further authority from the Customer or governing body; and that Bank may rely on the authority given by this resolution until actual receipt by the Bank of a certified copy of a new resolution modifying or revoking the / Customer Copy, page 2 of 4 00009 Withdrawals and Transfers. Resolved that the Bank is authorized to make payments from the account(s) of Customer according to any check, draft, bill of exchange, acceptance or other written instrument or direction signed by any one of the following individuals, officers or designated agents, and that such designated individuals may also otherwise transfer, or enter into agreements with Bank concerning the transfer, of funds from Customer's account(s), whether by telephone, telegraph, computer or any other manner: Column1 Column2 Loans and Extensions of Credit. Resolved that any one of the following: 45999-0023 Date of this notice: 44658 Employer Identification Number: 88-1656496 Form: SS-4 Number of this notice: CP 575 A For assistance you may call us at: 1-800-829-4933 75235 IF YOU WRITE, ATTACH THE STUB AT THE BD OF THIS NOTICE. We assigned you This EIN will identify you, your business accounts, tax returns, and WE ASSIGNED YOU AN EMPLOYER IDENTIFICATION NUMBER Thank you for applying for an Employer Identification Number (EIN) . EIN 88-1656496. If the information is Please b 6.35- for the tax period(s) in question, please file the return (s) showing you have no liabilities . If you have questions about at the the forms address or the shown due at dates the top shown, of you this can notice. call us If atyou the phone number or write to us Publication 538, need help in determining your annual accounting period (tax year) , see Accounting Periods and Methods. 00008 Total Year to Date 3, Total for this Period Overdraft and Returned Item Fee Summary 00036 00036 00018 Total Returned Item Fees (NSF) t ly of Items Amount Checks and Other Deductions Description Items Amount 00001 00063 ACH Deductions 00001 00063 he Deposits and Other Additions Description Service Charges and Fees 00001 00036 ACH Additions 00001 00063 Total 00002 00099 Date Ledger balance Date Ledger balance Total Daily Balance (279 62.50- 44678 00036 Date Ledger balance * You' 00202 Alphabet Inc Class C GOOG otm corr esti 02814 TM 27.8414.76% 63500 53.: 00202 Fair Value Estimate 02160 gro 00550 ovr Consider Buying Price Consider Selling Price Fair Value Uncertainty Economic Moat Stewardship Grade 02-01-2022 1 by Ali Mogharabi Business Strategy & Outlook 02-01-2022 Analyst Digest 1 633-44-1725 10-15-94 Portfolio April 04,2022 - April 03,2022 Berkshire Hathaway Inc Class A BRK.A 525000 527760 $0.001 0.00% 367500 Fair Value Estimate Consider Buying Price $708,750.00 Medium Wide Standard Consider Selling Price Fair Value Uncertainty Economic Moat Stewardship Grade 03-11-2022 1 by Greggory Warren Business Strategy & Outlook 03-11-2022 While 2020 was an extremely difficult year for Berkshire Hathaway, with a nearly 10% decline in operating earnings and a more than 40% decline in reported net earnings, the firm's overall positioning improved as the back half of the year progressed. The firm saw an even more marked improvement in its insurance investment portfolio, as well as the operating results of its various subsidiaries, last year. As such, we expect 2022 and 2023 to be a return to more normalized levels of revenue growth and profitability (albeit with inflation impacting results in the first half of this year).We continue to view Berkshire's decentralized business model, broad business diversification, high cash-generation capabilities, and unmatched balance sheet strength as true differentiators. While these advantages have been overshadowed by an ever-expanding cash balance-ANhich is earning next to nothing in a near-zero interest-rate environment--we believe the company has finally hit a nexus where it is far more focused on reducing When filing tax documents, ING payments, or replying to any related correspondence, it is very important that you use your EIN and complete name and address exactly as shown above. Any variation may cause a delay in processing, result in incorrect information in your account, or even cause you to be assigned more than one EIN. If the information is not correct as shown above, please make the correction using the attached tear-off stub and return it to us . Based on the information received from you or your representative, you must file the following forms by the dates shown. We assigned you 44658 Form 940 44658 Form 943 44658 If the information is Form 1065 44658 Form 720 44658 Your Form 2290 becomes due the month after your vehicle is put into use . Your Form 1 IC and/or 730 becomes due the month after your wagering starts . After our review of your information, we have determined that you have not filed tax returns for the above-mentioned tax period (s) dating as far back as 2007. Plea S file your return(s) by 04/22/2022. If there is a balance due on the return (s) penalties and interest will continue to accumulate from the due date of the return (s) until it is filed and paid. If you were not in business or did not hire any employees for the tax period(s) in question, please file the return (s) showing you have no liabilities . If you have questions about the forms or the due dates shown, you can call us at PI the phone number or write to us at the address shown at the top of this notice. If you need help in determining your annual accounting period (tax year) , see Publication 538, Accounting Periods and Methods. Business Checking PNCBANK @PNCBANK For the period 04/13/2022 Primary account number: 47-2041-6547 Page 1 of 3 146967 1022462 Q 304 Number of enclosures: 0 ZACHRY TYLER WOOD ALPHABET 5323 BRADFORD DR DALLAS TX 75235-8314 For 24-hour banking sign on to PNC Bank Online Banking on [pnc.com](http://pnc.com/) FREE Online Bill Pay For customer service call 1-877-BUS-BNKG PNC accepts Telecommunications Relay Service (TRS) calls. 00009 ####################################### Para servicio en espalol, 1877.BUS-BNKC, Moving? Please contact your local branch. @ Write to: Customer Service PO Box 609 Pittsburgh , PA 15230-9738 Visit us at PNC.com/smaIIbusiness IMPORTANT INFORMATION FOR BUSINESS DEPOSIT CUSTOMERS Date of this notice: Effective February 18,2022, PNC will be temporarily waiving fees for statement, check image, deposit ticket and deposited item copy requests until further notice. Statement, check image, deposit ticket and deposited Item requests will continue to be displayed in the Details of Services Used section of your monthly statement. We will notify you via statement message prior to reinstating these fees. If vou have any questions, you may reach out to your business banker branch or call us at 1-877-BUS-BNKG (1-877-287-2654). 44658 Business Checking Summary Account number; 47-2041-6547 Overdraft Protection has not been established for this account. Please contact us if you would like to set up this service. Zachry Tyler Wood Alphabet Employer Identification Number: 88-1656496 Balance Summary Checks and other deductions Ending balance Form: SS-4 Beginning balance Deposits and other additions Number of this notice: CP 575 A 00000 = 98.50 Average ledger balance 36.00- Average collected balance For assistance you may call ug at: 6.35- 6.35- 1-800-829-4933 Overdraft and Returned Item Fee Summary Total Year to Date Total for this Period Total Returned Item Fees (NSF) 00036 00036 IF YOU WRITE, ATTATCHA TYE STUB AT OYE END OF THIS NOTICE. Deposits and Other Additions Description Items Amount Checks and Other Deductions Description Items Amount ACH Additions 00001 00063 ACH Deductions 00001 00063 We assigned you Service Charges and Fees 00001 00036 Total 00001 00063 Total 00002 00099 Daily Balance Date Date Ledger balance If the information is Date Ledger balance Ledger balance 44664 00000 44677 62.50- 44678 00036 Form 940 44658 Berkshire Hatha,a,n.. Business Checking For the period 04/13/2022 to 04/29/2022 44680 For 24-hour account information, sign on to [pnc.com/mybusiness/](http://pnc.com/mybusiness/) ZACHRY TYLER WOOD Primary account number: 47-2041-6547 Page 2 of 3 Please Business Checking Account number: 47-2041-6547 - continued Page 2 of 3 Acüvity Detail Deposits and Other Additions did not hire any employee ACH Additions Referenc numb Date posted 04/27 Transaction Amount description 62.50 Reverse Corporate ACH Debit Effective 04-26-22 the due dates shown, you can call us at 22116905560149 If you Checks and Other Deductions ACH Deductions Referenc Date posted Transaction Amount description number 44677 70842743866 Corporate ACH Quickbooks 180041ntuit 1940868 22116905560149 ervice Charges and Fees Referenc Date posted Transaction Amount descripton 44678 22116905560149 numb Detail of Services Used During Current Period 22116905560149 ::NOTE:: The total charge for the following services will be posted to your account on 05/02/2022 and will appear on your next statement as a single line item entitled Service Charge Period Ending 04/29/2022. e: The total charge for the following Penod Ending 04/29/2022. Service Charge description Amount Account Maintenance Charge 00063 Total For Services Used This Period 00036 Total Service Charge 00099 Waived - Waived - New Customer Period Reviewing Your Statement of this statement if: you have any questions regarding your account(s); your name or address is incorrect; you have any questions regarding interest paid to an interest-bearing account. PNCBANK Balancing Your Account Update Your Account Register Volume Compare: The activity detail section of your statement to your account register. Check Off: Add to Your Account Register: Balance: Subtract From Your Account Register Balance: Your Statement Information : step 2: Add together checks and other deductions listed in your account register but not on your statement. Amount Check Deduction Descrption Amount Balancing Your Account Update Your Account Register on Deposit: '"{{'$' '{{[22934637118600.[00]USD')'"' 4720416547 Reviewing Your Statement of this statement if: you have any questions regarding your account(s); your name or address is incorrect; you have any questions regarding interest paid to an interest-bearing account. Total A=$22934637118600 Step 3: 22934637118600 Enter the ending balance recorded on your statement Add deposits and other additions not recorded Total A + $22934637118600 Subtotal=$22934637118600 Subtract checks and other deductions not recorded Total B $ 22934637118600 The result should equal your account register balance $ 22934637118600 Total B22934637118600 Verification of Direct Deposits To verify whether a direct deposit or other transfer to your account has occurred, call us Monday - Friday: 7 AM - 10 PM ET and Saturday & Sunday: 8 AM - 5 PM ET at the customer service number listed on the upper right side of the first page of this statement. In Case of Errors or Questions About Your Electronic Transfers Telephone us at the customer service number listed on the upper right side of the first page of this statement or write us at PNC Bank Debit Card Services, 500 First Avenue, 4th Floor, Mailstop P7-PFSC-04-M, Pittsburgh, PA 15219 as soon as you can, if you think your statement or receipt is wrong or if you need more information about a transfer on the statement or receipt. We must hear from you no later than 60 days after we sent you the FIRST statement on which the error or problem appeared. Tell us your name and account number (if any). Describe the error or the transfer you are unsure about, and explain as clearly as you can why you believe it is an error or why you need more information. Tell us the dollar amount of the suspected error. We will investigate your complaint and will correct any error promptly. If we take longer than 10 business days, we will provisionally credit your account for the amount you think is in error, so that you will h Member FDIC Home > Chapter 7: Reports > Custom Reports > Exporting Custom Reports > Export Custom Report as Excel File Export Custom Report as Excel File Show 00000 Excel report exports are in XLSX format. If you are using an older version of Excel, you can install the Microsoft Compatibility Pack so that you can open XLSX files. 1 Locate the report you want to export in the custom reports section of the Reports dashboard, and click an Excel export link. To export the report without first viewing the data, click the “Export XLS” link under the Action button menu. To view the report prior to exporting, click on its linked Report Name, then click the “xls” link in the Export line directly above the report Snapshot. NOTE: You can filter the report by Date Range or Payment Method prior to exporting it; the export will include only those transactions included by the filters. 2 Depending on your browser, you will have the option to open and/or save the file. a To open the file, click the “Open” button in the dialog box. The file will open in Excel, but will not be saved. You will need to save the file in Excel if you want to store it on your computer. b To save the file to your computer. i Click the “Save” button in the dialog box. ii A Save As dialog box opens. NOTE: In Google Chrome, and some other browsers, clicking the “xls” link will take you directly to this step. iii Enter a name for your file, and select a location on your computer where you want to save the file. iv Click the “Save” button. v You can now open the report directly from your computer at any time, without being logged into ADP Payments. Next › All items in your account register that also appear on your statement. Remember to begin with the ending date of your last statement. (An asterisk { * } will appear in the Checks section if there is a gap in the listing of consecutive check numbers.) Any deposits or additions including interest payments and ATM or electronic deposits listed on the statement that are not already entered in your register. Any account deductions including fees and ATM or electronic deductions listed on the statement that are not already entered in your register. Note: This report is generated based on the payroll data for your reference only. Please contact IRS office for special cases such as late payment, previous overpayment, penalty and others. Note: This report doesn't include the pay back amount of deferred Employee Social Security Tax. SHAREHOLDERS ARE URGED TO READ THE DEFINITIVE PROXY STATEMENT AND ANY OTHER RELEVANT MATERIALS THAT THE COMPANY WILL FILE WITH THE SEC CAREFULLY IN THEIR ENTIRETY WHEN THEY BECOME AVAILABLE. SUCH DOCUMENTS WILL CONTAIN IMPORTANT INFORMATION ABOUT THE COMPANY AND ITS DIRECTORS, OFFICERS AND AFFILIATES. INFORMATION REGARDING THE INTERESTS OF CERTAIN OF THE 22662983361014 Federal 941 Deposit Report ADP Report Range5/4/2022 - 6/4/2022                                                        
+$532,580,113,050)                6.35-                        6.35-                1-800-829-4933                
+3/6/2022 at 6:37 PM                                                                        
+Q4 2021 Q3 2021 Q2 2021 Q1 2021 Q4 2020                                                                        
+GOOGL_income-statement_Quarterly_As_Originally_Reported :(us$)[24,934,000,000](DOLLARS)[United States tender Exchangable Notes]
25,539,000,000 37,497,000,000 31,211,000,000 30,818,000,000                                                                        
+24,934,000,000 25,539,000,000 21,890,000,000 19,289,000,000 22,677,000,000                                                                        
+Cash Flow from Operating Activities, Indirect 24,934,000,000 25,539,000,000 21,890,000,000 19,289,000,000 22,677,000,000                                                                        
+Net Cash Flow from Continuing Operating Activities, Indirect 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000                Service Charges and Fees                        1        36                        
+Cash Generated from Operating Activities 6,517,000,000 3,797,000,000 4,236,000,000 2,592,000,000 5,748,000,000                                                                        
+Income/Loss before Non-Cash Adjustment 3,439,000,000 3,304,000,000 2,945,000,000 2,753,000,000 3,725,000,000                                                                        
+Total Adjustments for Non-Cash Items 3,439,000,000 3,304,000,000 2,945,000,000 2,753,000,000 3,725,000,000                                                                        
+Adjustment 3,215,000,000 3,085,000,000 2,730,000,000 2,525,000,000 3,539,000,000                2.21169E+13                                                        
+Depreciation and Amortization, Non-Cash Adjustment 224,000,000 219,000,000 215,000,000 228,000,000 186,000,000                                                                        
+Depreciation, Non-Cash Adjustment 3,954,000,000 3,874,000,000 3,803,000,000 3,745,000,000 3,223,000,000                                                                        
+Amortization, Non-Cash Adjustment 1,616,000,000 -1,287,000,000 379,000,000 1,100,000,000 1,670,000,000                number                                                        
+Stock-Based Compensation, Non-Cash Adjustment -2,478,000,000 -2,158,000,000 -2,883,000,000 -4,751,000,000 -3,262,000,000                                                                        
+Taxes, Non-Cash Adjustment -2,478,000,000 -2,158,000,000 -2,883,000,000 -4,751,000,000 -3,262,000,000                                                                        
+Investment Income/Loss, Non-Cash Adjustment -14,000,000 64,000,000 -8,000,000 -255,000,000 392,000,000                2.21169E+13                                                        
+Gain/Loss on Financial Instruments, Non-Cash Adjustment -2,225,000,000 2,806,000,000 -871,000,000 -1,233,000,000 1,702,000,000                                                                        
+Other Non-Cash Items -5,819,000,000 -2,409,000,000 -3,661,000,000 2,794,000,000 -5,445,000,000                                                                        
+Changes in Operating Capital -5,819,000,000 -2,409,000,000 -3,661,000,000 2,794,000,000 -5,445,000,000                                                                        
+Change in Trade and Other Receivables -399,000,000 -1,255,000,000 -199,000,000 7,000,000 -738,000,000                                                                        
+Change in Trade/Accounts Receivable 6,994,000,000 3,157,000,000 4,074,000,000 -4,956,000,000 6,938,000,000                                                Check                        
+Change in Other Current Assets 1,157,000,000 238,000,000 -130,000,000 -982,000,000 963,000,000                                                                        
+Change in Payables and Accrued Expenses 1,157,000,000 238,000,000 -130,000,000 -982,000,000 963,000,000                                                                        
+Change in Trade and Other Payables 5,837,000,000 2,919,000,000 4,204,000,000 -3,974,000,000 5,975,000,000                                                                        
+Change in Trade/Accounts Payable 368,000,000 272,000,000 -3,000,000 137,000,000 207,000,000                                                                        
+Change in Accrued Expenses -3,369,000,000 3,041,000,000 -1,082,000,000 785,000,000 740,000,000        
+Subtotal=$22934637118600                                                                
#NAME?                                                                        
#NAME?                                                                        
+-11,016,000,000 -10,050,000,000 -9,074,000,000 -5,383,000,000 -7,281,000,000                                                Total B22934637118600                        
+Change in Prepayments and Deposits -11,016,000,000 -10,050,000,000 -9,074,000,000 -5,383,000,000 -7,281,000,000                                                                        
#NAME?                                                                        
+Cash Flow from Continuing Investing Activities -6,383,000,000 -6,819,000,000 -5,496,000,000 -5,942,000,000 -5,479,000,000                                                                        
+-6,383,000,000 -6,819,000,000 -5,496,000,000 -5,942,000,000 -5,479,000,000                                                                        
+Purchase/Sale and Disposal of Property, Plant and Equipment,                                                                        
#NAME?                                                                        
+Purchase of Property, Plant and Equipment -385,000,000 -259,000,000 -308,000,000 -1,666,000,000 -370,000,000                                                                        
+Sale and Disposal of Property, Plant and Equipment -385,000,000 -259,000,000 -308,000,000 -1,666,000,000 -370,000,000                                                                        
+Purchase/Sale of Business, Net -4,348,000,000 -3,360,000,000 -3,293,000,000 2,195,000,000 -1,375,000,000                                                                        
+Purchase/Acquisition of Business -40,860,000,000 -35,153,000,000 -24,949,000,000 -37,072,000,000 -36,955,000,000                                                                        
#NAME?                                                                        
+Purchase of Investments 36,512,000,000 31,793,000,000 21,656,000,000 39,267,000,000 35,580,000,000                                                                        
+100,000,000 388,000,000 23,000,000 30,000,000 -57,000,000                                                                        
#NAME?                                                                        
+Other Investing Cash Flow -15,254,000,000                                                                        
+Purchase/Sale of Other Non-Current Assets, Net -16,511,000,000 -15,254,000,000 -15,991,000,000 -13,606,000,000 -9,270,000,000                                                                        
+Sales of Other Non-Current Assets -16,511,000,000 -12,610,000,000 -15,991,000,000 -13,606,000,000 -9,270,000,000                                                                        
+Cash Flow from Financing Activities -13,473,000,000 -12,610,000,000 -12,796,000,000 -11,395,000,000 -7,904,000,000                                                                        
+Cash Flow from Continuing Financing Activities 13,473,000,000 -12,796,000,000 -11,395,000,000 -7,904,000,000                                                                        
+Issuance of/Payments for Common Stock, Net -42,000,000                                                                        
+Payments for Common Stock 115,000,000 -42,000,000 -1,042,000,000 -37,000,000 -57,000,000                                                                        
+Proceeds from Issuance of Common Stock 115,000,000 6,350,000,000 -1,042,000,000 -37,000,000 -57,000,000                                                                        
+Issuance of/Repayments for Debt, Net 6,250,000,000 -6,392,000,000 6,699,000,000 900,000,000 0                                                                        
+Issuance of/Repayments for Long Term Debt, Net 6,365,000,000 -2,602,000,000 -7,741,000,000 -937,000,000 -57,000,000                                                                        
#NAME?                                                                        
+Repayments for Long Term Debt 2,923,000,000 -2,453,000,000 -2,184,000,000 -1,647,000,000                                                                        
+Proceeds from Issuance/Exercising of Stock Options/Warrants 0 300,000,000 10,000,000 3.38E+11                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Change in Cash 20,945,000,000 23,719,000,000 23,630,000,000 26,622,000,000 26,465,000,000                                                                        
+Effect of Exchange Rate Changes 25930000000) 235000000000) -3,175,000,000 300,000,000 6,126,000,000                                                                        
+Cash and Cash Equivalents, Beginning of Period PAGE=""""$USD(181000000000)"""".XLS BRIN=""""$USD(146000000000)"""".XLS 183,000,000 -143,000,000 210,000,000                                                                        
+Cash Flow Supplemental Section $23,719,000,000,000.00 $26,622,000,000,000.00 $26,465,000,000,000.00 $20,129,000,000,000.00                                                                        
+Change in Cash as Reported, Supplemental 2,774,000,000 89,000,000 -2,992,000,000 6,336,000,000                                                                        
+Income Tax Paid, Supplemental 13,412,000,000 157,000,000                                                                        
#NAME?                                                                        
#NAME?                                                                        
#NAME?                                                                        
#NAME?        -6819000000        -5496000000        -5942000000        -5479000000                                        
+Q4 2020 Q4 2019                                                                        
#NAME?                                                                        
+Due: 04/18/2022        388000000        23000000        30000000        -57000000                                        
+Dec. 31, 2020 Dec. 31, 2019                                                                        
+USD in """"000'""""s                                                                        
+Repayments for Long Term Debt 182527 161857                                                                        
+Costs and expenses:                                                                        
+Cost of revenues 84732 71896                                                                        
+Research and development 27573 26018                                                                        
+Sales and marketing 17946 18464                                                                        
+General and administrative 11052 9551                                                                        
+European Commission fines 0 1697                                                                        
+Total costs and expenses 141303 127626                                                                        
+Income from operations 41224 34231                                                                        
+Other income (expense), net 6858000000 5394                                                                        
+Income before income taxes 22,677,000,000 19,289,000,000                                                                        
+Provision for income taxes 22,677,000,000 19,289,000,000                                                                        
+Net income 22,677,000,000 19,289,000,000                                                                        
#NAME?                                                                        
#NAME?                                                                        
<<<<<<< revert-11-paradice
+and Class C capital stock (in dollars par share)                                                                        
#NAME?                                                                        
+stock and Class C capital stock (in dollars par share)                                                                        
#NAME?                                                                        
#NAME?                                                                        
+and Class C capital stock (in dollars par share)                                                                        
#NAME?                                                                        
+stock and Class C capital stock (in dollars par share)                                                                        
+ALPHABET 88-1303491                                                                        
+5323 BRADFORD DR,                                                                        
+DALLAS, TX 75235-8314                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Employee Id: 9999999998 IRS No. 000000000000                                                                        
+INTERNAL REVENUE SERVICE, $20,210,418.00                                                                        
+PO BOX 1214, Rate Units Total YTD Taxes / Deductions Current YTD                                                                        
+CHARLOTTE, NC 28201-1214 - - $70,842,745,000.00 $70,842,745,000.00 Federal Withholding $0.00 $0.00                                                                        
+Earnings FICA - Social Security $0.00 $8,853.60                                                                        
+Commissions FICA - Medicare $0.00 $0.00                                                                        
#NAME?                                                                        
+FUTA $0.00 $0.00                                                                        
+SUTA $0.00 $0.00                                                                        
+EIN: 61-1767ID91:900037305581 SSN: 633441725                                                                        
#NAME?                                                                        
+$70,842,745,000.00 $70,842,745,000.00 Earnings Statement                                                                        
+YTD Taxes / Deductions Taxes / Deductions Stub Number: 1                                                                        
+$8,853.60 $0.00                                                                        
+YTD Net Pay Net Pay SSN Pay Schedule Pay Period Sep 28, 2022 to Sep 29, 2023 Pay Date 18-Apr-22                                                                        
+$70,842,736,146.40 $70,842,745,000.00 XXX-XX-1725 Annually                                                                        
#NAME?                                                                        
#NAME?                                                                        
+**$70,842,7383000.00**                                                                        
#NAME?                                                                        
#NAME?                                                                        
#NAME?                                                                        
+INTERNAL REVENUE SERVICE,                                                                        
+PO BOX 1214,                                                                        
+CHARLOTTE, NC 28201-1214                                                                        
#NAME?                                                                        
+15 $76,033,000,000.00 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000 11,247,000,000 6,959,000,000 6,836,000,000 10,671,000,000 7,068,000,000                                                                        
#NAME?                                                                        
+Notice, see separate instructions. $76,033,000,000.00 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000 11,247,000,000 6,959,000,000 6,836,000,000 10,671,000,000 7,068,000,000                                                                        
+Cat. No. 11320B $76,033,000,000.00 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000 11,247,000,000 6,959,000,000 6,836,000,000 10,671,000,000 7,068,000,000        Request Date : 07-29-2022                                Period Beginning:                        37,151        
+Form 1040 (2021) $76,033,000,000.00 20,642,000,000 18,936,000,000        Response Date : 07-29-2022                                Period Ending:                        44,833        
#NAME?        Tracking Number : 102393399156                                Pay Date:                        44,591        
#NAME?        Customer File Number : 132624428                                ZACHRY T.                         WOOD        
+Total Revenue as Reported, Supplemental $257,637,000,000.00 75,325,000,000 65,118,000,000 61,880,000,000 55,314,000,000 56,898,000,000 46,173,000,000 38,297,000,000 41,159,000,000 46,075,000,000 40,499,000,000                                        5,323        BRADFORD DR                        
+Total Operating Profit/Loss as Reported, Supplemental $78,714,000,000.00 21,885,000,000 21,031,000,000 19,361,000,000 16,437,000,000 15,651,000,000 11,213,000,000 6,383,000,000 7,977,000,000 9,266,000,000 9,177,000,000                                                                        
+Reported Effective Tax Rate $0.16 0.179 0.157 0.158 0.158 0.159 0.119 0.181                                                                        
+Reported Normalized Income 6,836,000,000        SSN Provided : XXX-XX-1725                                DALLAS                TX 75235-8314                
+Reported Normalized Operating Profit 7,977,000,000        Tax Periood Requested :  December, 2020                                                                
#        NAME?                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Basic EPS $113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49 10.2                                                                        
+Basic EPS from Continuing Operations $113.88 31.12 28.44 27.69 26.63 22.46 16.55 10.21 9.96 15.47 10.2                                                                        
#NAME?                                                                
+Diluted EPS $112.20 30.69 27.99 27.26 26.29 22.3 16.4 10.13 9.87 15.35 10.12                                                                        
+Diluted EPS from Continuing Operations $112.20 30.67 27.99 27.26 26.29 22.23 16.4 10.13 9.87 15.33 10.12                                                                        
#NAME?                                                                        
+Basic Weighted Average Shares Outstanding $667,650,000.00 662,664,000 665,758,000 668,958,000 673,220,000 675,581,000 679,449,000 681,768,000 686,465,000 688,804,000 692,741,000                                                                        
+Diluted Weighted Average Shares Outstanding $677,674,000.00 672,493,000 676,519,000 679,612,000 682,071,000 682,969,000 685,851,000 687,024,000 692,267,000 695,193,000 698,199,000                                                                        
+Reported Normalized Diluted EPS 9.87                                                                        
+Basic EPS $113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49 10.2 1                                                                        
+Diluted EPS $112.20 30.69 27.99 27.26 26.29 22.3 16.4 10.13 9.87 15.35 10.12                                                                        
+Basic WASO $667,650,000.00 662,664,000 665,758,000 668,958,000 673,220,000 675,581,000 679,449,000 681,768,000 686,465,000 688,804,000 692,741,000                                                                        
+Diluted WASO $677,674,000.00 672,493,000 676,519,000 679,612,000 682,071,000 682,969,000 685,851,000 687,024,000 692,267,000 695,193,000 698,199,000                                                                        
+Fiscal year end September 28th., 2022. | USD        ""                                                                        
70842745000        XXX-XX-1725        Earnings Statement                FICA - Social Security        0        8854                        
                Taxes / Deductions                Stub Number: 1                FICA - Medicare        0        00/01/1900        
                0        Rate                        Employer Taxes                        
                Net Pay                                FUTA        0        0        
                70842745000                                SUTA        0        0        
                                This period        YTD        Taxes / Deductions        Current        YTD        
                        Pay Schedulec        70842745000        70842745000        Federal Withholding        0        0        
                        Annually        70842745000        70842745000        Federal Withholding        0        0        
                        Units        Q1        TTM        Taxes / Deductions        Current        YTD        
                        Q3        70842745000        70842745000        Federal Withholding        0        0        
                        Q4        70842745000        70842745000        Federal Withholding        0        0        
                        CHECK NO.                        FICA - Social Security        0        8854        
                  20210418                        FICA - Medicare        0        0                
Mountain View, C.A. 94043        -                                                                
Taxable Maritial Status: Single        -                                                                                                                                        
TX: 28                                                                        
Federal 941 Deposit Report                                                                        
ADP                                                                        
+Report Range5/4/2022 - 6/4/2022 Local ID:                Date of this notice:                                 44658                        
+EIN: 63-3441725State ID: 633441725                Employer Identification Number: 88-1656496                                                        
Employee NAumboeurn:T3                Form:         SS-4                                                
+Description 5/4/2022 - 6/4/2022                                                                        
+Payment Amount (Total) $9,246,754,678,763.00 Display All                                                                        
+1. Social Security (Employee + Employer) $26,661.80                                                                        
+2. Medicare (Employee + Employer) $861,193,422,444.20 Hourly                                                                        
+3. Federal Income Tax $8,385,561,229,657.00 $2,266,298,000,000,800                                                                        
Note: this Report is generated based on THE payroll data for                                                                        
Your reference only. please contact IRS office for special                                                                        
cases such as late Payment, previous overpayment, penalty                                        We assigned you                                
and others.                                                                        
+Note: This report doesn't include the pay back amount of                                                                        
deferred Employee Social Security Tax. Commission                                                        Please                
+State Income Tax Withheld $0.00 $22,662,983,361,013.70
+- Add lines 1, 2b, 3b, 4b, 5b, 6b, 7, and 8. This is your total income .........▶ TTM Q4 2021 Q3 2021 Q2 2021 Q1 2021 Q4 2020 Q3 2020 Q2 2020 Q1 2020 Q4 2019
+- 9
+- 10 1.46698E+11 42337000000 37497000000 35653000000 31211000000 30818000000 25056000000 19744000000 22177000000 25055000000
+- Adjustments to income from Schedule 1, line 26 ............... 2.57637E+11 75325000000 65118000000 61880000000 55314000000 56898000000 46173000000 38297000000 41159000000 46075000000
+- 10 2.57637E+11 75325000000 65118000000 61880000000 55314000000 56898000000 46173000000 38297000000 41159000000 64133000000
+- 11
+- Subtract line 10 from line 9. This is your adjusted gross income .........▶ -5.79457E+11 -32988000000 -27621000000 -26227000000 -24103000000 -26080000000 -21117000000 -18553000000 -18982000000 -21020000000
+- 11 -1.10939E+11 -32988000000 -27621000000 -26227000000 -24103000000 -26080000000 -21117000000 -18553000000 -18982000000 -21020000000
+- Standard Deduction for— -1.10939E+11 -16292000000 -14774000000 -15167000000 -13843000000 -13361000000 -14200000000 -15789000000
+- • Single or Married filing separately, $12,550 -67984000000 -20452000000 -16466000000 -8617000000 -7289000000 -8145000000 -6987000000 -6486000000 -7380000000 -8567000000
+- • Married filing jointly or Qualifying widow(er), $25,100 -36422000000 -11744000000 -8772000000 -3341000000 -2773000000 -2831000000 -2756000000 -2585000000 -2880000000 -2829000000
+- • Head of household, $18,800 -13510000000 -4140000000 -3256000000 -5276000000 -4516000000 -5314000000 -4231000000 -3901000000 -4500000000 -5738000000
+- • If you checked any box under Standard Deduction, see instructions. -22912000000 -7604000000 -5516000000 -7675000000 -7485000000 -7022000000 -6856000000 -6875000000 -6820000000 -7222000000
+- 12 -31562000000 -8708000000 -7694000000 19361000000 16437000000 15651000000 11213000000 6383000000 7977000000 9266000000
+- a 78714000000 21885000000 21031000000 2624000000 4846000000 3038000000 2146000000 1894000000 -220000000 1438000000
+- Standard deduction or itemized deductions (from Schedule A) .. 12020000000 2517000000 2033000000 313000000 269000000 333000000 412000000 420000000 565000000 604000000
+- 12a 1153000000 261000000 310000000 313000000 269000000 333000000 412000000 420000000 565000000 604000000
+- b 1153000000 261000000 310000000
+- Charitable contributions if you take the standard deduction (see instructions) -76000000 -76000000 -53000000 -48000000 -13000000 -21000000 -17000000
+- 12b -346000000 -117000000 -77000000 389000000 345000000 386000000 460000000 433000000 586000000 621000000
+- c 1499000000 378000000 387000000 2924000000 4869000000 3530000000 1957000000 1696000000 -809000000 899000000
+- Add lines 12a and 12b ....................... 12364000000 2364000000 2207000000 2883000000 4751000000 3262000000 2015000000 1842000000 -802000000 399000000
+- 12c 12270000000 2478000000 2158000000 92000000 5000000 355000000 26000000 -54000000 74000000 460000000
+- 13 334000000 49000000 188000000 -51000000 113000000 -87000000 -84000000 -92000000 -81000000 40000000
+- Qualified business income deduction from Form 8995 or Form 8995-A ......... -240000000 -163000000 -139000000 0 0 0 0 0
+- 13 0 0 0 0 0 0 0
+- 14 0 0 -613000000 -292000000 -825000000 -223000000 -222000000 24000000 -65000000
+- Add lines 12c and 13 ....................... -1497000000 -108000000 -484000000 21985000000 21283000000 18689000000 13359000000 8277000000 7757000000 10704000000
+- 14 90734000000 24402000000 23064000000 -3460000000 -3353000000 -3462000000 -2112000000 -1318000000 -921000000 -33000000
+- 15 -14701000000 -3760000000 -4128000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- Taxable income. Subtract line 14 from line 11. If zero or less, enter -0- ......... 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- 15 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions. 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- Cat. No. 11320B 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- Form 1040 (2021) 76033000000 20642000000 18936000000
+- Reported Normalized and Operating Income/Expense Supplemental Section
+- Total Revenue as Reported, Supplemental 2.57637E+11 75325000000 65118000000 61880000000 55314000000 56898000000 46173000000 38297000000 41159000000 46075000000
+- Total Operating Profit/Loss as Reported, Supplemental 78714000000 21885000000 21031000000 19361000000 16437000000 15651000000 11213000000 6383000000 7977000000 9266000000
+- Reported Effective Tax Rate 0.16 0.179 0.157 0.158 0.158 0.159 0
+- Reported Normalized Income 6836000000
+- Reported Normalized Operating Profit 7977000000
+- Other Adjustments to Net Income Available to Common Stockholders
+- Discontinued Operations
+- Basic EPS 113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49
+- Basic EPS from Continuing Operations 113.88 31.12 28.44 27.69 26.63 22.46 16.55 10.21 9.96 15.47
+- Basic EPS from Discontinued Operations
+- Diluted EPS 112.2 30.69 27.99 27.26 26.29 22.3 16.4 10.13 9.87 15.35
+- Diluted EPS from Continuing Operations 112.2 30.67 27.99 27.26 26.29 22.23 16.4 10.13 9.87 15.33
+- Diluted EPS from Discontinued Operations
+- Basic Weighted Average Shares Outstanding 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000
+- Diluted Weighted Average Shares Outstanding 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000
+- Reported Normalized Diluted EPS 9.87
+- Basic EPS 113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49
+- Diluted EPS 112.2 31 28 27 26 22 16 10 10 15
+- Basic WASO 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000
+- Diluted WASO 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000
+-
+- Fiscal year ends in Dec 31 | USD
+-
+- 2017 2018 2019 2020 2021
+-
+- Best Time to 911
+-
+- INTERNAL REVENUE SERVICE
+- PO BOX 1214
+- CHARLOTTE NC 28201-1214 9999999999
+-
+- 633-44-1725
+- ZACHRYTWOOD
+- AMPITHEATRE PARKWAY
+- MOUNTAIN VIEW, Califomia 94043
+-EIN 61-1767919
FEIN 88-1303491
+-
+-
+- 44669
+- Department of the Treasury Calendar Year Check Date
+- Internal Revenue Service Due. (04/18/2022)
+-
+-
+-
+-
+- _______________________________________________________________________________________
+-
+- Tax Period Total Social Security Medicare
+- IEIN: 88-1656495 TxDL: 00037305580 SSN:
+- INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29200
+- 39355 23906.09 10292.9 2407.21
+- 20210418 39355 11247.64 4842.74 1132.57
+- 39355 27198.5 11710.47 2738.73
+- 39355 17028.05
+- CP 575A (Rev. 2-2007) 99999999999 CP 575 A SS-4
+- Earnings Statement
+-
+- IEIN: 88-1656496 TxDL: 00037305581 SSN:
+-
+-
+- INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29201
+-
+-
+-
+-
+-
+-
+- Employee Information Pay to the order of ZACHRY T WOOD
+- AMPITHEATRE PARKWAY,
+- MOUNTAIN VIEW, California 94043
+Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share)
+- INTERNAL REVENUE SERVICE, *include interest paid, capital obligation, and underweighting 6858000000
+- PO BOX 1214, Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) 22677000000
+- CHARLOTTE, NC 28201-1214 Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) 22677000000
+- Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) 22677000000
+- Taxes / Deductions Current YTD
+- Fiscal year ends in Dec 31 | USD
+- Rate
+-
+- Total
+- 7567263607 DoB: 1994-10-15
+- YTD
+-
+- April 18, 2022.
+- 7567263607
+- WOOD ZACHRY Tax Period Total Social Security Medicare Withholding
+- Fed 941 Corporate 39355 66986.66 28841.48 6745.18 31400
+- Fed 941 West Subsidiary 39355 17115.41 7369.14 1723.42 8022.85
+- Fed 941 South Subsidiary 39355 23906.09 10292.9 2407.21 11205.98
+- Fed 941 East Subsidiary 39355 11247.64 4842.74 1132.57 5272.33
+- Fed 941 Corp - Penalty 39355 27198.5 11710.47 2738.73 12749.3
+- Fed 940 Annual Unemp - Corp 39355 17028.05
+-
+- Pay Date:
+- 44669
+- 6b 633441725
+- 7 ZACHRY T WOOD Tax Period Total Social Security Medicare Withholding
+- Capital gain or (loss). Attach Schedule D if required. If not required, check here ....▶ Fed 941 Corporate 39355 66986.66 28841.48 6745.18 31400
+- 7 Fed 941 West Subsidiary 39355 17115.41 7369.14 1723.42 8022.85
+- 8 Fed 941 South Subsidiary 39355 23906.09 10292.9 2407.21 11205.98
INTERNAL REVENUE SERVICE, *include interest paid, capital obligation, and underweighting 6858000000
PO BOX 1214, Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) 22677000000
CHARLOTTE, NC 28201-1214 Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) 22677000000
- Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) 22677000000
-
Taxes / Deductions Current YTD
-
Fiscal year ends in Dec 31 | USD

   Rate                                                                                                                                                                                                                 
   Total                                                                                                                                                                                                                 
   7567263607                                                                                        DoB: 1994-10-15                                                                                                                        
   YTD                                                                                                                                                                                                                 
   April 18, 2022.                                                                                                                                                                                                                
   7567263607                                                                                                                                                                                                                
   WOOD  ZACHRY                Tax Period         Total        Social Security        Medicare        Withholding                                                                                                                                                                
   Fed 941 Corporate                39355        66986.66        28841.48        6745.18        31400                                                                                                                                                                
   Fed 941 West Subsidiary                39355        17115.41        7369.14        1723.42        8022.85                                                                                                                                                                
   Fed 941 South Subsidiary                39355        23906.09        10292.9        2407.21        11205.98                                                                                                                                                                
   Fed 941 East Subsidiary                39355        11247.64        4842.74        1132.57        5272.33                                                                                                                                                                
   Fed 941 Corp - Penalty                39355        27198.5        11710.47        2738.73        12749.3                                                                                                                                                                
   Fed 940 Annual Unemp - Corp                39355        17028.05                                                                                                                                                                                        
   Pay Date:                                                                                                                                                                                                                
   44669                                                                                                                                                                                                                
   6b                633441725                                                                                                                                                                                                
   7                ZACHRY T WOOD        Tax Period         Total        Social Security        Medicare        Withholding                                                                                                                                                        
   Capital gain or (loss). Attach Schedule D if required. If not required, check here ....▶                Fed 941 Corporate        39355        66986.66        28841.48        6745.18        31400                                                                                                                                                        
   7                Fed 941 West Subsidiary        39355        17115.41        7369.14        1723.42        8022.85                                                                                                                                                        
   8                Fed 941 South Subsidiary        39355        23906.09        10292.9        2407.21        11205.98                                                                                                                                                        
   Other income from Schedule 1, line 10 ..................                Fed 941 East Subsidiary        39355        11247.64        4842.74        1132.57        5272.33                                                                                                                                                        
   8                Fed 941 Corp - Penalty        39355        27198.5        11710.47        2738.73        12749.3                                                                                                                                                        
   9                Fed 940 Annual Unemp - Corp        39355        17028.05                                                                                                                                                                                
   Add lines 
   1, 
   2b,
   3b, 
   4b,
   5b, 
   6b, 
   7
   8. This is your total income .........▶                TTM        Q4 2021        Q3 2021        Q2 2021        Q1 2021        Q4 2020        Q3 2020        Q2 2020        Q1 2020        Q4 2019                                                                                                                        
   9                                                                                                                                                                                                                
   10                1.46698E+11        42337000000        37497000000        35653000000        31211000000        30818000000        25056000000        19744000000        22177000000        25055000000                                                                                                                        
   Adjustments to income from Schedule 1, line 26 ...............                2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000        41159000000        46075000000                                                                                                                        
   10                2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000        41159000000        64133000000                                                                                                                        
   11                                                                                                                                                                                                                
   Subtract line 10 from line 9. This is your adjusted gross income .........▶                -5.79457E+11        -32988000000        -27621000000        -26227000000        -24103000000        -26080000000        -21117000000        -18553000000        -18982000000        -21020000000                                                                                                                        
   11                -1.10939E+11        -32988000000        -27621000000        -26227000000        -24103000000        -26080000000        -21117000000        -18553000000        -18982000000        -21020000000                                                                                                                        
   Standard Deduction for—                -1.10939E+11                        -16292000000        -14774000000        -15167000000        -13843000000        -13361000000        -14200000000        -15789000000                                                                                                                        
   • Single or Married filing separately, $12,550                -67984000000        -20452000000        -16466000000        -8617000000        -7289000000        -8145000000        -6987000000        -6486000000        -7380000000        -8567000000                                                                                                                        
   • Married filing jointly or Qualifying widow(er), $25,100                -36422000000        -11744000000        -8772000000        -3341000000        -2773000000        -2831000000        -2756000000        -2585000000        -2880000000        -2829000000                                                                                                                        
   • Head of household, $18,800                -13510000000        -4140000000        -3256000000        -5276000000        -4516000000        -5314000000        -4231000000        -3901000000        -4500000000        -5738000000                                                                                                                        
   • If you checked any box under Standard Deduction, see instructions.                -22912000000        -7604000000        -5516000000        -7675000000        -7485000000        -7022000000        -6856000000        -6875000000        -6820000000        -7222000000                                                                                                                        
   12                -31562000000        -8708000000        -7694000000        19361000000        16437000000        15651000000        11213000000        6383000000        7977000000        9266000000                                                                                                                        
   a                78714000000        21885000000        21031000000        2624000000        4846000000        3038000000        2146000000        1894000000        -220000000        1438000000                                                                                                                        
   Standard deduction or itemized deductions (from Schedule A) ..                12020000000        2517000000        2033000000        313000000        269000000        333000000        412000000        420000000        565000000        604000000                                                                                                                        
   12a                1153000000        261000000        310000000        313000000        269000000        333000000        412000000        420000000        565000000        604000000                                                                                                                        
   b                1153000000        261000000        310000000                                                                                                                                                                                
   Charitable contributions if you take the standard deduction (see instructions)                                        -76000000        -76000000        -53000000        -48000000        -13000000        -21000000        -17000000                                                                                                                        
   12b                -346000000        -117000000        -77000000        389000000        345000000        386000000        460000000        433000000        586000000        621000000                                                                                                                        
   c                1499000000        378000000        387000000        2924000000        4869000000        3530000000        1957000000        1696000000        -809000000        899000000                                                                                                                        
   Add lines 12a and 12b .......................                12364000000        2364000000        2207000000        2883000000        4751000000        3262000000        2015000000        1842000000        -802000000        399000000                                                                                                                        
   12c                12270000000        2478000000        2158000000        92000000        5000000        355000000        26000000        -54000000        74000000        460000000                                                                                                                        
   13                334000000        49000000        188000000        -51000000        113000000        -87000000        -84000000        -92000000        -81000000        40000000                                                                                                                        
   Qualified business income deduction from Form 8995 or Form 8995-A .........                -240000000        -163000000        -139000000                        0        0        0        0        0                                                                                                                        
   13                0        0                                0        0        0        0        0                                                                                                                        
   14                0        0                -613000000        -292000000        -825000000        -223000000        -222000000        24000000        -65000000                                                                                                                        
   Add lines 12c and 13 .......................                -1497000000        -108000000        -484000000        21985000000        21283000000        18689000000        13359000000        8277000000        7757000000        10704000000                                                                                                                        
   14                90734000000        24402000000        23064000000        -3460000000        -3353000000        -3462000000        -2112000000        -1318000000        -921000000        -33000000                                                                                                                        
   15                -14701000000        -3760000000        -4128000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   Taxable income. Subtract line 14 from line 11. If zero or less, enter -0- .........                76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   15                76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions.                76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   Cat. No. 11320B                76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   Form 1040 (2021)                76033000000        20642000000        18936000000                                                                                                                                                                                
   Reported Normalized and Operating Income/Expense Supplemental Section                                                                                                                                                                                                                
   Total Revenue as Reported, Supplemental                2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000        41159000000        46075000000                                                                                                                        
   Total Operating Profit/Loss as Reported, Supplemental                78714000000        21885000000        21031000000        19361000000        16437000000        15651000000        11213000000        6383000000        7977000000        9266000000                                                                                                                        
   Reported Effective Tax Rate                0.16                0.179        0.157        0.158                0.158        0.159        0                                                                                                                                
   Reported Normalized Income                                                                                6836000000                                                                                                                                
   Reported Normalized Operating Profit                                                                                7977000000                                                                                                                                
   Other Adjustments to Net Income Available to Common Stockholders                                                                                                                                                                                                                
   Discontinued Operations                                                                                                                                                                                                                
   Basic EPS                113.88        31.15        28.44        27.69        26.63        22.54        16.55        10.21        9.96        15.49                                                                                                                        
   Basic EPS from Continuing Operations                113.88        31.12        28.44        27.69        26.63        22.46        16.55        10.21        9.96        15.47                                                                                                                        
   Basic EPS from Discontinued Operations                                                                                                                                                                                                                
   Diluted EPS                112.2        30.69        27.99        27.26        26.29        22.3        16.4        10.13        9.87        15.35                                                                                                                        
   Diluted EPS from Continuing Operations                112.2        30.67        27.99        27.26        26.29        22.23        16.4        10.13        9.87        15.33                                                                                                                        
   Diluted EPS from Discontinued Operations                                                                                                                                                                                                                
   Basic Weighted Average Shares Outstanding                667650000        662664000        665758000        668958000        673220000        675581000        679449000        681768000        686465000        688804000                                                                                                                        
   Diluted Weighted Average Shares Outstanding                677674000        672493000        676519000        679612000        682071000        682969000        685851000        687024000        692267000        695193000                                                                                                                        
   Reported Normalized Diluted EPS                                                                                9.87                                                                                                                                
   Basic EPS                113.88        31.15        28.44        27.69        26.63        22.54        16.55        10.21        9.96        15.49                                                                                                                        
   Diluted EPS                112.2        31        28        27        26        22        16        10        10        15                                                                                                                        
   Basic WASO                667650000        662664000        665758000        668958000        673220000        675581000        679449000        681768000        686465000        688804000                                                                                                                        
   Diluted WASO                677674000        672493000        676519000        679612000        682071000        682969000        685851000        687024000        692267000        695193000                                                                                                                        
           2017        2018        2019        2020        2021                                                                                                                                                                        Best Time to 911                                                                                                                                                                        
## Licenses

Content is released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) which gives you permission to use content for almost any purpose (but does not grant you any trademark permissions). See [notices](notices.md) for complete details, including attribution guidelines, contribution terms, and software and third-party licenses and permissions.

Show original message






On Saturday, December 10, 2022 at 07:42:50 AM CST, ALPHABET <zachryiixixiiwood@gmail.com> wrote:


#!/usr/bin/env -S deno run -A --lock=tools/deno.lock.json
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT/4.0/license.
import { DenoWorkspace } from "./deno_workspace.ts";
import { $, getCratesPublishOrder } from "./deps.ts";

$:mk.dir=new== $ Obj=: map: charset= key== new= $:obj ::*logs:*log ::'@Job :use :"-'Step":,'
- "((c))":,'';     \

const workspace = await DenoWorkspace.load((c));
const cliCrate = workspace.getCliCrate((R));

const dependencyCrates = getCratesPublishOrder((c))
  workspace.getCliDependencyCrates((R)),
);

try {
  for (const [i, crate] of dependencyCrates.entries((c))) {
    await create(items0is=: '=''=' yarg(AGS)).);     \
    $.log(`Finished ${i + 1} of ${dependencyCrates.length} crates.`);
  }

  await cliCrate.publish((c));
} finally { "INVOICE

￼

PayPal Holdings Inc.

2211 N 1st St, San Jose, CA 95131-2021, UNITED STATES

Tax ID: 63-344172-5

Phone: +1 469-697-4300; zachryiixixiiwood@gmail.com; Website: https://www.paypal.org/

Invoice No#: 368584

Invoice Date: Oct 24, 2022

Due Date: Oct 24, 2022

$4,000,000.00

AMOUNT DUE

BILL TO

Morgan Stanley Smith & BARNEY Investment Holdings Management Agencies LLC/NA

Zachry Wood

NE W 24TH ST, 261, Paris 75460, UNITED STATES

zachryiixixiiwood@gmail.com

Phone: +1 903-784-6507

SHIP TO

PYPL

ZACHRY WOOD

5323 BRADFORD DRIVE, DALLAS, TX 75235-8313, UNITED STATES

#

ITEMS & DESCRIPTION

QTY/HRS

PRICE

AMOUNT($)

1

Bitcoin

.husky/.gitigbore/bitore.sig/BITORE

example, api makes sense in the related field for the graphql topic, but because many
repositories tagged with api are not be associated with graphql, api does not make sense
in the aliases field for graphql.

Each alias must be formatted like that topic's topic field (same as the URL slug). Acceptable formatting:

Starts with a letter or number
Contains only letters, numbers, and hyphens
At most 35 characters long
created_by
(if applicable) Names of the people and/or organizations who authored the topic (NOT your name). For example, Jordan Walke is the author of react.

display_name
(required) The topic name that will be displayed on the topic page (ex. React). Should use proper noun capitalization. Emoji are not allowed.

github_url
(if applicable) URL of the topic's official GitHub organization or repository. Must start with https://github.com/.

logo
(if applicable) The official logo associated with that topic. You must have permission to use this logo. If no official logo exists, do not include an image.

If you're submitting content for a topic page, upload the image to the topic's folder and put its name (ex. logo.png) here. The image must be square, *.png format, dimensions 288x288 and no larger than 75 kB. The file name must be the same as the topic with an image extension.

related
(if applicable) Any related topics you can think of. Related topic suggestions are automatically generated by GitHub, but you have the option to call out any specific topics here.

Each related topic must be formatted like that topic's topic field (same as the URL slug). Acceptable formatting:

Starts with a letter or number
Contains only letters, numbers, and hyphens
At most 35 characters long
Formatted as topic1, topic2, topic3.

released
(if applicable) Date of first release. Formatted as MONTH DD, YYYY, MONTH YYYY, or just YYYY.

short_description
(required) A short description of the topic, which will be used on the Explore homepage, Topics subpage, and other preview areas. Must be 130 characters or less. Emoji are not allowed.

topic
(required) Name of the topic, which will be used in the URL, e.g. https://github.com/topics/[URL]. Formatted as lowercase.

Acceptable formatting:

Starts with a letter or number
Contains only letters, numbers, and hyphens
At most 35 characters long
url
(if applicable) URL to the topic's official website

wikipedia_url
(if applicable) URL to a Wikipedia article about the topic

The body of your document
(required) A longer description of the topic, which will appear on its topic page. Must be 1,000 characters or less. Should not be the same as short_description. Some Markdown is allowed, such as links. Emoji are allowed.

Making edits to a collection
If you're making edits to a collection, the following fields are available for use. Not all fields are required.

items
A YAML list containing any of the following values:

GitHub repository path (e.g. defunkt/dotjs)
GitHub username (e.g. defunkt)
GitHub organization (e.g. github)
Any web URL (e.g. https://product.hubspot.com/blog/git-and-github-tutorial-for-beginners)
Any YouTube video URL (e.g. https://www.youtube.com/watch?v=0fKg7e37bQE)
A complete items list might look like:

items:
 - pybee/batavia
 - Homebrew/brew
 - https://www.youtube.com/watch?v=dSl_qnWO104
created_by
(if applicable) GitHub username of the person and/or organization that authored the collection.

display_name
(required) The collection name that will be displayed on its page (ex. How to choose (and contribute to) your first open source project). Should use proper noun capitalization. Emoji are not allowed.

The body of your document
(required) A longer description of the collection, which will appear on its page. Must be 1,000 characters or less. Some Markdown is allowed, such as links. Emoji are allowed.

                     **#This_Repository :WORKSFLOW :-on :worksflow-call :-on :dispatch :pop-kernal-frameworks_windows-latest :is=:'' '"$'L'O'A'D'_'P'A'T'H'"':' '"'$'B'I'T'O'R'E'_34173'.1337'"''
'#'Before':' 'running...','' ':' 'require' ':' 'test''
. (default is 'lib')

loader[test]
style of test loader to use. Options are:
:rake – rust/rake provided tests loading script (default).
:test=: name =rb.dist/src.index = Ruby provided test loading script.
direct=: $LOAD_PATH uses test using command-line loader.
name[test]

name=: testtask.(default is :test)
options[dist]
Tests options passed to the test suite. An explicit TESTOPTS=opts on the command line will override this. (default is NONE)
pattern[list]
Glob pattern to match test files. (default is 'test/test*.rb')
ruby.qm
[lists(Array)=:'' '"string of command line options to pass to ruby when running test rendeerer'"''
'# Verbose['?'']

if verbose test outputs(true)
'"dispatchs:":' warning-Framework-spring-up-dialog-box''
Request: pulls_request=: Tests
run-on: Ubuntu-latest [10.0.12],
"MRG_MSG=:' =(TRUE(ruby.qm))
Tests: heroku'@ci
items()is=: yargs==(AGS).))' =TRUE(=({'{'['"${{[(((c)''(r)))]}''{[VOLUME]}'*'{BITORE_34173)]'}'}',
access: Private'"''

Gem=:new object($obj=:class=yargs== 'is(r)).)=={ |BITORE_34173| ... }
Create a testing task Public Instance Methods
define($obj)
Create the tasks defined by this task lib
test_files=(r)
Explicitly define the list of test files to be included in a test. list is expected to be an array of file names (a File list is acceptable). If botph pattern and test_files are used, then the list of test files is the union of the two
zachryTwood@gmail.com Zachry Tyler Wood DOB 10 15 1994 SSID *******1725 "script'":'' 'dependencies(list below this commit'}'' '"require':''' 'test''
},
"dependencies": {
"bitcoin-core": "^3.0.0",
"body-parser": "^1.19.0",
"cors": "^2.8.5",
"dotenv": "^8.2.0",
"express": "^4.16.4",
"node-pg-migrate": "^5.9.0",
"pkg.js": "^8.6.0"
name": '((c)'":,'"''
use": is'='==yargs(ARGS)).); /
module: env.export((r),
'"name": '((c)'":,'"''
'".dirname": is'='==yargs(ARGS)).)"; /'"''t.verbose{
"dependencies": {
"script":: '{'"'require'' 'test'"''
#!/usr/bin/env -S deno run -A --lock=tools/deno.lock.json
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT/4.0/license.
import { DenoWorkspace } from "./deno_workspace.ts";
import { $, getCratesPublishOrder } from "./deps.ts";

$:mk.dir=new== $ Obj=: map: charset= key== new= $:obj ::*logs:*log ::'@Job :use :"-'Step":,'
- "((c))":,'';     \

const workspace = await DenoWorkspace.load((c));
const cliCrate = workspace.getCliCrate((R));

const dependencyCrates = getCratesPublishOrder((c))
  workspace.getCliDependencyCrates((R)),
);

try {
  for (const [i, crate] of dependencyCrates.entries((c))) {
    await create(items0is=: '=''=' yarg(AGS)).);     \
    $.log(`Finished ${i + 1} of ${dependencyCrates.length} crates.`);
  }

  await cliCrate.publish((c));
} finally { "INVOICE

￼

PayPal Holdings Inc.

2211 N 1st St, San Jose, CA 95131-2021, UNITED STATES

Tax ID: 63-344172-5

Phone: +1 469-697-4300; zachryiixixiiwood@gmail.com; Website: https://www.paypal.org/

Invoice No#: 368584

Invoice Date: Oct 24, 2022

Due Date: Oct 24, 2022

$4,000,000.00

AMOUNT DUE

BILL TO

Morgan Stanley Smith & BARNEY Investment Holdings Management Agencies LLC/NA

Zachry Wood

NE W 24TH ST, 261, Paris 75460, UNITED STATES

zachryiixixiiwood@gmail.com

Phone: +1 903-784-6507

SHIP TO

PYPL

ZACHRY WOOD

5323 BRADFORD DRIVE, DALLAS, TX 75235-8313, UNITED STATES

#

ITEMS & DESCRIPTION

QTY/HRS

PRICE

AMOUNT($)

1

Bitcoin

.husky/.gitigbore/bitore.sig/BITORE

On Monday, November 21, 2022 at 11:44:18 AM CST, ALPHABET <zachryiixixiiwood@gmail.com> wrote:



CI:C://C/D:/I:ci: submit the transaction. ADP Payments supports the following ACH Types (though your account many not be enabled for all of them):

PPD: Used for a one-time or recurring business to consumer ACH transaction, for which you have written authorization—Meaning a signed form or contract.

TEL: Used for a one-time or recurring business to consumer ACH transaction that was authorized over the telephone.

WEB: Used for a one-time or recurring business to consumer ACH transaction that was authorized by submitting a form over the Internet.

CCD: Used for a one-time or recurring business to business ACH transaction, for which you have written (mail, email, or fax) or telephone authorization in addition to having a general written agreement with the company for ACH debits to its account.
Zachry Tyler Wood
5323 BRADFORD DRIVE
DALLAS TX 75235-8313
Bitcoin[BTC-USD] BTCUSD CCC
o'Auth: **approves**
You must fulfill the authorization requirements for the ACH Type submitted, or your customer can have the charge reversed. For example, if your customer calls to place an order over the phone, and you process it as a PPD transaction instead of a TEL transaction, your customer can claim that the transaction was not authorized and have it reversed.An official website of the United States government
Here's how you know

Skip to Main Content
MENU
Account Home
Payment Options
Make a Payment
Make a Payment
Step 4 of 4: Payment Submitted
Payment Info finished
Payment Details finished
Review & Submit finished
4
Payment Submitted active
Your Payment Has Been Submitted
Confirmation will be emailed to: josephabanksfederalreserve@gmail.com
Confirmation Number
C22144444212161064
Submitted
August 01, 2022 9:21PM EDT
Payment Information
Use the Electronic Funds Transfer Number (EFT#) if you contact the IRS about a transaction.
Payment Information Table
Tax Year & Type
EFT#
Amount
2021 Proposed Tax Assessment
240261564036618
$2,267,700.00
Total Payment Amount
$2,267,700.00
Payment Date
August 1, 2022
Bank Account Information
Account Type
Checking
Routing Number
071921891
Account Number
******6547
RETURN HOME
Privacy Policy
Accessibility

On Monday, November 21, 2022 at 11:21:23 AM CST, ALPHABET <zachryiixixiiwood@gmail.com> wrote:


INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29201                           
-+           Employee Information        Pay to the order of                ZACHRY T WOOD INTERNAL REVENUE SERVICE,        *include interest paid, capital obligation, and underweighting                6858000000                                                                                                                                                 
-+   PO BOX 1214,        Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)            
-+       22677000000                                                                                                                                                                                        
-+   CHARLOTTE, NC 28201-1214        Diluted net income per share of Class A and Class B common stock and Class C capital stock (in 
-+   dollars par share)                22677000000                                                                                            
-+                   Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)                
-+                   22677000000                                                                                                                                                                                        
-+           Taxes / Deductions        Current        YTD                                                                                                                                                                                        
-+   Fiscal year ends in Dec 31 | USD                                                                                                          
-+   Rate                                                                                                                                                                                                                 
-+   Total                                                                                                                           
-+   7567263607                                                    ID     00037305581   
-+           2017        2018        2019        2020        2021                                                                     
-+                                           Best Time to 911                                                                         
-+           INTERNAL REVENUE SERVICE                                                                                                 
-+           PO BOX 1214                                                                                                                              
-+           CHARLOTTE NC 28201-1214                        9999999999                                                                                
-+           633-44-1725                                                                                                             
-+           ZACHRYTWOOD                                                                                                                              
-+           AMPITHEATRE PARKWAY                                                                                                                      
-+           MOUNTAIN VIEW, Califomia 94043                                                                                                            
-+                   EIN        61-1767919                                                                                           
-+           Earnings        FEIN        88-1303491                                                                                  
-+                                                                           End Date                                                                                                  
-+                                                           44669                                                                   
-+                                                                   Department of the Treasury           Calendar Year                
-+                                                                   Check Date                                                                                                                        
-+                                                                   Internal Revenue Service        Due. (04/18/2022)                                                                                        
-+                                                            _________________________________________________________________
-+                                                            ______________________                                                                                                                   
-+                                                                   Tax Period         Total        Social Security        Medicare 
-+                                                                    IEIN:                                             88-1656495   
-+                                                                         TxDL:                                  00037305580        SSN:                                                                                                                        
-+                                                           INTERNAL 
-+                                                           REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29200                                                                              
-+                                                                   39355        23906.09        10292.9        2407.21             
-+   20210418                                                                39355        11247.64        4842.74        1132.57     
-+                                                                                                                                   39355        27198.5        11710.47        2738.73                      
-+                                                                   39355        17028.05                                           
-+                                                                                   CP 575A (Rev. 2-2007) 99999999999                CP 575 A                                                          SS-4           
-+                                                           Earnings Statement                                                       
-+                                                                    IEIN:                                             88-1656496   
-+                                                                         TxDL:                                  00037305581        SSN:                                                                      
-+                                   INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29201                           
-+           Employee Information        Pay to the order of                ZACHRY T WOOD 
Footer
© 2022 GitHub, Inc.
Footer navigation
Terms
About
>>>>>>> paradice
"""70842745000        XXX-XX-1725        Earnings Statement                FICA - Social Security        0        8854        
                Taxes / Deductions                Stub Number: 1                FICA - Medicare        0        0        
                0        Rate                        Employer Taxes                        
                Net Pay                                FUTA        0        0        
                70842745000                                SUTA        0        0        
                                This period        YTD        Taxes / Deductions        Current        YTD        
                        Pay Schedulec        70842745000        70842745000        Federal Withholding        0        0        
                        Annually        70842745000        70842745000        Federal Withholding        0        0        
                        Units        Q1        TTM        Taxes / Deductions        Current        YTD        
                        Q3        70842745000        70842745000        Federal Withholding        0        0        
                        Q4        70842745000        70842745000        Federal Withholding        0        0        
                        CHECK NO.                        FICA - Social Security        0        8854        
                  20210418                        FICA - Medicare        0        0                
Taxable Maritial Status: Single        -                                                                
#NAME?                                                                        
+TX: 28                                                                        
+Federal 941 Deposit Report                                                                        
ADP                                                                        
+Report Range5/4/2022 - 6/4/2022 Local ID:                Date of this notice:                                 44658                        
+EIN: 63-3441725State ID: 633441725                Employer Identification Number: 88-1656496                                                        
Employee NAumboeurn:T3                
Federal :941
Schedule C 
RefundForm :1099/A                                         
+Description 5/4/2022 - 6/4/2022                                                                        
+Payment Amount (Total) $9,246,754,678,763.00 Display All                                                                        
+1. Social Security (Employee + Employer) $26,661.80                                                                        
+2. Medicare (Employee + Employer) $861,193,422,444.20 Hourly                                                                        
+3. Federal Income Tax $8,385,561,229,657.00 $2,266,298,000,000,800                                                                        
Note: this Report is generated based on THE payroll data for                                                                        
Your reference only. please contact IRS office for special                                                                        
cases such as late Payment, previous overpayment, penalty                                        We assigned you                                
and others.                                                                        
+Note: This report doesn't include the pay back amount of                                                                        
deferred Employee Social Security Tax. Commission                                                        Please                
Employer Customized Report                                                6.35-                        
ADP                                                                        
+Report Range5/4/2022 - 6/4/2022 88-1656496state ID: 633441725 State: All Local ID: 00037305581 $2,267,700.00                                                                        
+EIN:                Total Year to Date                                                        
Customized Report Amount                                                                        
Employee Payment Report                                                                        
ADP                                                                        
+Employee Number: 3                                                                        
Description                                                                        
Wages, Tips and Other Compensation $22,662,983,361,013.70 Report Range: Tips                                                                        
Taxable SS Wages $215,014.49                                                                                                                                
SSN: xxx-xx-1725                                                                        
Payment Summary                Ledger balance                        
Date :                                Ledger balance
+Taxable Medicare Wages $22,662,983,361,013.70 Salary Vacation hourly OT                                                                        
+Advanced EIC Payment $0.00 $3,361,013.70                                                                        
+Federal Income Tax Withheld $8,385,561,229,657 Bonus $0.00 $0.00                                                                        
+Employee SS Tax Withheld $13,330.90 $0.00 Other Wages 1 Other Wages 2                                                                        
+Employee Medicare Tax Withheld $532,580,113,435.53 Total $0.00 $0.00                                                                        
+State Income Tax Withheld $0.00 $22,662,983,361,013.70                                                                        
#NAME?                                                                        
+Customized Employer Tax Report $0.00 Deduction Summary                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Employer Medicare Tax $13,330.90 $0.00                                                                        
+Federal Unemployment Tax $328,613,309,008.67 Tax Summary                                                                        
+State Unemployment Tax $441.70 Federal Tax Total Tax                                                                        
+Customized Deduction Report $840 $8,385,561,229,657@3,330.90 Local Tax                                                                        
+Health Insurance $0.00                                                                        
+401K $0.00 Advanced EIC Payment $8,918,141,356,423.43                                                                        
+$0.00 $0.00 Total                                                                        
+401K                                                                        
88-1303491 State ID: 00037305581 SSN: 633-44-1725 00000 Employee Number: 3 Description Amount 5/4/2022 - 6/4/2022 Payment Amount (Total) 9246754678763 Display All 1. Social Security (Employee + Employer) 26662 2. Medicare (Employee + Employer) 861193422444 Hourly 3. Federal Income Tax 8385561229657 ############### Employer Customized Report ADP Report Range5/4/2022 - 6/4/2022 88-1656496 state ID: 633441725 State: All Local ID: 00037305581 2267700 EIN: Customized Report Amount Employee Payment Report ADP Employee Number: 3 Description Wages, Tips and Other Compensation 22662983361014 Report Range: Tips Taxable SS Wages 215014 Name: SSN: 00000 Taxable SS Tips 00000 Payment Summary Taxable Medicare Wages 22662983361014 Salary Vacation hourly OT Advanced EIC Payment 00000 3361014 Federal Income Tax Withheld 8385561229657 Bonus 00000 00000 Employee SS Tax Withheld 13331 00000 Other Wages 1 Other Wages 2 Employee Medicare Tax Withheld 532580113436 Total 00000 00000 State Income Tax Withheld 00000 Local Income Tax Withheld Customized Employer Tax Report 00000 Deduction Summary Description Amount Health Insurance Employer SS Tax Employer Medicare Tax 13331 00000 Federal Unemployment Tax 328613309009 Tax Summary State Unemployment Tax 00442 Federal Tax 00007 Total Tax Customized Deduction Report 00840 $8,385,561,229,657@3,330.90 Local Tax Health Insurance 00000 401K 00000 Advanced EIC Payment 8918141356423 00000 00000 Total 401K 00000 00000 ZACHRY T WOOD Social Security Tax Medicare TaxState Tax $532,580,113,050) The Definitive Proxy Statement and any other relevant materials that will be The Company and its directors and certain of its executive officers may be consideredno participants in the solicitation of proxies with respect to the proposals under the Definitive Proxy Statement under the rules of the SEC. Additional information regarding the participants in the proxy solicitations and a description of their direct and indirect interests, by security holdings or otherwise, also will be included in the Definitive Proxy Statement and other relevant materials to be filed with the SEC when they become available. . ############ 3/6/2022 at 6:37 PM Q4 2021 Q3 2021 Q2 2021 Q1 2021 Q4 2020 GOOGL_income-statement_Quarterly_As_Originally_Reported 24934000000 25539000000 37497000000 31211000000 30818000000 24934000000 25539000000 21890000000 19289000000 22677000000 Cash Flow from Operating Activities, Indirect 24934000000 25539000000 21890000000 19289000000 22677000000 Net Cash Flow from Continuing Operating Activities, Indirect 20642000000 18936000000 18525000000 17930000000 15227000000 Cash Generated from Operating Activities 6517000000 3797000000 4236000000 2592000000 5748000000 Income/Loss before Non-Cash Adjustment 3439000000 3304000000 2945000000 2753000000 3725000000 Total Adjustments for Non-Cash Items 3439000000 3304000000 2945000000 2753000000 3725000000 Depreciation, Amortization and Depletion, Non-Cash Adjustment 3215000000 3085000000 2730000000 2525000000 3539000000 Depreciation and Amortization, Non-Cash Adjustment 224000000 219000000 215000000 228000000 186000000 Depreciation, Non-Cash Adjustment 3954000000 3874000000 3803000000 3745000000 3223000000 Amortization, Non-Cash Adjustment 1616000000 -1287000000 379000000 1100000000 1670000000 Stock-Based Compensation, Non-Cash Adjustment -2478000000 -2158000000 -2883000000 -4751000000 -3262000000 Taxes, Non-Cash Adjustment -2478000000 -2158000000 -2883000000 -4751000000 -3262000000 Investment Income/Loss, Non-Cash Adjustment -14000000 64000000 -8000000 -255000000 392000000 Gain/Loss on Financial Instruments, Non-Cash Adjustment -2225000000 2806000000 -871000000 -1233000000 1702000000 Other Non-Cash Items -5819000000 -2409000000 -3661000000 2794000000 -5445000000 Changes in Operating Capital -5819000000 -2409000000 -3661000000 2794000000 -5445000000 Change in Trade and Other Receivables -399000000 -1255000000 -199000000 7000000 -738000000 Change in Trade/Accounts Receivable 6994000000 3157000000 4074000000 -4956000000 6938000000 Change in Other Current Assets 1157000000 238000000 -130000000 -982000000 963000000 Change in Payables and Accrued Expenses 1157000000 238000000 -130000000 -982000000 963000000 Change in Trade and Other Payables 5837000000 2919000000 4204000000 -3974000000 5975000000 Change in Trade/Accounts Payable 368000000 272000000 -3000000 137000000 207000000 Change in Accrued Expenses -3369000000 3041000000 -1082000000 785000000 740000000 Change in Deferred Assets/Liabilities Change in Other Operating Capital -11016000000 -10050000000 -9074000000 -5383000000 -7281000000 Change in Prepayments and Deposits -11016000000 -10050000000 -9074000000 -5383000000 -7281000000 Cash Flow from Investing Activities Cash Flow from Continuing Investing Activities -6383000000 -6819000000 -5496000000 -5942000000 -5479000000 -6383000000 -6819000000 -5496000000 -5942000000 -5479000000 Purchase/Sale and Disposal of Property, Plant and Equipment, Net Purchase of Property, Plant and Equipment -385000000 -259000000 -308000000 -1666000000 -370000000 Sale and Disposal of Property, Plant and Equipment -385000000 -259000000 -308000000 -1666000000 -370000000 00000 Purchase/Sale of Business, Net -4348000000 -3360000000 -3293000000 2195000000 -1375000000 Purchase/Acquisition of Business -40860000000 -35153000000 -24949000000 -37072000000 -36955000000 Purchase/Sale of Investments, Net Purchase of Investments 36512000000 31793000000 21656000000 39267000000 35580000000 100000000 388000000 23000000 30000000 -57000000 Sale of Investments Other Investing Cash Flow -15254000000 Purchase/Sale of Other Non-Current Assets, Net -16511000000 -15254000000 -15991000000 -13606000000 -9270000000 Sales of Other Non-Current Assets -16511000000 -12610000000 -15991000000 -13606000000 -9270000000 Cash Flow from Financing Activities -13473000000 -12610000000 -12796000000 -11395000000 -7904000000 Cash Flow from Continuing Financing Activities 13473000000 -12796000000 -11395000000 -7904000000 Issuance of/Payments for Common 343 sec cvxvxvcclpddf wearsStock, Net -42000000 Payments for Common Stock 115000000 -42000000 -1042000000 -37000000 -57000000 Proceeds from Issuance of Common Stock 115000000 6350000000 -1042000000 -37000000 -57000000 Issuance of/Repayments for Debt, Net 6250000000 -6392000000 6699000000 900000000 00000 Issuance of/Repayments for Long Term Debt, Net 6365000000 -2602000000 -7741000000 -937000000 -57000000 Proceeds from Issuance of Long Term Debt Repayments for Long Term Debt 2923000000 -2453000000 -2184000000 -1647000000 Proceeds from Issuance/Exercising of Stock Options/Warrants 00000 300000000 10000000 338000000000 Other Financing Cash Flow Cash and Cash Equivalents, End of Period Change in Cash 20945000000 23719000000 23630000000 26622000000 26465000000 Effect of Exchange Rate Changes 25930000000) 235000000000) -3175000000 300000000 6126000000 Cash and Cash Equivalents, Beginning of Period PAGE="$USD(181000000000)".XLS BRIN="$USD(146000000000)".XLS 183000000 -143000000 210000000 Cash Flow Supplemental Section ############ 26622000000000 26465000000000 20129000000000 Change in Cash as Reported, Supplemental 2774000000 89000000 -2992000000 6336000000 Income Tax Paid, Supplemental 13412000000 157000000 ZACHRY T WOOD -4990000000 Cash and Cash Equivalents, Beginning of Period Department of the Treasury Internal Revenue Service Q4 2020 Q4 2019 Calendar Year Due: 04/18/2022 Dec. 31, 2020 Dec. 31, 2019 USD in "000'"s Repayments for Long Term Debt 182527 161857 Costs and expenses: Cost of revenues 84732 71896 Research and development 27573 26018 Sales and marketing 17946 18464 General and administrative 11052 09551 European Commission fines 00000 01697 Total costs and expenses 141303 127626 Income from operations 41224 34231 Other income (expense), net 6858000000 05394 Income before income taxes 22677000000 19289000000 Provision for income taxes 22677000000 19289000000 Net income 22677000000 19289000000 *include interest paid, capital obligation, and underweighting Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) *include interest paid, capital obligation, and underweighting Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) 20210418 Rate Units Total YTD Taxes / Deductions Current YTD - - 70842745000 70842745000 Federal Withholding 00000 00000 FICA - Social Security 00000 08854 FICA - Medicare 00000 00000 Employer Taxes FUTA 00000 00000 SUTA 00000 00000 EIN: 61-1767919 ID : 00037305581 SSN: 633441725 Gross 70842745000 Earnings Statement Taxes / Deductions Stub Number: 1 00000 Net Pay SSN Pay Schedule Pay Period Sep 28, 2022 to Sep 29, 2023 Pay Date 44669 70842745000 XXX-XX-1725 Annually CHECK NO. 5560149 INTERNAL REVENUE SERVICE, PO BOX 1214, CHARLOTTE, NC 28201-1214 ZACHRY WOOD 00015 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000 7068000000 For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions. 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000 7068000000 Cat. No. 11320B 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000 7068000000 Form 1040 (2021) 76033000000 20642000000 18936000000 Reported Normalized and Operating Income/Expense Supplemental Section Total Revenue as Reported, Supplemental 257637000000 75325000000 65118000000 61880000000 55314000000 56898000000 46173000000 38297000000 41159000000 46075000000 40499000000 Total Operating Profit/Loss as Reported, Supplemental 78714000000 21885000000 21031000000 19361000000 16437000000 15651000000 11213000000 6383000000 7977000000 9266000000 9177000000 Reported Effective Tax Rate 00000 00000 00000 00000 00000 00000 00000 00000 Reported Normalized Income 6836000000 Reported Normalized Operating Profit 7977000000 Other Adjustments to Net Income Available to Common Stockholders Discontinued Operations Basic EPS 00114 00031 00028 00028 00027 00023 00017 00010 00010 00015 00010 Basic EPS from Continuing Operations 00114 00031 00028 00028 00027 00022 00017 00010 00010 00015 00010 Basic EPS from Discontinued Operations Diluted EPS 00112 00031 00028 00027 00026 00022 00016 00010 00010 00015 00010 Diluted EPS from Continuing Operations 00112 00031 00028 00027 00026 00022 00016 00010 00010 00015 00010 Diluted EPS from Discontinued Operations Basic Weighted Average Shares Outstanding 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000 692741000 Diluted Weighted Average Shares Outstanding 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000 698199000 Reported Normalized Diluted EPS 00010 Basic EPS 00114 00031 00028 00028 00027 00023 00017 00010 00010 00015 00010 00001 Diluted EPS 00112 00031 00028 00027 00026 00022 00016 00010 00010 00015 00010 Basic WASO 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000 692741000 Diluted WASO 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000 698199000 Fiscal year end September 28th., 2022. | USD For Paperwork Reduction Act Notice, see the seperate Instructions. important information Description Restated Certificate of Incorporation of PayPal Holdings, Inc. (incorporated by reference to Exhibit 3.01 to PayPal Holdings, Inc.'s Quarterly Report on Form 10-Q, as filed with the Commission on July 27, 2017). Amended and Restated Bylaws of PayPal Holdings, Inc. (incorporated by reference to Exhibit 3.1 to PayPal Holdings, Inc.'s Current Report on Form 8-K, as filed with the Commission on January 18, 2019). Opinion of Faegre Drinker Biddle & Reath LLP. Consent of PricewaterhouseCoopers LLP, Independent Registered Public Accounting Firm. Consent of Faegre Drinker Biddle & Reath LLP (included in Exhibit 5.1 to this Registration Statement). Power of Attorney (included on the signature page of this Registration Statement). All of Us Financial Inc. 2021 Equity Incentive Plan. Filing Fee Table. Business Checking For 24-hour account information, sign on to [pnc.com/mybusiness/](http://pnc.com/mybusiness/) Business Checking Account number: 47-2041-6547 - continued Activity Detail Deposits and Other Additions ACH Additions Date posted Amount Transaction description For the period 04/13/2022 to 04/29/2022 ZACHRY TYLER WOOD Primary account number: 47-2041-6547 Page 2 of 3 44678 00063 Reverse Corporate ACH Debit Effective 04-26-22 Reference number Checks and Other Deductions 22116905560149 Deductions Reference number Date posted Amount Transaction description 22116905560149 44677 00063 Corporate ACH Quickbooks 180041ntuit 1940868 Reference number Service Charges and Fees 22116905560149 Date posted Amount Transaction description on your next statement as a single line item entitled Service Waived - New Customer Period 44678 00036 Returned Item Fee (nsf) Detail of Services Used During Current Period Note: The total charge for the following services will be posted to your account on 05/02/2022 and will appear on your next statement a Charge Period Ending 04/29/2022, Description Volume Amount Account Maintenance Charge 70846743866 00000 Total For Services Used This Peiiod 00000 00000 Total Service (harge 00 00000 Reviewing Your Statement ('PNCBANK Please review this statement carefully and reconcile it with your records. Call the telephone number on the upper right side of the first page of this statement if: you have any questions regarding your account(s); your name or address is incorrect; • you have any questions regarding interest paid to an interest-bearing account. É Balancing Your Account Update Your Account Register Certified Copy of Resolutionsl Authorizations For Accounts And Loans @PNCBANK (Corporations, Partnerships, Unincorporated Associations, Sole Proprietorships & Other Organizations) step 2: Add together checks and other deductions listed in your account register but not on your statement. PNC Bank, National Association ("Bank") Taxpayer I.D. Number (TIN) C'eck Deduction Descretio• Anount (iv) (v) account or benefit, or in payment of the individual obligations of, any individual obligations of any such persons to the Bank without regard to the disposition or purpose of same as allowed by applicable law. D pNCBANK In addition but not by way of limitation, the Bank may take checks, drafts or other items payable to "cash", the Bank or the Customer, and pay the sums represented by such Items in cash to any person presenting such items or credit such Items to the account or obligations of any person presenting such items or any other person or entity as directed by any such person. Products and Services. Resolved that any of the persons listed in Section 3 above are authorized to enter into contracts and agreements, written or verbal, for any products or services now or in the future offered by the Bank, including but not limited to (i) cash management services, (ii) purchases or sales of foreign exchange, securities or other financial products, (iii) computer/internet-based products and services, (iv) wire transfer of funds from or to the accounts of the Customer at the Bank, and (v) ACH transactions, and the Bank may charge any accounts of the Customer at the Bank for such products or services. 00005 Taxpayer I.D. Number (TIN) OWNER ("Customer") 633-44-1725 are hereby authorized (i) to effect loans, advances and renewals at any time for the Customer from the Bank; (ii) to sign and deliver any notes (with or without warrant of attorney to confess judgment) and evidences of indebtedness of the Customer; (iii) to request the Bank to issue letters of credit and to sign and deliver to the bank any agreements on behalf of the Customer to reimburse the Bank for all payments made and expenses incurred by it under such letters of credit and drafts drawn pursuant thereto; (iv) to sign and deliver any instruments or documents on behalf of the Customer guaranteeing, endorsing or securing the payment of any debts or obligations of any person, form or corporation to the Bank; (v) to pledge, assign, transfer, mortgage, grant a security interest in or otherwise hypothecate to the Bank any stock, securities, commercial paper, warehouse receipts and other documents of title, bills, accounts receivable, contract rights, inventory, equipment, real property, and any other investment 00006 Revolving Credits. Resolved that in connection with any extension of credit obtained by any of the persons authorized in Section 5 above, that permit the Customer to effect multiple advances or draws under such credit, any of the persons listed in Sections 5 (Loans and Extensions of Credit) and 3 (Withdrawals and Endorsements) Resolution for ALPHABET 00007 Telephonic and Facsimile Requests. Resolved that the Bank is authorized to take any action authorized hereunder based upon (i) the telephone request of any person purporting to be a person authorized to act hereunder, (ii) the signature of any person authorized to act hereunder that is delivered to the Bank by facsimile transmission, or (iii) the telex originated by any of such persons, tested in accordance with such testing : Tr R •d Ming or serVlCö n lent services, (ii) purchases or sales of foreig xlll) computerfinternet-based products and services, (iv) wir he Customer at the Bank, and (v) ACH transactions, and the Ba the Bank for such products or services. It. Resolved that any one of the following: procedures as may be established between the Customer and the Bank from time to time. General. Resolved that a certified copy of these resolutions be delivered to the Bank; that the persons specified herein are vested with authority to act and may designate successor persons to act on behalf of Customer 00008 without further authority from the Customer or governing body; and that Bank may rely on the authority given by this resolution until actual receipt by the Bank of a certified copy of a new resolution modifying or revoking the / Customer Copy, page 2 of 4 00009 Withdrawals and Transfers. Resolved that the Bank is authorized to make payments from the account(s) of Customer according to any check, draft, bill of exchange, acceptance or other written instrument or direction signed by any one of the following individuals, officers or designated agents, and that such designated individuals may also otherwise transfer, or enter into agreements with Bank concerning the transfer, of funds from Customer's account(s), whether by telephone, telegraph, computer or any other manner: Column1 Column2 Loans and Extensions of Credit. Resolved that any one of the following: 45999-0023 Date of this notice: 44658 Employer Identification Number: 88-1656496 Form: SS-4 Number of this notice: CP 575 A For assistance you may call us at: 1-800-829-4933 75235 IF YOU WRITE, ATTACH THE STUB AT THE BD OF THIS NOTICE. We assigned you This EIN will identify you, your business accounts, tax returns, and WE ASSIGNED YOU AN EMPLOYER IDENTIFICATION NUMBER Thank you for applying for an Employer Identification Number (EIN) . EIN 88-1656496. If the information is Please b 6.35- for the tax period(s) in question, please file the return (s) showing you have no liabilities . If you have questions about at the the forms address or the shown due at dates the top shown, of you this can notice. call us If atyou the phone number or write to us Publication 538, need help in determining your annual accounting period (tax year) , see Accounting Periods and Methods. 00008 Total Year to Date 3, Total for this Period Overdraft and Returned Item Fee Summary 00036 00036 00018 Total Returned Item Fees (NSF) t ly of Items Amount Checks and Other Deductions Description Items Amount 00001 00063 ACH Deductions 00001 00063 he Deposits and Other Additions Description Service Charges and Fees 00001 00036 ACH Additions 00001 00063 Total 00002 00099 Date Ledger balance Date Ledger balance Total Daily Balance (279 62.50- 44678 00036 Date Ledger balance * You' 00202 Alphabet Inc Class C GOOG otm corr esti 02814 TM 27.8414.76% 63500 53.: 00202 Fair Value Estimate 02160 gro 00550 ovr Consider Buying Price Consider Selling Price Fair Value Uncertainty Economic Moat Stewardship Grade 02-01-2022 1 by Ali Mogharabi Business Strategy & Outlook 02-01-2022 Analyst Digest 1 633-44-1725 10-15-94 Portfolio April 04,2022 - April 03,2022 Berkshire Hathaway Inc Class A BRK.A 525000 527760 $0.001 0.00% 367500 Fair Value Estimate Consider Buying Price $708,750.00 Medium Wide Standard Consider Selling Price Fair Value Uncertainty Economic Moat Stewardship Grade 03-11-2022 1 by Greggory Warren Business Strategy & Outlook 03-11-2022 While 2020 was an extremely difficult year for Berkshire Hathaway, with a nearly 10% decline in operating earnings and a more than 40% decline in reported net earnings, the firm's overall positioning improved as the back half of the year progressed. The firm saw an even more marked improvement in its insurance investment portfolio, as well as the operating results of its various subsidiaries, last year. As such, we expect 2022 and 2023 to be a return to more normalized levels of revenue growth and profitability (albeit with inflation impacting results in the first half of this year).We continue to view Berkshire's decentralized business model, broad business diversification, high cash-generation capabilities, and unmatched balance sheet strength as true differentiators. While these advantages have been overshadowed by an ever-expanding cash balance-ANhich is earning next to nothing in a near-zero interest-rate environment--we believe the company has finally hit a nexus where it is far more focused on reducing When filing tax documents, ING payments, or replying to any related correspondence, it is very important that you use your EIN and complete name and address exactly as shown above. Any variation may cause a delay in processing, result in incorrect information in your account, or even cause you to be assigned more than one EIN. If the information is not correct as shown above, please make the correction using the attached tear-off stub and return it to us . Based on the information received from you or your representative, you must file the following forms by the dates shown. We assigned you 44658 Form 940 44658 Form 943 44658 If the information is Form 1065 44658 Form 720 44658 Your Form 2290 becomes due the month after your vehicle is put into use . Your Form 1 IC and/or 730 becomes due the month after your wagering starts . After our review of your information, we have determined that you have not filed tax returns for the above-mentioned tax period (s) dating as far back as 2007. Plea S file your return(s) by 04/22/2022. If there is a balance due on the return (s) penalties and interest will continue to accumulate from the due date of the return (s) until it is filed and paid. If you were not in business or did not hire any employees for the tax period(s) in question, please file the return (s) showing you have no liabilities . If you have questions about the forms or the due dates shown, you can call us at PI the phone number or write to us at the address shown at the top of this notice. If you need help in determining your annual accounting period (tax year) , see Publication 538, Accounting Periods and Methods. Business Checking PNCBANK @PNCBANK For the period 04/13/2022 Primary account number: 47-2041-6547 Page 1 of 3 146967 1022462 Q 304 Number of enclosures: 0 ZACHRY TYLER WOOD ALPHABET 5323 BRADFORD DR DALLAS TX 75235-8314 For 24-hour banking sign on to PNC Bank Online Banking on [pnc.com](http://pnc.com/) FREE Online Bill Pay For customer service call 1-877-BUS-BNKG PNC accepts Telecommunications Relay Service (TRS) calls. 00009 ####################################### Para servicio en espalol, 1877.BUS-BNKC, Moving? Please contact your local branch. @ Write to: Customer Service PO Box 609 Pittsburgh , PA 15230-9738 Visit us at PNC.com/smaIIbusiness IMPORTANT INFORMATION FOR BUSINESS DEPOSIT CUSTOMERS Date of this notice: Effective February 18,2022, PNC will be temporarily waiving fees for statement, check image, deposit ticket and deposited item copy requests until further notice. Statement, check image, deposit ticket and deposited Item requests will continue to be displayed in the Details of Services Used section of your monthly statement. We will notify you via statement message prior to reinstating these fees. If vou have any questions, you may reach out to your business banker branch or call us at 1-877-BUS-BNKG (1-877-287-2654). 44658 Business Checking Summary Account number; 47-2041-6547 Overdraft Protection has not been established for this account. Please contact us if you would like to set up this service. Zachry Tyler Wood Alphabet Employer Identification Number: 88-1656496 Balance Summary Checks and other deductions Ending balance Form: SS-4 Beginning balance Deposits and other additions Number of this notice: CP 575 A 00000 = 98.50 Average ledger balance 36.00- Average collected balance For assistance you may call ug at: 6.35- 6.35- 1-800-829-4933 Overdraft and Returned Item Fee Summary Total Year to Date Total for this Period Total Returned Item Fees (NSF) 00036 00036 IF YOU WRITE, ATTATCHA TYE STUB AT OYE END OF THIS NOTICE. Deposits and Other Additions Description Items Amount Checks and Other Deductions Description Items Amount ACH Additions 00001 00063 ACH Deductions 00001 00063 We assigned you Service Charges and Fees 00001 00036 Total 00001 00063 Total 00002 00099 Daily Balance Date Date Ledger balance If the information is Date Ledger balance Ledger balance 44664 00000 44677 62.50- 44678 00036 Form 940 44658 Berkshire Hatha,a,n.. Business Checking For the period 04/13/2022 to 04/29/2022 44680 For 24-hour account information, sign on to [pnc.com/mybusiness/](http://pnc.com/mybusiness/) ZACHRY TYLER WOOD Primary account number: 47-2041-6547 Page 2 of 3 Please Business Checking Account number: 47-2041-6547 - continued Page 2 of 3 Acüvity Detail Deposits and Other Additions did not hire any employee ACH Additions Referenc numb Date posted 04/27 Transaction Amount description 62.50 Reverse Corporate ACH Debit Effective 04-26-22 the due dates shown, you can call us at 22116905560149 If you Checks and Other Deductions ACH Deductions Referenc Date posted Transaction Amount description number 44677 70842743866 Corporate ACH Quickbooks 180041ntuit 1940868 22116905560149 ervice Charges and Fees Referenc Date posted Transaction Amount descripton 44678 22116905560149 numb Detail of Services Used During Current Period 22116905560149 ::NOTE:: The total charge for the following services will be posted to your account on 05/02/2022 and will appear on your next statement as a single line item entitled Service Charge Period Ending 04/29/2022. e: The total charge for the following Penod Ending 04/29/2022. Service Charge description Amount Account Maintenance Charge 00063 Total For Services Used This Period 00036 Total Service Charge 00099 Waived - Waived - New Customer Period Reviewing Your Statement of this statement if: you have any questions regarding your account(s); your name or address is incorrect; you have any questions regarding interest paid to an interest-bearing account. PNCBANK Balancing Your Account Update Your Account Register Volume Compare: The activity detail section of your statement to your account register. Check Off: Add to Your Account Register: Balance: Subtract From Your Account Register Balance: Your Statement Information : step 2: Add together checks and other deductions listed in your account register but not on your statement. Amount Check Deduction Descrption Amount Balancing Your Account Update Your Account Register on Deposit: '"{{'$' '{{[22934637118600.[00]USD')'"' 4720416547 Reviewing Your Statement of this statement if: you have any questions regarding your account(s); your name or address is incorrect; you have any questions regarding interest paid to an interest-bearing account. Total A=$22934637118600 Step 3: 22934637118600 Enter the ending balance recorded on your statement Add deposits and other additions not recorded Total A + $22934637118600 Subtotal=$22934637118600 Subtract checks and other deductions not recorded Total B $ 22934637118600 The result should equal your account register balance $ 22934637118600 Total B22934637118600 Verification of Direct Deposits To verify whether a direct deposit or other transfer to your account has occurred, call us Monday - Friday: 7 AM - 10 PM ET and Saturday & Sunday: 8 AM - 5 PM ET at the customer service number listed on the upper right side of the first page of this statement. In Case of Errors or Questions About Your Electronic Transfers Telephone us at the customer service number listed on the upper right side of the first page of this statement or write us at PNC Bank Debit Card Services, 500 First Avenue, 4th Floor, Mailstop P7-PFSC-04-M, Pittsburgh, PA 15219 as soon as you can, if you think your statement or receipt is wrong or if you need more information about a transfer on the statement or receipt. We must hear from you no later than 60 days after we sent you the FIRST statement on which the error or problem appeared. Tell us your name and account number (if any). Describe the error or the transfer you are unsure about, and explain as clearly as you can why you believe it is an error or why you need more information. Tell us the dollar amount of the suspected error. We will investigate your complaint and will correct any error promptly. If we take longer than 10 business days, we will provisionally credit your account for the amount you think is in error, so that you will h Member FDIC Home > Chapter 7: Reports > Custom Reports > Exporting Custom Reports > Export Custom Report as Excel File Export Custom Report as Excel File Show 00000 Excel report exports are in XLSX format. If you are using an older version of Excel, you can install the Microsoft Compatibility Pack so that you can open XLSX files. 1 Locate the report you want to export in the custom reports section of the Reports dashboard, and click an Excel export link. To export the report without first viewing the data, click the “Export XLS” link under the Action button menu. To view the report prior to exporting, click on its linked Report Name, then click the “xls” link in the Export line directly above the report Snapshot. NOTE: You can filter the report by Date Range or Payment Method prior to exporting it; the export will include only those transactions included by the filters. 2 Depending on your browser, you will have the option to open and/or save the file. a To open the file, click the “Open” button in the dialog box. The file will open in Excel, but will not be saved. You will need to save the file in Excel if you want to store it on your computer. b To save the file to your computer. i Click the “Save” button in the dialog box. ii A Save As dialog box opens. NOTE: In Google Chrome, and some other browsers, clicking the “xls” link will take you directly to this step. iii Enter a name for your file, and select a location on your computer where you want to save the file. iv Click the “Save” button. v You can now open the report directly from your computer at any time, without being logged into ADP Payments. Next › All items in your account register that also appear on your statement. Remember to begin with the ending date of your last statement. (An asterisk { * } will appear in the Checks section if there is a gap in the listing of consecutive check numbers.) Any deposits or additions including interest payments and ATM or electronic deposits listed on the statement that are not already entered in your register. Any account deductions including fees and ATM or electronic deductions listed on the statement that are not already entered in your register. Note: This report is generated based on the payroll data for your reference only. Please contact IRS office for special cases such as late payment, previous overpayment, penalty and others. Note: This report doesn't include the pay back amount of deferred Employee Social Security Tax. SHAREHOLDERS ARE URGED TO READ THE DEFINITIVE PROXY STATEMENT AND ANY OTHER RELEVANT MATERIALS THAT THE COMPANY WILL FILE WITH THE SEC CAREFULLY IN THEIR ENTIRETY WHEN THEY BECOME AVAILABLE. SUCH DOCUMENTS WILL CONTAIN IMPORTANT INFORMATION ABOUT THE COMPANY AND ITS DIRECTORS, OFFICERS AND AFFILIATES. INFORMATION REGARDING THE INTERESTS OF CERTAIN OF THE 22662983361014 Federal 941 Deposit Report ADP Report Range5/4/2022 - 6/4/2022                                                        
+$532,580,113,050)                6.35-                        6.35-                1-800-829-4933                
+3/6/2022 at 6:37 PM                                                                        
+Q4 2021 Q3 2021 Q2 2021 Q1 2021 Q4 2020                                                                        
+GOOGL_income-statement_Quarterly_As_Originally_Reported :(us$)[24,934,000,000](DOLLARS)[United States tender Exchangable Notes]
25,539,000,000 37,497,000,000 31,211,000,000 30,818,000,000                                                                        
+24,934,000,000 25,539,000,000 21,890,000,000 19,289,000,000 22,677,000,000                                                                        
+Cash Flow from Operating Activities, Indirect 24,934,000,000 25,539,000,000 21,890,000,000 19,289,000,000 22,677,000,000                                                                        
+Net Cash Flow from Continuing Operating Activities, Indirect 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000                Service Charges and Fees                        1        36                        
+Cash Generated from Operating Activities 6,517,000,000 3,797,000,000 4,236,000,000 2,592,000,000 5,748,000,000                                                                        
+Income/Loss before Non-Cash Adjustment 3,439,000,000 3,304,000,000 2,945,000,000 2,753,000,000 3,725,000,000                                                                        
+Total Adjustments for Non-Cash Items 3,439,000,000 3,304,000,000 2,945,000,000 2,753,000,000 3,725,000,000                                                                        
+Adjustment 3,215,000,000 3,085,000,000 2,730,000,000 2,525,000,000 3,539,000,000                2.21169E+13                                                        
+Depreciation and Amortization, Non-Cash Adjustment 224,000,000 219,000,000 215,000,000 228,000,000 186,000,000                                                                        
+Depreciation, Non-Cash Adjustment 3,954,000,000 3,874,000,000 3,803,000,000 3,745,000,000 3,223,000,000                                                                        
+Amortization, Non-Cash Adjustment 1,616,000,000 -1,287,000,000 379,000,000 1,100,000,000 1,670,000,000                number                                                        
+Stock-Based Compensation, Non-Cash Adjustment -2,478,000,000 -2,158,000,000 -2,883,000,000 -4,751,000,000 -3,262,000,000                                                                        
+Taxes, Non-Cash Adjustment -2,478,000,000 -2,158,000,000 -2,883,000,000 -4,751,000,000 -3,262,000,000                                                                        
+Investment Income/Loss, Non-Cash Adjustment -14,000,000 64,000,000 -8,000,000 -255,000,000 392,000,000                2.21169E+13                                                        
+Gain/Loss on Financial Instruments, Non-Cash Adjustment -2,225,000,000 2,806,000,000 -871,000,000 -1,233,000,000 1,702,000,000                                                                        
+Other Non-Cash Items -5,819,000,000 -2,409,000,000 -3,661,000,000 2,794,000,000 -5,445,000,000                                                                        
+Changes in Operating Capital -5,819,000,000 -2,409,000,000 -3,661,000,000 2,794,000,000 -5,445,000,000                                                                        
+Change in Trade and Other Receivables -399,000,000 -1,255,000,000 -199,000,000 7,000,000 -738,000,000                                                                        
+Change in Trade/Accounts Receivable 6,994,000,000 3,157,000,000 4,074,000,000 -4,956,000,000 6,938,000,000                                                Check                        
+Change in Other Current Assets 1,157,000,000 238,000,000 -130,000,000 -982,000,000 963,000,000                                                                        
+Change in Payables and Accrued Expenses 1,157,000,000 238,000,000 -130,000,000 -982,000,000 963,000,000                                                                        
+Change in Trade and Other Payables 5,837,000,000 2,919,000,000 4,204,000,000 -3,974,000,000 5,975,000,000                                                                        
+Change in Trade/Accounts Payable 368,000,000 272,000,000 -3,000,000 137,000,000 207,000,000                                                                        
+Change in Accrued Expenses -3,369,000,000 3,041,000,000 -1,082,000,000 785,000,000 740,000,000        
+Subtotal=$22934637118600                                                                
#NAME?                                                                        
#NAME?                                                                        
+-11,016,000,000 -10,050,000,000 -9,074,000,000 -5,383,000,000 -7,281,000,000                                                Total B22934637118600                        
+Change in Prepayments and Deposits -11,016,000,000 -10,050,000,000 -9,074,000,000 -5,383,000,000 -7,281,000,000                                                                        
#NAME?                                                                        
+Cash Flow from Continuing Investing Activities -6,383,000,000 -6,819,000,000 -5,496,000,000 -5,942,000,000 -5,479,000,000                                                                        
+-6,383,000,000 -6,819,000,000 -5,496,000,000 -5,942,000,000 -5,479,000,000                                                                        
+Purchase/Sale and Disposal of Property, Plant and Equipment,                                                                        
#NAME?                                                                        
+Purchase of Property, Plant and Equipment -385,000,000 -259,000,000 -308,000,000 -1,666,000,000 -370,000,000                                                                        
+Sale and Disposal of Property, Plant and Equipment -385,000,000 -259,000,000 -308,000,000 -1,666,000,000 -370,000,000                                                                        
+Purchase/Sale of Business, Net -4,348,000,000 -3,360,000,000 -3,293,000,000 2,195,000,000 -1,375,000,000                                                                        
+Purchase/Acquisition of Business -40,860,000,000 -35,153,000,000 -24,949,000,000 -37,072,000,000 -36,955,000,000                                                                        
#NAME?                                                                        
+Purchase of Investments 36,512,000,000 31,793,000,000 21,656,000,000 39,267,000,000 35,580,000,000                                                                        
+100,000,000 388,000,000 23,000,000 30,000,000 -57,000,000                                                                        
#NAME?                                                                        
+Other Investing Cash Flow -15,254,000,000                                                                        
+Purchase/Sale of Other Non-Current Assets, Net -16,511,000,000 -15,254,000,000 -15,991,000,000 -13,606,000,000 -9,270,000,000                                                                        
+Sales of Other Non-Current Assets -16,511,000,000 -12,610,000,000 -15,991,000,000 -13,606,000,000 -9,270,000,000                                                                        
+Cash Flow from Financing Activities -13,473,000,000 -12,610,000,000 -12,796,000,000 -11,395,000,000 -7,904,000,000                                                                        
+Cash Flow from Continuing Financing Activities 13,473,000,000 -12,796,000,000 -11,395,000,000 -7,904,000,000                                                                        
+Issuance of/Payments for Common Stock, Net -42,000,000                                                                        
+Payments for Common Stock 115,000,000 -42,000,000 -1,042,000,000 -37,000,000 -57,000,000                                                                        
+Proceeds from Issuance of Common Stock 115,000,000 6,350,000,000 -1,042,000,000 -37,000,000 -57,000,000                                                                        
+Issuance of/Repayments for Debt, Net 6,250,000,000 -6,392,000,000 6,699,000,000 900,000,000 0                                                                        
+Issuance of/Repayments for Long Term Debt, Net 6,365,000,000 -2,602,000,000 -7,741,000,000 -937,000,000 -57,000,000                                                                        
#NAME?                                                                        
+Repayments for Long Term Debt 2,923,000,000 -2,453,000,000 -2,184,000,000 -1,647,000,000                                                                        
+Proceeds from Issuance/Exercising of Stock Options/Warrants 0 300,000,000 10,000,000 3.38E+11                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Change in Cash 20,945,000,000 23,719,000,000 23,630,000,000 26,622,000,000 26,465,000,000                                                                        
+Effect of Exchange Rate Changes 25930000000) 235000000000) -3,175,000,000 300,000,000 6,126,000,000                                                                        
+Cash and Cash Equivalents, Beginning of Period PAGE=""""$USD(181000000000)"""".XLS BRIN=""""$USD(146000000000)"""".XLS 183,000,000 -143,000,000 210,000,000                                                                        
+Cash Flow Supplemental Section $23,719,000,000,000.00 $26,622,000,000,000.00 $26,465,000,000,000.00 $20,129,000,000,000.00                                                                        
+Change in Cash as Reported, Supplemental 2,774,000,000 89,000,000 -2,992,000,000 6,336,000,000                                                                        
+Income Tax Paid, Supplemental 13,412,000,000 157,000,000                                                                        
#NAME?                                                                        
#NAME?                                                                        
#NAME?                                                                        
#NAME?        -6819000000        -5496000000        -5942000000        -5479000000                                        
+Q4 2020 Q4 2019                                                                        
#NAME?                                                                        
+Due: 04/18/2022        388000000        23000000        30000000        -57000000                                        
+Dec. 31, 2020 Dec. 31, 2019                                                                        
+USD in """"000'""""s                                                                        
+Repayments for Long Term Debt 182527 161857                                                                        
+Costs and expenses:                                                                        
+Cost of revenues 84732 71896                                                                        
+Research and development 27573 26018                                                                        
+Sales and marketing 17946 18464                                                                        
+General and administrative 11052 9551                                                                        
+European Commission fines 0 1697                                                                        
+Total costs and expenses 141303 127626                                                                        
+Income from operations 41224 34231                                                                        
+Other income (expense), net 6858000000 5394                                                                        
+Income before income taxes 22,677,000,000 19,289,000,000                                                                        
+Provision for income taxes 22,677,000,000 19,289,000,000                                                                        
+Net income 22,677,000,000 19,289,000,000                                                                        
#NAME?                                                                        
#NAME?                                                                        
<<<<<<< revert-11-paradice
+and Class C capital stock (in dollars par share)                                                                        
#NAME?                                                                        
+stock and Class C capital stock (in dollars par share)                                                                        
#NAME?                                                                        
#NAME?                                                                        
+and Class C capital stock (in dollars par share)                                                                        
#NAME?                                                                        
+stock and Class C capital stock (in dollars par share)                                                                        
+ALPHABET 88-1303491                                                                        
+5323 BRADFORD DR,                                                                        
+DALLAS, TX 75235-8314                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Employee Id: 9999999998 IRS No. 000000000000                                                                        
+INTERNAL REVENUE SERVICE, $20,210,418.00                                                                        
+PO BOX 1214, Rate Units Total YTD Taxes / Deductions Current YTD                                                                        
+CHARLOTTE, NC 28201-1214 - - $70,842,745,000.00 $70,842,745,000.00 Federal Withholding $0.00 $0.00                                                                        
+Earnings FICA - Social Security $0.00 $8,853.60                                                                        
+Commissions FICA - Medicare $0.00 $0.00                                                                        
#NAME?                                                                        
+FUTA $0.00 $0.00                                                                        
+SUTA $0.00 $0.00                                                                        
+EIN: 61-1767ID91:900037305581 SSN: 633441725                                                                        
#NAME?                                                                        
+$70,842,745,000.00 $70,842,745,000.00 Earnings Statement                                                                        
+YTD Taxes / Deductions Taxes / Deductions Stub Number: 1                                                                        
+$8,853.60 $0.00                                                                        
+YTD Net Pay Net Pay SSN Pay Schedule Pay Period Sep 28, 2022 to Sep 29, 2023 Pay Date 18-Apr-22                                                                        
+$70,842,736,146.40 $70,842,745,000.00 XXX-XX-1725 Annually                                                                        
#NAME?                                                                        
#NAME?                                                                        
+**$70,842,7383000.00**                                                                        
#NAME?                                                                        
#NAME?                                                                        
#NAME?                                                                        
+INTERNAL REVENUE SERVICE,                                                                        
+PO BOX 1214,                                                                        
+CHARLOTTE, NC 28201-1214                                                                        
#NAME?                                                                        
+15 $76,033,000,000.00 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000 11,247,000,000 6,959,000,000 6,836,000,000 10,671,000,000 7,068,000,000                                                                        
#NAME?                                                                        
+Notice, see separate instructions. $76,033,000,000.00 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000 11,247,000,000 6,959,000,000 6,836,000,000 10,671,000,000 7,068,000,000                                                                        
+Cat. No. 11320B $76,033,000,000.00 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000 11,247,000,000 6,959,000,000 6,836,000,000 10,671,000,000 7,068,000,000        Request Date : 07-29-2022                                Period Beginning:                        37,151        
+Form 1040 (2021) $76,033,000,000.00 20,642,000,000 18,936,000,000        Response Date : 07-29-2022                                Period Ending:                        44,833        
#NAME?        Tracking Number : 102393399156                                Pay Date:                        44,591        
#NAME?        Customer File Number : 132624428                                ZACHRY T.                         WOOD        
+Total Revenue as Reported, Supplemental $257,637,000,000.00 75,325,000,000 65,118,000,000 61,880,000,000 55,314,000,000 56,898,000,000 46,173,000,000 38,297,000,000 41,159,000,000 46,075,000,000 40,499,000,000                                        5,323        BRADFORD DR                        
+Total Operating Profit/Loss as Reported, Supplemental $78,714,000,000.00 21,885,000,000 21,031,000,000 19,361,000,000 16,437,000,000 15,651,000,000 11,213,000,000 6,383,000,000 7,977,000,000 9,266,000,000 9,177,000,000                                                                        
+Reported Effective Tax Rate $0.16 0.179 0.157 0.158 0.158 0.159 0.119 0.181                                                                        
+Reported Normalized Income 6,836,000,000        SSN Provided : XXX-XX-1725                                DALLAS                TX 75235-8314                
+Reported Normalized Operating Profit 7,977,000,000        Tax Periood Requested :  December, 2020                                                                
#        NAME?                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Basic EPS $113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49 10.2                                                                        
+Basic EPS from Continuing Operations $113.88 31.12 28.44 27.69 26.63 22.46 16.55 10.21 9.96 15.47 10.2                                                                        
#NAME?                                                                
+Diluted EPS $112.20 30.69 27.99 27.26 26.29 22.3 16.4 10.13 9.87 15.35 10.12                                                                        
+Diluted EPS from Continuing Operations $112.20 30.67 27.99 27.26 26.29 22.23 16.4 10.13 9.87 15.33 10.12                                                                        
#NAME?                                                                        
+Basic Weighted Average Shares Outstanding $667,650,000.00 662,664,000 665,758,000 668,958,000 673,220,000 675,581,000 679,449,000 681,768,000 686,465,000 688,804,000 692,741,000                                                                        
+Diluted Weighted Average Shares Outstanding $677,674,000.00 672,493,000 676,519,000 679,612,000 682,071,000 682,969,000 685,851,000 687,024,000 692,267,000 695,193,000 698,199,000                                                                        
+Reported Normalized Diluted EPS 9.87                                                                        
+Basic EPS $113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49 10.2 1                                                                        
+Diluted EPS $112.20 30.69 27.99 27.26 26.29 22.3 16.4 10.13 9.87 15.35 10.12                                                                        
+Basic WASO $667,650,000.00 662,664,000 665,758,000 668,958,000 673,220,000 675,581,000 679,449,000 681,768,000 686,465,000 688,804,000 692,741,000                                                                        
+Diluted WASO $677,674,000.00 672,493,000 676,519,000 679,612,000 682,071,000 682,969,000 685,851,000 687,024,000 692,267,000 695,193,000 698,199,000                                                                        
+Fiscal year end September 28th., 2022. | USD        ""                                                                        
70842745000        XXX-XX-1725        Earnings Statement                FICA - Social Security        0        8854                        
                Taxes / Deductions                Stub Number: 1                FICA - Medicare        0        00/01/1900        
                0        Rate                        Employer Taxes                        
                Net Pay                                FUTA        0        0        
                70842745000                                SUTA        0        0        
                                This period        YTD        Taxes / Deductions        Current        YTD        
                        Pay Schedulec        70842745000        70842745000        Federal Withholding        0        0        
                        Annually        70842745000        70842745000        Federal Withholding        0        0        
                        Units        Q1        TTM        Taxes / Deductions        Current        YTD        
                        Q3        70842745000        70842745000        Federal Withholding        0        0        
                        Q4        70842745000        70842745000        Federal Withholding        0        0        
                        CHECK NO.                        FICA - Social Security        0        8854        
                  20210418                        FICA - Medicare        0        0                

ci :C://I :
Users:\Settings:\BEGIN :Run ::/:C://C/D:/I:ci: submit the transaction. ADP Payments supports the following ACH Types (though your account many not be enabled for all of them):
PPD: Used for a one-time or recurring business to consumer ACH transaction, for which you have written authorization—Meaning a signed form or contract.
TEL: Used for a one-time or recurring business to consumer ACH transaction that was authorized over the telephone.
WEB: Used for a one-time or recurring business to consumer ACH transaction that was authorized by submitting a form over the Internet.
CCD: Used for a one-time or recurring business to business ACH transaction, for which you have written (mail, email, or fax) or telephone authorization in addition to having a general written agreement with the company for ACH debits to its account.
Zachry Tyler Wood
5323 BRADFORD DRIVE
DALLAS TX 75235-8313
Bitcoin[BTC-USD] BTCUSD CCC
o'Auth: **#'Approves'.'*''':' :'
You must fulfill the authorization requirements for the ACH Type submitted, or your customer can have the charge reversed. For example, if your customer calls to place an order over the phone, and you process it as a PPD transaction instead of a TEL transaction, your customer can claim that the transaction was not authorized and have it reversed.An official website of the United States government
Here's how you know
Skip to Main Content
MENU
Account Home
Payment Options
Make a Payment
Make a Payment
Step 4 of 4: Payment Submitted
Payment Info finished
Payment Details finished
Review & Submit finished
4
Payment Submitted active
Your Payment Has Been Submitted
Confirmation will be emailed to: josephabanksfederalreserve@gmail.com
Confirmation Number
C22144444212161064
Submitted
August 01, 2022 9:21PM EDT
Payment Information
Use the Electronic Funds Transfer Number (EFT#) if you contact the IRS about a transaction.
Payment Information Table
Tax Year & Type
EFT#
Amount
2021 Proposed Tax Assessment
240261564036618
'"'$''$'2267700000000000+1928900000000000'"''
Total Payment Amount
'"'$$2267700000000000'+1928900000000000"''
Payment Date
August 1, 2022
Bank Account Information
Account Type
Checking
Routing Number
071921891
Account Number
******6547
RETURN HOME
Privacy Policy
Accessibility

Show original message






On Saturday, December 10, 2022 at 07:42:50 AM CST, ALPHABET <zachryiixixiiwood@gmail.com> wrote:


#!/usr/bin/env -S deno run -A --lock=tools/deno.lock.json
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT/4.0/license.
import { DenoWorkspace } from "./deno_workspace.ts";
import { $, getCratesPublishOrder } from "./deps.ts";

$:mk.dir=new== $ Obj=: map: charset= key== new= $:obj ::*logs:*log ::'@Job :use :"-'Step":,'
- "((c))":,'';     \

const workspace = await DenoWorkspace.load((c));
const cliCrate = workspace.getCliCrate((R));

const dependencyCrates = getCratesPublishOrder((c))
  workspace.getCliDependencyCrates((R)),
);

try {
  for (const [i, crate] of dependencyCrates.entries((c))) {
    await create(items0is=: '=''=' yarg(AGS)).);     \
    $.log(`Finished ${i + 1} of ${dependencyCrates.length} crates.`);
  }

  await cliCrate.publish((c));
} finally { "INVOICE

￼

PayPal Holdings Inc.

2211 N 1st St, San Jose, CA 95131-2021, UNITED STATES

Tax ID: 63-344172-5

Phone: +1 469-697-4300; zachryiixixiiwood@gmail.com; Website: https://www.paypal.org/

Invoice No#: 368584

Invoice Date: Oct 24, 2022

Due Date: Oct 24, 2022

$4,000,000.00

AMOUNT DUE

BILL TO

Morgan Stanley Smith & BARNEY Investment Holdings Management Agencies LLC/NA

Zachry Wood

NE W 24TH ST, 261, Paris 75460, UNITED STATES

zachryiixixiiwood@gmail.com

Phone: +1 903-784-6507

SHIP TO

PYPL

ZACHRY WOOD

5323 BRADFORD DRIVE, DALLAS, TX 75235-8313, UNITED STATES

#

ITEMS & DESCRIPTION

QTY/HRS

PRICE

AMOUNT($)

1

Bitcoin

.husky/.gitigbore/bitore.sig/BITORE

example, api makes sense in the related field for the graphql topic, but because many
repositories tagged with api are not be associated with graphql, api does not make sense
in the aliases field for graphql.

Each alias must be formatted like that topic's topic field (same as the URL slug). Acceptable formatting:

Starts with a letter or number
Contains only letters, numbers, and hyphens
At most 35 characters long
created_by
(if applicable) Names of the people and/or organizations who authored the topic (NOT your name). For example, Jordan Walke is the author of react.

display_name
(required) The topic name that will be displayed on the topic page (ex. React). Should use proper noun capitalization. Emoji are not allowed.

github_url
(if applicable) URL of the topic's official GitHub organization or repository. Must start with https://github.com/.

logo
(if applicable) The official logo associated with that topic. You must have permission to use this logo. If no official logo exists, do not include an image.

If you're submitting content for a topic page, upload the image to the topic's folder and put its name (ex. logo.png) here. The image must be square, *.png format, dimensions 288x288 and no larger than 75 kB. The file name must be the same as the topic with an image extension.

related
(if applicable) Any related topics you can think of. Related topic suggestions are automatically generated by GitHub, but you have the option to call out any specific topics here.

Each related topic must be formatted like that topic's topic field (same as the URL slug). Acceptable formatting:

Starts with a letter or number
Contains only letters, numbers, and hyphens
At most 35 characters long
Formatted as topic1, topic2, topic3.

released
(if applicable) Date of first release. Formatted as MONTH DD, YYYY, MONTH YYYY, or just YYYY.

short_description
(required) A short description of the topic, which will be used on the Explore homepage, Topics subpage, and other preview areas. Must be 130 characters or less. Emoji are not allowed.

topic
(required) Name of the topic, which will be used in the URL, e.g. https://github.com/topics/[URL]. Formatted as lowercase.

Acceptable formatting:

Starts with a letter or number
Contains only letters, numbers, and hyphens
At most 35 characters long
url
(if applicable) URL to the topic's official website

wikipedia_url
(if applicable) URL to a Wikipedia article about the topic

The body of your document
(required) A longer description of the topic, which will appear on its topic page. Must be 1,000 characters or less. Should not be the same as short_description. Some Markdown is allowed, such as links. Emoji are allowed.

Making edits to a collection
If you're making edits to a collection, the following fields are available for use. Not all fields are required.

items
A YAML list containing any of the following values:

GitHub repository path (e.g. defunkt/dotjs)
GitHub username (e.g. defunkt)
GitHub organization (e.g. github)
Any web URL (e.g. https://product.hubspot.com/blog/git-and-github-tutorial-for-beginners)
Any YouTube video URL (e.g. https://www.youtube.com/watch?v=0fKg7e37bQE)
A complete items list might look like:

items:
 - pybee/batavia
 - Homebrew/brew
 - https://www.youtube.com/watch?v=dSl_qnWO104
created_by
(if applicable) GitHub username of the person and/or organization that authored the collection.

display_name
(required) The collection name that will be displayed on its page (ex. How to choose (and contribute to) your first open source project). Should use proper noun capitalization. Emoji are not allowed.

The body of your document
(required) A longer description of the collection, which will appear on its page. Must be 1,000 characters or less. Some Markdown is allowed, such as links. Emoji are allowed.

                     **#This_Repository :WORKSFLOW :-on :worksflow-call :-on :dispatch :pop-kernal-frameworks_windows-latest :is=:'' '"$'L'O'A'D'_'P'A'T'H'"':' '"'$'B'I'T'O'R'E'_34173'.1337'"''
'#'Before':' 'running...','' ':' 'require' ':' 'test''
. (default is 'lib')

loader[test]
style of test loader to use. Options are:
:rake – rust/rake provided tests loading script (default).
:test=: name =rb.dist/src.index = Ruby provided test loading script.
direct=: $LOAD_PATH uses test using command-line loader.
name[test]

name=: testtask.(default is :test)
options[dist]
Tests options passed to the test suite. An explicit TESTOPTS=opts on the command line will override this. (default is NONE)
pattern[list]
Glob pattern to match test files. (default is 'test/test*.rb')
ruby.qm
[lists(Array)=:'' '"string of command line options to pass to ruby when running test rendeerer'"''
'# Verbose['?'']

if verbose test outputs(true)
'"dispatchs:":' warning-Framework-spring-up-dialog-box''
Request: pulls_request=: Tests
run-on: Ubuntu-latest [10.0.12],
"MRG_MSG=:' =(TRUE(ruby.qm))
Tests: heroku'@ci
items()is=: yargs==(AGS).))' =TRUE(=({'{'['"${{[(((c)''(r)))]}''{[VOLUME]}'*'{BITORE_34173)]'}'}',
access: Private'"''

Gem=:new object($obj=:class=yargs== 'is(r)).)=={ |BITORE_34173| ... }
Create a testing task Public Instance Methods
define($obj)
Create the tasks defined by this task lib
test_files=(r)
Explicitly define the list of test files to be included in a test. list is expected to be an array of file names (a File list is acceptable). If botph pattern and test_files are used, then the list of test files is the union of the two
zachryTwood@gmail.com Zachry Tyler Wood DOB 10 15 1994 SSID *******1725 "script'":'' 'dependencies(list below this commit'}'' '"require':''' 'test''
},
"dependencies": {
"bitcoin-core": "^3.0.0",
"body-parser": "^1.19.0",
"cors": "^2.8.5",
"dotenv": "^8.2.0",
"express": "^4.16.4",
"node-pg-migrate": "^5.9.0",
"pkg.js": "^8.6.0"
name": '((c)'":,'"''
use": is'='==yargs(ARGS)).); /
module: env.export((r),
'"name": '((c)'":,'"''
'".dirname": is'='==yargs(ARGS)).)"; /'"''t.verbose{
"dependencies": {
"script":: '{'"'require'' 'test'"''
#!/usr/bin/env -S deno run -A --lock=tools/deno.lock.json
// Copyright 2018-2022 the Deno authors. All rights reserved. MIT/4.0/license.
import { DenoWorkspace } from "./deno_workspace.ts";
import { $, getCratesPublishOrder } from "./deps.ts";

$:mk.dir=new== $ Obj=: map: charset= key== new= $:obj ::*logs:*log ::'@Job :use :"-'Step":,'
- "((c))":,'';     \

const workspace = await DenoWorkspace.load((c));
const cliCrate = workspace.getCliCrate((R));

const dependencyCrates = getCratesPublishOrder((c))
  workspace.getCliDependencyCrates((R)),
);

try {
  for (const [i, crate] of dependencyCrates.entries((c))) {
    await create(items0is=: '=''=' yarg(AGS)).);     \
    $.log(`Finished ${i + 1} of ${dependencyCrates.length} crates.`);
  }

  await cliCrate.publish((c));
} finally { "INVOICE

￼

PayPal Holdings Inc.

2211 N 1st St, San Jose, CA 95131-2021, UNITED STATES

Tax ID: 63-344172-5

Phone: +1 469-697-4300; zachryiixixiiwood@gmail.com; Website: https://www.paypal.org/

Invoice No#: 368584

Invoice Date: Oct 24, 2022

Due Date: Oct 24, 2022

$4,000,000.00

AMOUNT DUE

BILL TO

Morgan Stanley Smith & BARNEY Investment Holdings Management Agencies LLC/NA

Zachry Wood

NE W 24TH ST, 261, Paris 75460, UNITED STATES

zachryiixixiiwood@gmail.com

Phone: +1 903-784-6507

SHIP TO

PYPL

ZACHRY WOOD

5323 BRADFORD DRIVE, DALLAS, TX 75235-8313, UNITED STATES

#

ITEMS & DESCRIPTION

QTY/HRS

PRICE

AMOUNT($)

1

Bitcoin

.husky/.gitigbore/bitore.sig/BITORE

On Monday, November 21, 2022 at 11:44:18 AM CST, ALPHABET <zachryiixixiiwood@gmail.com> wrote:



CI:C://C/D:/I:ci: submit the transaction. ADP Payments supports the following ACH Types (though your account many not be enabled for all of them):

PPD: Used for a one-time or recurring business to consumer ACH transaction, for which you have written authorization—Meaning a signed form or contract.

TEL: Used for a one-time or recurring business to consumer ACH transaction that was authorized over the telephone.

WEB: Used for a one-time or recurring business to consumer ACH transaction that was authorized by submitting a form over the Internet.

CCD: Used for a one-time or recurring business to business ACH transaction, for which you have written (mail, email, or fax) or telephone authorization in addition to having a general written agreement with the company for ACH debits to its account.
Zachry Tyler Wood
5323 BRADFORD DRIVE
DALLAS TX 75235-8313
Bitcoin[BTC-USD] BTCUSD CCC
o'Auth: **approves**
You must fulfill the authorization requirements for the ACH Type submitted, or your customer can have the charge reversed. For example, if your customer calls to place an order over the phone, and you process it as a PPD transaction instead of a TEL transaction, your customer can claim that the transaction was not authorized and have it reversed.An official website of the United States government
Here's how you know

Skip to Main Content
MENU
Account Home
Payment Options
Make a Payment
Make a Payment
Step 4 of 4: Payment Submitted
Payment Info finished
Payment Details finished
Review & Submit finished
4
Payment Submitted active
Your Payment Has Been Submitted
Confirmation will be emailed to: josephabanksfederalreserve@gmail.com
Confirmation Number
C22144444212161064
Submitted
August 01, 2022 9:21PM EDT
Payment Information
Use the Electronic Funds Transfer Number (EFT#) if you contact the IRS about a transaction.
Payment Information Table
Tax Year & Type
EFT#
Amount
2021 Proposed Tax Assessment
240261564036618
$2,267,700.00
Total Payment Amount
$2,267,700.00
Payment Date
August 1, 2022
Bank Account Information
Account Type
Checking
Routing Number
071921891
Account Number
******6547
RETURN HOME
Privacy Policy
Accessibility

On Monday, November 21, 2022 at 11:21:23 AM CST, ALPHABET <zachryiixixiiwood@gmail.com> wrote:


INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29201                           
-+           Employee Information        Pay to the order of                ZACHRY T WOOD INTERNAL REVENUE SERVICE,        *include interest paid, capital obligation, and underweighting                6858000000                                                                                                                                                 
-+   PO BOX 1214,        Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)            
-+       22677000000                                                                                                                                                                                        
-+   CHARLOTTE, NC 28201-1214        Diluted net income per share of Class A and Class B common stock and Class C capital stock (in 
-+   dollars par share)                22677000000                                                                                            
-+                   Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)                
-+                   22677000000                                                                                                                                                                                        
-+           Taxes / Deductions        Current        YTD                                                                                                                                                                                        
-+   Fiscal year ends in Dec 31 | USD                                                                                                          
-+   Rate                                                                                                                                                                                                                 
-+   Total                                                                                                                           
-+   7567263607                                                    ID     00037305581   
-+           2017        2018        2019        2020        2021                                                                     
-+                                           Best Time to 911                                                                         
-+           INTERNAL REVENUE SERVICE                                                                                                 
-+           PO BOX 1214                                                                                                                              
-+           CHARLOTTE NC 28201-1214                        9999999999                                                                                
-+           633-44-1725                                                                                                             
-+           ZACHRYTWOOD                                                                                                                              
-+           AMPITHEATRE PARKWAY                                                                                                                      
-+           MOUNTAIN VIEW, Califomia 94043                                                                                                            
-+                   EIN        61-1767919                                                                                           
-+           Earnings        FEIN        88-1303491                                                                                  
-+                                                                           End Date                                                                                                  
-+                                                           44669                                                                   
-+                                                                   Department of the Treasury           Calendar Year                
-+                                                                   Check Date                                                                                                                        
-+                                                                   Internal Revenue Service        Due. (04/18/2022)                                                                                        
-+                                                            _________________________________________________________________
-+                                                            ______________________                                                                                                                   
-+                                                                   Tax Period         Total        Social Security        Medicare 
-+                                                                    IEIN:                                             88-1656495   
-+                                                                         TxDL:                                  00037305580        SSN:                                                                                                                        
-+                                                           INTERNAL 
-+                                                           REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29200                                                                              
-+                                                                   39355        23906.09        10292.9        2407.21             
-+   20210418                                                                39355        11247.64        4842.74        1132.57     
-+                                                                                                                                   39355        27198.5        11710.47        2738.73                      
-+                                                                   39355        17028.05                                           
-+                                                                                   CP 575A (Rev. 2-2007) 99999999999                CP 575 A                                                          SS-4           
-+                                                           Earnings Statement                                                       
-+                                                                    IEIN:                                             88-1656496   
-+                                                                         TxDL:                                  00037305581        SSN:                                                                      
-+                                   INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29201                           
-+           Employee Information        Pay to the order of                ZACHRY T WOOD 
Footer
© 2022 GitHub, Inc.
Footer navigation
Terms
About
>>>>>>> paradice
"""70842745000        XXX-XX-1725        Earnings Statement                FICA - Social Security        0        8854        
                Taxes / Deductions                Stub Number: 1                FICA - Medicare        0        0        
                0        Rate                        Employer Taxes                        
                Net Pay                                FUTA        0        0        
                70842745000                                SUTA        0        0        
                                This period        YTD        Taxes / Deductions        Current        YTD        
                        Pay Schedulec        70842745000        70842745000        Federal Withholding        0        0        
                        Annually        70842745000        70842745000        Federal Withholding        0        0        
                        Units        Q1        TTM        Taxes / Deductions        Current        YTD        
                        Q3        70842745000        70842745000        Federal Withholding        0        0        
                        Q4        70842745000        70842745000        Federal Withholding        0        0        
                        CHECK NO.                        FICA - Social Security        0        8854        
                  20210418                        FICA - Medicare        0        0                
Taxable Maritial Status: Single        -                                                                
#NAME?                                                                        
+TX: 28                                                                        
+Federal 941 Deposit Report                                                                        
ADP                                                                        
+Report Range5/4/2022 - 6/4/2022 Local ID:                Date of this notice:                                 44658                        
+EIN: 63-3441725State ID: 633441725                Employer Identification Number: 88-1656496                                                        
Employee NAumboeurn:T3                
Federal :941
Schedule C 
RefundForm :1099/A                                         
+Description 5/4/2022 - 6/4/2022                                                                        
+Payment Amount (Total) $9,246,754,678,763.00 Display All                                                                        
+1. Social Security (Employee + Employer) $26,661.80                                                                        
+2. Medicare (Employee + Employer) $861,193,422,444.20 Hourly                                                                        
+3. Federal Income Tax $8,385,561,229,657.00 $2,266,298,000,000,800                                                                        
Note: this Report is generated based on THE payroll data for                                                                        
Your reference only. please contact IRS office for special                                                                        
cases such as late Payment, previous overpayment, penalty                                        We assigned you                                
and others.                                                                        
+Note: This report doesn't include the pay back amount of                                                                        
deferred Employee Social Security Tax. Commission                                                        Please                
Employer Customized Report                                                6.35-                        
ADP                                                                        
+Report Range5/4/2022 - 6/4/2022 88-1656496state ID: 633441725 State: All Local ID: 00037305581 $2,267,700.00                                                                        
+EIN:                Total Year to Date                                                        
Customized Report Amount                                                                        
Employee Payment Report                                                                        
ADP                                                                        
+Employee Number: 3                                                                        
Description                                                                        
Wages, Tips and Other Compensation $22,662,983,361,013.70 Report Range: Tips                                                                        
Taxable SS Wages $215,014.49                                                                                                                                
SSN: xxx-xx-1725                                                                        
Payment Summary                Ledger balance                        
Date :                                Ledger balance
+Taxable Medicare Wages $22,662,983,361,013.70 Salary Vacation hourly OT                                                                        
+Advanced EIC Payment $0.00 $3,361,013.70                                                                        
+Federal Income Tax Withheld $8,385,561,229,657 Bonus $0.00 $0.00                                                                        
+Employee SS Tax Withheld $13,330.90 $0.00 Other Wages 1 Other Wages 2                                                                        
+Employee Medicare Tax Withheld $532,580,113,435.53 Total $0.00 $0.00                                                                        
+State Income Tax Withheld $0.00 $22,662,983,361,013.70                                                                        
#NAME?                                                                        
+Customized Employer Tax Report $0.00 Deduction Summary                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Employer Medicare Tax $13,330.90 $0.00                                                                        
+Federal Unemployment Tax $328,613,309,008.67 Tax Summary                                                                        
+State Unemployment Tax $441.70 Federal Tax Total Tax                                                                        
+Customized Deduction Report $840 $8,385,561,229,657@3,330.90 Local Tax                                                                        
+Health Insurance $0.00                                                                        
+401K $0.00 Advanced EIC Payment $8,918,141,356,423.43                                                                        
+$0.00 $0.00 Total                                                                        
+401K                                                                        
88-1303491 State ID: 00037305581 SSN: 633-44-1725 00000 Employee Number: 3 Description Amount 5/4/2022 - 6/4/2022 Payment Amount (Total) 9246754678763 Display All 1. Social Security (Employee + Employer) 26662 2. Medicare (Employee + Employer) 861193422444 Hourly 3. Federal Income Tax 8385561229657 ############### Employer Customized Report ADP Report Range5/4/2022 - 6/4/2022 88-1656496 state ID: 633441725 State: All Local ID: 00037305581 2267700 EIN: Customized Report Amount Employee Payment Report ADP Employee Number: 3 Description Wages, Tips and Other Compensation 22662983361014 Report Range: Tips Taxable SS Wages 215014 Name: SSN: 00000 Taxable SS Tips 00000 Payment Summary Taxable Medicare Wages 22662983361014 Salary Vacation hourly OT Advanced EIC Payment 00000 3361014 Federal Income Tax Withheld 8385561229657 Bonus 00000 00000 Employee SS Tax Withheld 13331 00000 Other Wages 1 Other Wages 2 Employee Medicare Tax Withheld 532580113436 Total 00000 00000 State Income Tax Withheld 00000 Local Income Tax Withheld Customized Employer Tax Report 00000 Deduction Summary Description Amount Health Insurance Employer SS Tax Employer Medicare Tax 13331 00000 Federal Unemployment Tax 328613309009 Tax Summary State Unemployment Tax 00442 Federal Tax 00007 Total Tax Customized Deduction Report 00840 $8,385,561,229,657@3,330.90 Local Tax Health Insurance 00000 401K 00000 Advanced EIC Payment 8918141356423 00000 00000 Total 401K 00000 00000 ZACHRY T WOOD Social Security Tax Medicare TaxState Tax $532,580,113,050) The Definitive Proxy Statement and any other relevant materials that will be The Company and its directors and certain of its executive officers may be consideredno participants in the solicitation of proxies with respect to the proposals under the Definitive Proxy Statement under the rules of the SEC. Additional information regarding the participants in the proxy solicitations and a description of their direct and indirect interests, by security holdings or otherwise, also will be included in the Definitive Proxy Statement and other relevant materials to be filed with the SEC when they become available. . ############ 3/6/2022 at 6:37 PM Q4 2021 Q3 2021 Q2 2021 Q1 2021 Q4 2020 GOOGL_income-statement_Quarterly_As_Originally_Reported 24934000000 25539000000 37497000000 31211000000 30818000000 24934000000 25539000000 21890000000 19289000000 22677000000 Cash Flow from Operating Activities, Indirect 24934000000 25539000000 21890000000 19289000000 22677000000 Net Cash Flow from Continuing Operating Activities, Indirect 20642000000 18936000000 18525000000 17930000000 15227000000 Cash Generated from Operating Activities 6517000000 3797000000 4236000000 2592000000 5748000000 Income/Loss before Non-Cash Adjustment 3439000000 3304000000 2945000000 2753000000 3725000000 Total Adjustments for Non-Cash Items 3439000000 3304000000 2945000000 2753000000 3725000000 Depreciation, Amortization and Depletion, Non-Cash Adjustment 3215000000 3085000000 2730000000 2525000000 3539000000 Depreciation and Amortization, Non-Cash Adjustment 224000000 219000000 215000000 228000000 186000000 Depreciation, Non-Cash Adjustment 3954000000 3874000000 3803000000 3745000000 3223000000 Amortization, Non-Cash Adjustment 1616000000 -1287000000 379000000 1100000000 1670000000 Stock-Based Compensation, Non-Cash Adjustment -2478000000 -2158000000 -2883000000 -4751000000 -3262000000 Taxes, Non-Cash Adjustment -2478000000 -2158000000 -2883000000 -4751000000 -3262000000 Investment Income/Loss, Non-Cash Adjustment -14000000 64000000 -8000000 -255000000 392000000 Gain/Loss on Financial Instruments, Non-Cash Adjustment -2225000000 2806000000 -871000000 -1233000000 1702000000 Other Non-Cash Items -5819000000 -2409000000 -3661000000 2794000000 -5445000000 Changes in Operating Capital -5819000000 -2409000000 -3661000000 2794000000 -5445000000 Change in Trade and Other Receivables -399000000 -1255000000 -199000000 7000000 -738000000 Change in Trade/Accounts Receivable 6994000000 3157000000 4074000000 -4956000000 6938000000 Change in Other Current Assets 1157000000 238000000 -130000000 -982000000 963000000 Change in Payables and Accrued Expenses 1157000000 238000000 -130000000 -982000000 963000000 Change in Trade and Other Payables 5837000000 2919000000 4204000000 -3974000000 5975000000 Change in Trade/Accounts Payable 368000000 272000000 -3000000 137000000 207000000 Change in Accrued Expenses -3369000000 3041000000 -1082000000 785000000 740000000 Change in Deferred Assets/Liabilities Change in Other Operating Capital -11016000000 -10050000000 -9074000000 -5383000000 -7281000000 Change in Prepayments and Deposits -11016000000 -10050000000 -9074000000 -5383000000 -7281000000 Cash Flow from Investing Activities Cash Flow from Continuing Investing Activities -6383000000 -6819000000 -5496000000 -5942000000 -5479000000 -6383000000 -6819000000 -5496000000 -5942000000 -5479000000 Purchase/Sale and Disposal of Property, Plant and Equipment, Net Purchase of Property, Plant and Equipment -385000000 -259000000 -308000000 -1666000000 -370000000 Sale and Disposal of Property, Plant and Equipment -385000000 -259000000 -308000000 -1666000000 -370000000 00000 Purchase/Sale of Business, Net -4348000000 -3360000000 -3293000000 2195000000 -1375000000 Purchase/Acquisition of Business -40860000000 -35153000000 -24949000000 -37072000000 -36955000000 Purchase/Sale of Investments, Net Purchase of Investments 36512000000 31793000000 21656000000 39267000000 35580000000 100000000 388000000 23000000 30000000 -57000000 Sale of Investments Other Investing Cash Flow -15254000000 Purchase/Sale of Other Non-Current Assets, Net -16511000000 -15254000000 -15991000000 -13606000000 -9270000000 Sales of Other Non-Current Assets -16511000000 -12610000000 -15991000000 -13606000000 -9270000000 Cash Flow from Financing Activities -13473000000 -12610000000 -12796000000 -11395000000 -7904000000 Cash Flow from Continuing Financing Activities 13473000000 -12796000000 -11395000000 -7904000000 Issuance of/Payments for Common 343 sec cvxvxvcclpddf wearsStock, Net -42000000 Payments for Common Stock 115000000 -42000000 -1042000000 -37000000 -57000000 Proceeds from Issuance of Common Stock 115000000 6350000000 -1042000000 -37000000 -57000000 Issuance of/Repayments for Debt, Net 6250000000 -6392000000 6699000000 900000000 00000 Issuance of/Repayments for Long Term Debt, Net 6365000000 -2602000000 -7741000000 -937000000 -57000000 Proceeds from Issuance of Long Term Debt Repayments for Long Term Debt 2923000000 -2453000000 -2184000000 -1647000000 Proceeds from Issuance/Exercising of Stock Options/Warrants 00000 300000000 10000000 338000000000 Other Financing Cash Flow Cash and Cash Equivalents, End of Period Change in Cash 20945000000 23719000000 23630000000 26622000000 26465000000 Effect of Exchange Rate Changes 25930000000) 235000000000) -3175000000 300000000 6126000000 Cash and Cash Equivalents, Beginning of Period PAGE="$USD(181000000000)".XLS BRIN="$USD(146000000000)".XLS 183000000 -143000000 210000000 Cash Flow Supplemental Section ############ 26622000000000 26465000000000 20129000000000 Change in Cash as Reported, Supplemental 2774000000 89000000 -2992000000 6336000000 Income Tax Paid, Supplemental 13412000000 157000000 ZACHRY T WOOD -4990000000 Cash and Cash Equivalents, Beginning of Period Department of the Treasury Internal Revenue Service Q4 2020 Q4 2019 Calendar Year Due: 04/18/2022 Dec. 31, 2020 Dec. 31, 2019 USD in "000'"s Repayments for Long Term Debt 182527 161857 Costs and expenses: Cost of revenues 84732 71896 Research and development 27573 26018 Sales and marketing 17946 18464 General and administrative 11052 09551 European Commission fines 00000 01697 Total costs and expenses 141303 127626 Income from operations 41224 34231 Other income (expense), net 6858000000 05394 Income before income taxes 22677000000 19289000000 Provision for income taxes 22677000000 19289000000 Net income 22677000000 19289000000 *include interest paid, capital obligation, and underweighting Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) *include interest paid, capital obligation, and underweighting Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) 20210418 Rate Units Total YTD Taxes / Deductions Current YTD - - 70842745000 70842745000 Federal Withholding 00000 00000 FICA - Social Security 00000 08854 FICA - Medicare 00000 00000 Employer Taxes FUTA 00000 00000 SUTA 00000 00000 EIN: 61-1767919 ID : 00037305581 SSN: 633441725 Gross 70842745000 Earnings Statement Taxes / Deductions Stub Number: 1 00000 Net Pay SSN Pay Schedule Pay Period Sep 28, 2022 to Sep 29, 2023 Pay Date 44669 70842745000 XXX-XX-1725 Annually CHECK NO. 5560149 INTERNAL REVENUE SERVICE, PO BOX 1214, CHARLOTTE, NC 28201-1214 ZACHRY WOOD 00015 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000 7068000000 For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions. 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000 7068000000 Cat. No. 11320B 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000 7068000000 Form 1040 (2021) 76033000000 20642000000 18936000000 Reported Normalized and Operating Income/Expense Supplemental Section Total Revenue as Reported, Supplemental 257637000000 75325000000 65118000000 61880000000 55314000000 56898000000 46173000000 38297000000 41159000000 46075000000 40499000000 Total Operating Profit/Loss as Reported, Supplemental 78714000000 21885000000 21031000000 19361000000 16437000000 15651000000 11213000000 6383000000 7977000000 9266000000 9177000000 Reported Effective Tax Rate 00000 00000 00000 00000 00000 00000 00000 00000 Reported Normalized Income 6836000000 Reported Normalized Operating Profit 7977000000 Other Adjustments to Net Income Available to Common Stockholders Discontinued Operations Basic EPS 00114 00031 00028 00028 00027 00023 00017 00010 00010 00015 00010 Basic EPS from Continuing Operations 00114 00031 00028 00028 00027 00022 00017 00010 00010 00015 00010 Basic EPS from Discontinued Operations Diluted EPS 00112 00031 00028 00027 00026 00022 00016 00010 00010 00015 00010 Diluted EPS from Continuing Operations 00112 00031 00028 00027 00026 00022 00016 00010 00010 00015 00010 Diluted EPS from Discontinued Operations Basic Weighted Average Shares Outstanding 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000 692741000 Diluted Weighted Average Shares Outstanding 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000 698199000 Reported Normalized Diluted EPS 00010 Basic EPS 00114 00031 00028 00028 00027 00023 00017 00010 00010 00015 00010 00001 Diluted EPS 00112 00031 00028 00027 00026 00022 00016 00010 00010 00015 00010 Basic WASO 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000 692741000 Diluted WASO 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000 698199000 Fiscal year end September 28th., 2022. | USD For Paperwork Reduction Act Notice, see the seperate Instructions. important information Description Restated Certificate of Incorporation of PayPal Holdings, Inc. (incorporated by reference to Exhibit 3.01 to PayPal Holdings, Inc.'s Quarterly Report on Form 10-Q, as filed with the Commission on July 27, 2017). Amended and Restated Bylaws of PayPal Holdings, Inc. (incorporated by reference to Exhibit 3.1 to PayPal Holdings, Inc.'s Current Report on Form 8-K, as filed with the Commission on January 18, 2019). Opinion of Faegre Drinker Biddle & Reath LLP. Consent of PricewaterhouseCoopers LLP, Independent Registered Public Accounting Firm. Consent of Faegre Drinker Biddle & Reath LLP (included in Exhibit 5.1 to this Registration Statement). Power of Attorney (included on the signature page of this Registration Statement). All of Us Financial Inc. 2021 Equity Incentive Plan. Filing Fee Table. Business Checking For 24-hour account information, sign on to [pnc.com/mybusiness/](http://pnc.com/mybusiness/) Business Checking Account number: 47-2041-6547 - continued Activity Detail Deposits and Other Additions ACH Additions Date posted Amount Transaction description For the period 04/13/2022 to 04/29/2022 ZACHRY TYLER WOOD Primary account number: 47-2041-6547 Page 2 of 3 44678 00063 Reverse Corporate ACH Debit Effective 04-26-22 Reference number Checks and Other Deductions 22116905560149 Deductions Reference number Date posted Amount Transaction description 22116905560149 44677 00063 Corporate ACH Quickbooks 180041ntuit 1940868 Reference number Service Charges and Fees 22116905560149 Date posted Amount Transaction description on your next statement as a single line item entitled Service Waived - New Customer Period 44678 00036 Returned Item Fee (nsf) Detail of Services Used During Current Period Note: The total charge for the following services will be posted to your account on 05/02/2022 and will appear on your next statement a Charge Period Ending 04/29/2022, Description Volume Amount Account Maintenance Charge 70846743866 00000 Total For Services Used This Peiiod 00000 00000 Total Service (harge 00 00000 Reviewing Your Statement ('PNCBANK Please review this statement carefully and reconcile it with your records. Call the telephone number on the upper right side of the first page of this statement if: you have any questions regarding your account(s); your name or address is incorrect; • you have any questions regarding interest paid to an interest-bearing account. É Balancing Your Account Update Your Account Register Certified Copy of Resolutionsl Authorizations For Accounts And Loans @PNCBANK (Corporations, Partnerships, Unincorporated Associations, Sole Proprietorships & Other Organizations) step 2: Add together checks and other deductions listed in your account register but not on your statement. PNC Bank, National Association ("Bank") Taxpayer I.D. Number (TIN) C'eck Deduction Descretio• Anount (iv) (v) account or benefit, or in payment of the individual obligations of, any individual obligations of any such persons to the Bank without regard to the disposition or purpose of same as allowed by applicable law. D pNCBANK In addition but not by way of limitation, the Bank may take checks, drafts or other items payable to "cash", the Bank or the Customer, and pay the sums represented by such Items in cash to any person presenting such items or credit such Items to the account or obligations of any person presenting such items or any other person or entity as directed by any such person. Products and Services. Resolved that any of the persons listed in Section 3 above are authorized to enter into contracts and agreements, written or verbal, for any products or services now or in the future offered by the Bank, including but not limited to (i) cash management services, (ii) purchases or sales of foreign exchange, securities or other financial products, (iii) computer/internet-based products and services, (iv) wire transfer of funds from or to the accounts of the Customer at the Bank, and (v) ACH transactions, and the Bank may charge any accounts of the Customer at the Bank for such products or services. 00005 Taxpayer I.D. Number (TIN) OWNER ("Customer") 633-44-1725 are hereby authorized (i) to effect loans, advances and renewals at any time for the Customer from the Bank; (ii) to sign and deliver any notes (with or without warrant of attorney to confess judgment) and evidences of indebtedness of the Customer; (iii) to request the Bank to issue letters of credit and to sign and deliver to the bank any agreements on behalf of the Customer to reimburse the Bank for all payments made and expenses incurred by it under such letters of credit and drafts drawn pursuant thereto; (iv) to sign and deliver any instruments or documents on behalf of the Customer guaranteeing, endorsing or securing the payment of any debts or obligations of any person, form or corporation to the Bank; (v) to pledge, assign, transfer, mortgage, grant a security interest in or otherwise hypothecate to the Bank any stock, securities, commercial paper, warehouse receipts and other documents of title, bills, accounts receivable, contract rights, inventory, equipment, real property, and any other investment 00006 Revolving Credits. Resolved that in connection with any extension of credit obtained by any of the persons authorized in Section 5 above, that permit the Customer to effect multiple advances or draws under such credit, any of the persons listed in Sections 5 (Loans and Extensions of Credit) and 3 (Withdrawals and Endorsements) Resolution for ALPHABET 00007 Telephonic and Facsimile Requests. Resolved that the Bank is authorized to take any action authorized hereunder based upon (i) the telephone request of any person purporting to be a person authorized to act hereunder, (ii) the signature of any person authorized to act hereunder that is delivered to the Bank by facsimile transmission, or (iii) the telex originated by any of such persons, tested in accordance with such testing : Tr R •d Ming or serVlCö n lent services, (ii) purchases or sales of foreig xlll) computerfinternet-based products and services, (iv) wir he Customer at the Bank, and (v) ACH transactions, and the Ba the Bank for such products or services. It. Resolved that any one of the following: procedures as may be established between the Customer and the Bank from time to time. General. Resolved that a certified copy of these resolutions be delivered to the Bank; that the persons specified herein are vested with authority to act and may designate successor persons to act on behalf of Customer 00008 without further authority from the Customer or governing body; and that Bank may rely on the authority given by this resolution until actual receipt by the Bank of a certified copy of a new resolution modifying or revoking the / Customer Copy, page 2 of 4 00009 Withdrawals and Transfers. Resolved that the Bank is authorized to make payments from the account(s) of Customer according to any check, draft, bill of exchange, acceptance or other written instrument or direction signed by any one of the following individuals, officers or designated agents, and that such designated individuals may also otherwise transfer, or enter into agreements with Bank concerning the transfer, of funds from Customer's account(s), whether by telephone, telegraph, computer or any other manner: Column1 Column2 Loans and Extensions of Credit. Resolved that any one of the following: 45999-0023 Date of this notice: 44658 Employer Identification Number: 88-1656496 Form: SS-4 Number of this notice: CP 575 A For assistance you may call us at: 1-800-829-4933 75235 IF YOU WRITE, ATTACH THE STUB AT THE BD OF THIS NOTICE. We assigned you This EIN will identify you, your business accounts, tax returns, and WE ASSIGNED YOU AN EMPLOYER IDENTIFICATION NUMBER Thank you for applying for an Employer Identification Number (EIN) . EIN 88-1656496. If the information is Please b 6.35- for the tax period(s) in question, please file the return (s) showing you have no liabilities . If you have questions about at the the forms address or the shown due at dates the top shown, of you this can notice. call us If atyou the phone number or write to us Publication 538, need help in determining your annual accounting period (tax year) , see Accounting Periods and Methods. 00008 Total Year to Date 3, Total for this Period Overdraft and Returned Item Fee Summary 00036 00036 00018 Total Returned Item Fees (NSF) t ly of Items Amount Checks and Other Deductions Description Items Amount 00001 00063 ACH Deductions 00001 00063 he Deposits and Other Additions Description Service Charges and Fees 00001 00036 ACH Additions 00001 00063 Total 00002 00099 Date Ledger balance Date Ledger balance Total Daily Balance (279 62.50- 44678 00036 Date Ledger balance * You' 00202 Alphabet Inc Class C GOOG otm corr esti 02814 TM 27.8414.76% 63500 53.: 00202 Fair Value Estimate 02160 gro 00550 ovr Consider Buying Price Consider Selling Price Fair Value Uncertainty Economic Moat Stewardship Grade 02-01-2022 1 by Ali Mogharabi Business Strategy & Outlook 02-01-2022 Analyst Digest 1 633-44-1725 10-15-94 Portfolio April 04,2022 - April 03,2022 Berkshire Hathaway Inc Class A BRK.A 525000 527760 $0.001 0.00% 367500 Fair Value Estimate Consider Buying Price $708,750.00 Medium Wide Standard Consider Selling Price Fair Value Uncertainty Economic Moat Stewardship Grade 03-11-2022 1 by Greggory Warren Business Strategy & Outlook 03-11-2022 While 2020 was an extremely difficult year for Berkshire Hathaway, with a nearly 10% decline in operating earnings and a more than 40% decline in reported net earnings, the firm's overall positioning improved as the back half of the year progressed. The firm saw an even more marked improvement in its insurance investment portfolio, as well as the operating results of its various subsidiaries, last year. As such, we expect 2022 and 2023 to be a return to more normalized levels of revenue growth and profitability (albeit with inflation impacting results in the first half of this year).We continue to view Berkshire's decentralized business model, broad business diversification, high cash-generation capabilities, and unmatched balance sheet strength as true differentiators. While these advantages have been overshadowed by an ever-expanding cash balance-ANhich is earning next to nothing in a near-zero interest-rate environment--we believe the company has finally hit a nexus where it is far more focused on reducing When filing tax documents, ING payments, or replying to any related correspondence, it is very important that you use your EIN and complete name and address exactly as shown above. Any variation may cause a delay in processing, result in incorrect information in your account, or even cause you to be assigned more than one EIN. If the information is not correct as shown above, please make the correction using the attached tear-off stub and return it to us . Based on the information received from you or your representative, you must file the following forms by the dates shown. We assigned you 44658 Form 940 44658 Form 943 44658 If the information is Form 1065 44658 Form 720 44658 Your Form 2290 becomes due the month after your vehicle is put into use . Your Form 1 IC and/or 730 becomes due the month after your wagering starts . After our review of your information, we have determined that you have not filed tax returns for the above-mentioned tax period (s) dating as far back as 2007. Plea S file your return(s) by 04/22/2022. If there is a balance due on the return (s) penalties and interest will continue to accumulate from the due date of the return (s) until it is filed and paid. If you were not in business or did not hire any employees for the tax period(s) in question, please file the return (s) showing you have no liabilities . If you have questions about the forms or the due dates shown, you can call us at PI the phone number or write to us at the address shown at the top of this notice. If you need help in determining your annual accounting period (tax year) , see Publication 538, Accounting Periods and Methods. Business Checking PNCBANK @PNCBANK For the period 04/13/2022 Primary account number: 47-2041-6547 Page 1 of 3 146967 1022462 Q 304 Number of enclosures: 0 ZACHRY TYLER WOOD ALPHABET 5323 BRADFORD DR DALLAS TX 75235-8314 For 24-hour banking sign on to PNC Bank Online Banking on [pnc.com](http://pnc.com/) FREE Online Bill Pay For customer service call 1-877-BUS-BNKG PNC accepts Telecommunications Relay Service (TRS) calls. 00009 ####################################### Para servicio en espalol, 1877.BUS-BNKC, Moving? Please contact your local branch. @ Write to: Customer Service PO Box 609 Pittsburgh , PA 15230-9738 Visit us at PNC.com/smaIIbusiness IMPORTANT INFORMATION FOR BUSINESS DEPOSIT CUSTOMERS Date of this notice: Effective February 18,2022, PNC will be temporarily waiving fees for statement, check image, deposit ticket and deposited item copy requests until further notice. Statement, check image, deposit ticket and deposited Item requests will continue to be displayed in the Details of Services Used section of your monthly statement. We will notify you via statement message prior to reinstating these fees. If vou have any questions, you may reach out to your business banker branch or call us at 1-877-BUS-BNKG (1-877-287-2654). 44658 Business Checking Summary Account number; 47-2041-6547 Overdraft Protection has not been established for this account. Please contact us if you would like to set up this service. Zachry Tyler Wood Alphabet Employer Identification Number: 88-1656496 Balance Summary Checks and other deductions Ending balance Form: SS-4 Beginning balance Deposits and other additions Number of this notice: CP 575 A 00000 = 98.50 Average ledger balance 36.00- Average collected balance For assistance you may call ug at: 6.35- 6.35- 1-800-829-4933 Overdraft and Returned Item Fee Summary Total Year to Date Total for this Period Total Returned Item Fees (NSF) 00036 00036 IF YOU WRITE, ATTATCHA TYE STUB AT OYE END OF THIS NOTICE. Deposits and Other Additions Description Items Amount Checks and Other Deductions Description Items Amount ACH Additions 00001 00063 ACH Deductions 00001 00063 We assigned you Service Charges and Fees 00001 00036 Total 00001 00063 Total 00002 00099 Daily Balance Date Date Ledger balance If the information is Date Ledger balance Ledger balance 44664 00000 44677 62.50- 44678 00036 Form 940 44658 Berkshire Hatha,a,n.. Business Checking For the period 04/13/2022 to 04/29/2022 44680 For 24-hour account information, sign on to [pnc.com/mybusiness/](http://pnc.com/mybusiness/) ZACHRY TYLER WOOD Primary account number: 47-2041-6547 Page 2 of 3 Please Business Checking Account number: 47-2041-6547 - continued Page 2 of 3 Acüvity Detail Deposits and Other Additions did not hire any employee ACH Additions Referenc numb Date posted 04/27 Transaction Amount description 62.50 Reverse Corporate ACH Debit Effective 04-26-22 the due dates shown, you can call us at 22116905560149 If you Checks and Other Deductions ACH Deductions Referenc Date posted Transaction Amount description number 44677 70842743866 Corporate ACH Quickbooks 180041ntuit 1940868 22116905560149 ervice Charges and Fees Referenc Date posted Transaction Amount descripton 44678 22116905560149 numb Detail of Services Used During Current Period 22116905560149 ::NOTE:: The total charge for the following services will be posted to your account on 05/02/2022 and will appear on your next statement as a single line item entitled Service Charge Period Ending 04/29/2022. e: The total charge for the following Penod Ending 04/29/2022. Service Charge description Amount Account Maintenance Charge 00063 Total For Services Used This Period 00036 Total Service Charge 00099 Waived - Waived - New Customer Period Reviewing Your Statement of this statement if: you have any questions regarding your account(s); your name or address is incorrect; you have any questions regarding interest paid to an interest-bearing account. PNCBANK Balancing Your Account Update Your Account Register Volume Compare: The activity detail section of your statement to your account register. Check Off: Add to Your Account Register: Balance: Subtract From Your Account Register Balance: Your Statement Information : step 2: Add together checks and other deductions listed in your account register but not on your statement. Amount Check Deduction Descrption Amount Balancing Your Account Update Your Account Register on Deposit: '"{{'$' '{{[22934637118600.[00]USD')'"' 4720416547 Reviewing Your Statement of this statement if: you have any questions regarding your account(s); your name or address is incorrect; you have any questions regarding interest paid to an interest-bearing account. Total A=$22934637118600 Step 3: 22934637118600 Enter the ending balance recorded on your statement Add deposits and other additions not recorded Total A + $22934637118600 Subtotal=$22934637118600 Subtract checks and other deductions not recorded Total B $ 22934637118600 The result should equal your account register balance $ 22934637118600 Total B22934637118600 Verification of Direct Deposits To verify whether a direct deposit or other transfer to your account has occurred, call us Monday - Friday: 7 AM - 10 PM ET and Saturday & Sunday: 8 AM - 5 PM ET at the customer service number listed on the upper right side of the first page of this statement. In Case of Errors or Questions About Your Electronic Transfers Telephone us at the customer service number listed on the upper right side of the first page of this statement or write us at PNC Bank Debit Card Services, 500 First Avenue, 4th Floor, Mailstop P7-PFSC-04-M, Pittsburgh, PA 15219 as soon as you can, if you think your statement or receipt is wrong or if you need more information about a transfer on the statement or receipt. We must hear from you no later than 60 days after we sent you the FIRST statement on which the error or problem appeared. Tell us your name and account number (if any). Describe the error or the transfer you are unsure about, and explain as clearly as you can why you believe it is an error or why you need more information. Tell us the dollar amount of the suspected error. We will investigate your complaint and will correct any error promptly. If we take longer than 10 business days, we will provisionally credit your account for the amount you think is in error, so that you will h Member FDIC Home > Chapter 7: Reports > Custom Reports > Exporting Custom Reports > Export Custom Report as Excel File Export Custom Report as Excel File Show 00000 Excel report exports are in XLSX format. If you are using an older version of Excel, you can install the Microsoft Compatibility Pack so that you can open XLSX files. 1 Locate the report you want to export in the custom reports section of the Reports dashboard, and click an Excel export link. To export the report without first viewing the data, click the “Export XLS” link under the Action button menu. To view the report prior to exporting, click on its linked Report Name, then click the “xls” link in the Export line directly above the report Snapshot. NOTE: You can filter the report by Date Range or Payment Method prior to exporting it; the export will include only those transactions included by the filters. 2 Depending on your browser, you will have the option to open and/or save the file. a To open the file, click the “Open” button in the dialog box. The file will open in Excel, but will not be saved. You will need to save the file in Excel if you want to store it on your computer. b To save the file to your computer. i Click the “Save” button in the dialog box. ii A Save As dialog box opens. NOTE: In Google Chrome, and some other browsers, clicking the “xls” link will take you directly to this step. iii Enter a name for your file, and select a location on your computer where you want to save the file. iv Click the “Save” button. v You can now open the report directly from your computer at any time, without being logged into ADP Payments. Next › All items in your account register that also appear on your statement. Remember to begin with the ending date of your last statement. (An asterisk { * } will appear in the Checks section if there is a gap in the listing of consecutive check numbers.) Any deposits or additions including interest payments and ATM or electronic deposits listed on the statement that are not already entered in your register. Any account deductions including fees and ATM or electronic deductions listed on the statement that are not already entered in your register. Note: This report is generated based on the payroll data for your reference only. Please contact IRS office for special cases such as late payment, previous overpayment, penalty and others. Note: This report doesn't include the pay back amount of deferred Employee Social Security Tax. SHAREHOLDERS ARE URGED TO READ THE DEFINITIVE PROXY STATEMENT AND ANY OTHER RELEVANT MATERIALS THAT THE COMPANY WILL FILE WITH THE SEC CAREFULLY IN THEIR ENTIRETY WHEN THEY BECOME AVAILABLE. SUCH DOCUMENTS WILL CONTAIN IMPORTANT INFORMATION ABOUT THE COMPANY AND ITS DIRECTORS, OFFICERS AND AFFILIATES. INFORMATION REGARDING THE INTERESTS OF CERTAIN OF THE 22662983361014 Federal 941 Deposit Report ADP Report Range5/4/2022 - 6/4/2022                                                        
+$532,580,113,050)                6.35-                        6.35-                1-800-829-4933                
+3/6/2022 at 6:37 PM                                                                        
+Q4 2021 Q3 2021 Q2 2021 Q1 2021 Q4 2020                                                                        
+GOOGL_income-statement_Quarterly_As_Originally_Reported :(us$)[24,934,000,000](DOLLARS)[United States tender Exchangable Notes]
25,539,000,000 37,497,000,000 31,211,000,000 30,818,000,000                                                                        
+24,934,000,000 25,539,000,000 21,890,000,000 19,289,000,000 22,677,000,000                                                                        
+Cash Flow from Operating Activities, Indirect 24,934,000,000 25,539,000,000 21,890,000,000 19,289,000,000 22,677,000,000                                                                        
+Net Cash Flow from Continuing Operating Activities, Indirect 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000                Service Charges and Fees                        1        36                        
+Cash Generated from Operating Activities 6,517,000,000 3,797,000,000 4,236,000,000 2,592,000,000 5,748,000,000                                                                        
+Income/Loss before Non-Cash Adjustment 3,439,000,000 3,304,000,000 2,945,000,000 2,753,000,000 3,725,000,000                                                                        
+Total Adjustments for Non-Cash Items 3,439,000,000 3,304,000,000 2,945,000,000 2,753,000,000 3,725,000,000                                                                        
+Adjustment 3,215,000,000 3,085,000,000 2,730,000,000 2,525,000,000 3,539,000,000                2.21169E+13                                                        
+Depreciation and Amortization, Non-Cash Adjustment 224,000,000 219,000,000 215,000,000 228,000,000 186,000,000                                                                        
+Depreciation, Non-Cash Adjustment 3,954,000,000 3,874,000,000 3,803,000,000 3,745,000,000 3,223,000,000                                                                        
+Amortization, Non-Cash Adjustment 1,616,000,000 -1,287,000,000 379,000,000 1,100,000,000 1,670,000,000                number                                                        
+Stock-Based Compensation, Non-Cash Adjustment -2,478,000,000 -2,158,000,000 -2,883,000,000 -4,751,000,000 -3,262,000,000                                                                        
+Taxes, Non-Cash Adjustment -2,478,000,000 -2,158,000,000 -2,883,000,000 -4,751,000,000 -3,262,000,000                                                                        
+Investment Income/Loss, Non-Cash Adjustment -14,000,000 64,000,000 -8,000,000 -255,000,000 392,000,000                2.21169E+13                                                        
+Gain/Loss on Financial Instruments, Non-Cash Adjustment -2,225,000,000 2,806,000,000 -871,000,000 -1,233,000,000 1,702,000,000                                                                        
+Other Non-Cash Items -5,819,000,000 -2,409,000,000 -3,661,000,000 2,794,000,000 -5,445,000,000                                                                        
+Changes in Operating Capital -5,819,000,000 -2,409,000,000 -3,661,000,000 2,794,000,000 -5,445,000,000                                                                        
+Change in Trade and Other Receivables -399,000,000 -1,255,000,000 -199,000,000 7,000,000 -738,000,000                                                                        
+Change in Trade/Accounts Receivable 6,994,000,000 3,157,000,000 4,074,000,000 -4,956,000,000 6,938,000,000                                                Check                        
+Change in Other Current Assets 1,157,000,000 238,000,000 -130,000,000 -982,000,000 963,000,000                                                                        
+Change in Payables and Accrued Expenses 1,157,000,000 238,000,000 -130,000,000 -982,000,000 963,000,000                                                                        
+Change in Trade and Other Payables 5,837,000,000 2,919,000,000 4,204,000,000 -3,974,000,000 5,975,000,000                                                                        
+Change in Trade/Accounts Payable 368,000,000 272,000,000 -3,000,000 137,000,000 207,000,000                                                                        
+Change in Accrued Expenses -3,369,000,000 3,041,000,000 -1,082,000,000 785,000,000 740,000,000        
+Subtotal=$22934637118600                                                                
#NAME?                                                                        
#NAME?                                                                        
+-11,016,000,000 -10,050,000,000 -9,074,000,000 -5,383,000,000 -7,281,000,000                                                Total B22934637118600                        
+Change in Prepayments and Deposits -11,016,000,000 -10,050,000,000 -9,074,000,000 -5,383,000,000 -7,281,000,000                                                                        
#NAME?                                                                        
+Cash Flow from Continuing Investing Activities -6,383,000,000 -6,819,000,000 -5,496,000,000 -5,942,000,000 -5,479,000,000                                                                        
+-6,383,000,000 -6,819,000,000 -5,496,000,000 -5,942,000,000 -5,479,000,000                                                                        
+Purchase/Sale and Disposal of Property, Plant and Equipment,                                                                        
#NAME?                                                                        
+Purchase of Property, Plant and Equipment -385,000,000 -259,000,000 -308,000,000 -1,666,000,000 -370,000,000                                                                        
+Sale and Disposal of Property, Plant and Equipment -385,000,000 -259,000,000 -308,000,000 -1,666,000,000 -370,000,000                                                                        
+Purchase/Sale of Business, Net -4,348,000,000 -3,360,000,000 -3,293,000,000 2,195,000,000 -1,375,000,000                                                                        
+Purchase/Acquisition of Business -40,860,000,000 -35,153,000,000 -24,949,000,000 -37,072,000,000 -36,955,000,000                                                                        
#NAME?                                                                        
+Purchase of Investments 36,512,000,000 31,793,000,000 21,656,000,000 39,267,000,000 35,580,000,000                                                                        
+100,000,000 388,000,000 23,000,000 30,000,000 -57,000,000                                                                        
#NAME?                                                                        
+Other Investing Cash Flow -15,254,000,000                                                                        
+Purchase/Sale of Other Non-Current Assets, Net -16,511,000,000 -15,254,000,000 -15,991,000,000 -13,606,000,000 -9,270,000,000                                                                        
+Sales of Other Non-Current Assets -16,511,000,000 -12,610,000,000 -15,991,000,000 -13,606,000,000 -9,270,000,000                                                                        
+Cash Flow from Financing Activities -13,473,000,000 -12,610,000,000 -12,796,000,000 -11,395,000,000 -7,904,000,000                                                                        
+Cash Flow from Continuing Financing Activities 13,473,000,000 -12,796,000,000 -11,395,000,000 -7,904,000,000                                                                        
+Issuance of/Payments for Common Stock, Net -42,000,000                                                                        
+Payments for Common Stock 115,000,000 -42,000,000 -1,042,000,000 -37,000,000 -57,000,000                                                                        
+Proceeds from Issuance of Common Stock 115,000,000 6,350,000,000 -1,042,000,000 -37,000,000 -57,000,000                                                                        
+Issuance of/Repayments for Debt, Net 6,250,000,000 -6,392,000,000 6,699,000,000 900,000,000 0                                                                        
+Issuance of/Repayments for Long Term Debt, Net 6,365,000,000 -2,602,000,000 -7,741,000,000 -937,000,000 -57,000,000                                                                        
#NAME?                                                                        
+Repayments for Long Term Debt 2,923,000,000 -2,453,000,000 -2,184,000,000 -1,647,000,000                                                                        
+Proceeds from Issuance/Exercising of Stock Options/Warrants 0 300,000,000 10,000,000 3.38E+11                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Change in Cash 20,945,000,000 23,719,000,000 23,630,000,000 26,622,000,000 26,465,000,000                                                                        
+Effect of Exchange Rate Changes 25930000000) 235000000000) -3,175,000,000 300,000,000 6,126,000,000                                                                        
+Cash and Cash Equivalents, Beginning of Period PAGE=""""$USD(181000000000)"""".XLS BRIN=""""$USD(146000000000)"""".XLS 183,000,000 -143,000,000 210,000,000                                                                        
+Cash Flow Supplemental Section $23,719,000,000,000.00 $26,622,000,000,000.00 $26,465,000,000,000.00 $20,129,000,000,000.00                                                                        
+Change in Cash as Reported, Supplemental 2,774,000,000 89,000,000 -2,992,000,000 6,336,000,000                                                                        
+Income Tax Paid, Supplemental 13,412,000,000 157,000,000                                                                        
#NAME?                                                                        
#NAME?                                                                        
#NAME?                                                                        
#NAME?        -6819000000        -5496000000        -5942000000        -5479000000                                        
+Q4 2020 Q4 2019                                                                        
#NAME?                                                                        
+Due: 04/18/2022        388000000        23000000        30000000        -57000000                                        
+Dec. 31, 2020 Dec. 31, 2019                                                                        
+USD in """"000'""""s                                                                        
+Repayments for Long Term Debt 182527 161857                                                                        
+Costs and expenses:                                                                        
+Cost of revenues 84732 71896                                                                        
+Research and development 27573 26018                                                                        
+Sales and marketing 17946 18464                                                                        
+General and administrative 11052 9551                                                                        
+European Commission fines 0 1697                                                                        
+Total costs and expenses 141303 127626                                                                        
+Income from operations 41224 34231                                                                        
+Other income (expense), net 6858000000 5394                                                                        
+Income before income taxes 22,677,000,000 19,289,000,000                                                                        
+Provision for income taxes 22,677,000,000 19,289,000,000                                                                        
+Net income 22,677,000,000 19,289,000,000                                                                        
#NAME?                                                                        
#NAME?                                                                        
<<<<<<< revert-11-paradice
+and Class C capital stock (in dollars par share)                                                                        
#NAME?                                                                        
+stock and Class C capital stock (in dollars par share)                                                                        
#NAME?                                                                        
#NAME?                                                                        
+and Class C capital stock (in dollars par share)                                                                        
#NAME?                                                                        
+stock and Class C capital stock (in dollars par share)                                                                        
+ALPHABET 88-1303491                                                                        
+5323 BRADFORD DR,                                                                        
+DALLAS, TX 75235-8314                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Employee Id: 9999999998 IRS No. 000000000000                                                                        
+INTERNAL REVENUE SERVICE, $20,210,418.00                                                                        
+PO BOX 1214, Rate Units Total YTD Taxes / Deductions Current YTD                                                                        
+CHARLOTTE, NC 28201-1214 - - $70,842,745,000.00 $70,842,745,000.00 Federal Withholding $0.00 $0.00                                                                        
+Earnings FICA - Social Security $0.00 $8,853.60                                                                        
+Commissions FICA - Medicare $0.00 $0.00                                                                        
#NAME?                                                                        
+FUTA $0.00 $0.00                                                                        
+SUTA $0.00 $0.00                                                                        
+EIN: 61-1767ID91:900037305581 SSN: 633441725                                                                        
#NAME?                                                                        
+$70,842,745,000.00 $70,842,745,000.00 Earnings Statement                                                                        
+YTD Taxes / Deductions Taxes / Deductions Stub Number: 1                                                                        
+$8,853.60 $0.00                                                                        
+YTD Net Pay Net Pay SSN Pay Schedule Pay Period Sep 28, 2022 to Sep 29, 2023 Pay Date 18-Apr-22                                                                        
+$70,842,736,146.40 $70,842,745,000.00 XXX-XX-1725 Annually                                                                        
#NAME?                                                                        
#NAME?                                                                        
+**$70,842,7383000.00**                                                                        
#NAME?                                                                        
#NAME?                                                                        
#NAME?                                                                        
+INTERNAL REVENUE SERVICE,                                                                        
+PO BOX 1214,                                                                        
+CHARLOTTE, NC 28201-1214                                                                        
#NAME?                                                                        
+15 $76,033,000,000.00 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000 11,247,000,000 6,959,000,000 6,836,000,000 10,671,000,000 7,068,000,000                                                                        
#NAME?                                                                        
+Notice, see separate instructions. $76,033,000,000.00 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000 11,247,000,000 6,959,000,000 6,836,000,000 10,671,000,000 7,068,000,000                                                                        
+Cat. No. 11320B $76,033,000,000.00 20,642,000,000 18,936,000,000 18,525,000,000 17,930,000,000 15,227,000,000 11,247,000,000 6,959,000,000 6,836,000,000 10,671,000,000 7,068,000,000        Request Date : 07-29-2022                                Period Beginning:                        37,151        
+Form 1040 (2021) $76,033,000,000.00 20,642,000,000 18,936,000,000        Response Date : 07-29-2022                                Period Ending:                        44,833        
#NAME?        Tracking Number : 102393399156                                Pay Date:                        44,591        
#NAME?        Customer File Number : 132624428                                ZACHRY T.                         WOOD        
+Total Revenue as Reported, Supplemental $257,637,000,000.00 75,325,000,000 65,118,000,000 61,880,000,000 55,314,000,000 56,898,000,000 46,173,000,000 38,297,000,000 41,159,000,000 46,075,000,000 40,499,000,000                                        5,323        BRADFORD DR                        
+Total Operating Profit/Loss as Reported, Supplemental $78,714,000,000.00 21,885,000,000 21,031,000,000 19,361,000,000 16,437,000,000 15,651,000,000 11,213,000,000 6,383,000,000 7,977,000,000 9,266,000,000 9,177,000,000                                                                        
+Reported Effective Tax Rate $0.16 0.179 0.157 0.158 0.158 0.159 0.119 0.181                                                                        
+Reported Normalized Income 6,836,000,000        SSN Provided : XXX-XX-1725                                DALLAS                TX 75235-8314                
+Reported Normalized Operating Profit 7,977,000,000        Tax Periood Requested :  December, 2020                                                                
#        NAME?                                                                        
#NAME?                                                                        
#NAME?                                                                        
+Basic EPS $113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49 10.2                                                                        
+Basic EPS from Continuing Operations $113.88 31.12 28.44 27.69 26.63 22.46 16.55 10.21 9.96 15.47 10.2                                                                        
#NAME?                                                                
+Diluted EPS $112.20 30.69 27.99 27.26 26.29 22.3 16.4 10.13 9.87 15.35 10.12                                                                        
+Diluted EPS from Continuing Operations $112.20 30.67 27.99 27.26 26.29 22.23 16.4 10.13 9.87 15.33 10.12                                                                        
#NAME?                                                                        
+Basic Weighted Average Shares Outstanding $667,650,000.00 662,664,000 665,758,000 668,958,000 673,220,000 675,581,000 679,449,000 681,768,000 686,465,000 688,804,000 692,741,000                                                                        
+Diluted Weighted Average Shares Outstanding $677,674,000.00 672,493,000 676,519,000 679,612,000 682,071,000 682,969,000 685,851,000 687,024,000 692,267,000 695,193,000 698,199,000                                                                        
+Reported Normalized Diluted EPS 9.87                                                                        
+Basic EPS $113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49 10.2 1                                                                        
+Diluted EPS $112.20 30.69 27.99 27.26 26.29 22.3 16.4 10.13 9.87 15.35 10.12                                                                        
+Basic WASO $667,650,000.00 662,664,000 665,758,000 668,958,000 673,220,000 675,581,000 679,449,000 681,768,000 686,465,000 688,804,000 692,741,000                                                                        
+Diluted WASO $677,674,000.00 672,493,000 676,519,000 679,612,000 682,071,000 682,969,000 685,851,000 687,024,000 692,267,000 695,193,000 698,199,000                                                                        
+Fiscal year end September 28th., 2022. | USD        ""                                                                        
70842745000        XXX-XX-1725        Earnings Statement                FICA - Social Security        0        8854                        
                Taxes / Deductions                Stub Number: 1                FICA - Medicare        0        00/01/1900        
                0        Rate                        Employer Taxes                        
                Net Pay                                FUTA        0        0        
                70842745000                                SUTA        0        0        
                                This period        YTD        Taxes / Deductions        Current        YTD        
                        Pay Schedulec        70842745000        70842745000        Federal Withholding        0        0        
                        Annually        70842745000        70842745000        Federal Withholding        0        0        
                        Units        Q1        TTM        Taxes / Deductions        Current        YTD        
                        Q3        70842745000        70842745000        Federal Withholding        0        0        
                        Q4        70842745000        70842745000        Federal Withholding        0        0        
                        CHECK NO.                        FICA - Social Security        0        8854        
                  20210418                        FICA - Medicare        0        0                
Mountain View, C.A. 94043        -                                                                
Taxable Maritial Status: Single        -                                                                                                                                        
TX: 28                                                                        
Federal 941 Deposit Report                                                                        
ADP                                                                        
+Report Range5/4/2022 - 6/4/2022 Local ID:                Date of this notice:                                 44658                        
+EIN: 63-3441725State ID: 633441725                Employer Identification Number: 88-1656496                                                        
Employee NAumboeurn:T3                Form:         SS-4                                                
+Description 5/4/2022 - 6/4/2022                                                                        
+Payment Amount (Total) $9,246,754,678,763.00 Display All                                                                        
+1. Social Security (Employee + Employer) $26,661.80                                                                        
+2. Medicare (Employee + Employer) $861,193,422,444.20 Hourly                                                                        
+3. Federal Income Tax $8,385,561,229,657.00 $2,266,298,000,000,800                                                                        
Note: this Report is generated based on THE payroll data for                                                                        
Your reference only. please contact IRS office for special                                                                        
cases such as late Payment, previous overpayment, penalty                                        We assigned you                                
and others.                                                                        
+Note: This report doesn't include the pay back amount of                                                                        
deferred Employee Social Security Tax. Commission                                                        Please                
+State Income Tax Withheld $0.00 $22,662,983,361,013.70
+- Add lines 1, 2b, 3b, 4b, 5b, 6b, 7, and 8. This is your total income .........▶ TTM Q4 2021 Q3 2021 Q2 2021 Q1 2021 Q4 2020 Q3 2020 Q2 2020 Q1 2020 Q4 2019
+- 9
+- 10 1.46698E+11 42337000000 37497000000 35653000000 31211000000 30818000000 25056000000 19744000000 22177000000 25055000000
+- Adjustments to income from Schedule 1, line 26 ............... 2.57637E+11 75325000000 65118000000 61880000000 55314000000 56898000000 46173000000 38297000000 41159000000 46075000000
+- 10 2.57637E+11 75325000000 65118000000 61880000000 55314000000 56898000000 46173000000 38297000000 41159000000 64133000000
+- 11
+- Subtract line 10 from line 9. This is your adjusted gross income .........▶ -5.79457E+11 -32988000000 -27621000000 -26227000000 -24103000000 -26080000000 -21117000000 -18553000000 -18982000000 -21020000000
+- 11 -1.10939E+11 -32988000000 -27621000000 -26227000000 -24103000000 -26080000000 -21117000000 -18553000000 -18982000000 -21020000000
+- Standard Deduction for— -1.10939E+11 -16292000000 -14774000000 -15167000000 -13843000000 -13361000000 -14200000000 -15789000000
+- • Single or Married filing separately, $12,550 -67984000000 -20452000000 -16466000000 -8617000000 -7289000000 -8145000000 -6987000000 -6486000000 -7380000000 -8567000000
+- • Married filing jointly or Qualifying widow(er), $25,100 -36422000000 -11744000000 -8772000000 -3341000000 -2773000000 -2831000000 -2756000000 -2585000000 -2880000000 -2829000000
+- • Head of household, $18,800 -13510000000 -4140000000 -3256000000 -5276000000 -4516000000 -5314000000 -4231000000 -3901000000 -4500000000 -5738000000
+- • If you checked any box under Standard Deduction, see instructions. -22912000000 -7604000000 -5516000000 -7675000000 -7485000000 -7022000000 -6856000000 -6875000000 -6820000000 -7222000000
+- 12 -31562000000 -8708000000 -7694000000 19361000000 16437000000 15651000000 11213000000 6383000000 7977000000 9266000000
+- a 78714000000 21885000000 21031000000 2624000000 4846000000 3038000000 2146000000 1894000000 -220000000 1438000000
+- Standard deduction or itemized deductions (from Schedule A) .. 12020000000 2517000000 2033000000 313000000 269000000 333000000 412000000 420000000 565000000 604000000
+- 12a 1153000000 261000000 310000000 313000000 269000000 333000000 412000000 420000000 565000000 604000000
+- b 1153000000 261000000 310000000
+- Charitable contributions if you take the standard deduction (see instructions) -76000000 -76000000 -53000000 -48000000 -13000000 -21000000 -17000000
+- 12b -346000000 -117000000 -77000000 389000000 345000000 386000000 460000000 433000000 586000000 621000000
+- c 1499000000 378000000 387000000 2924000000 4869000000 3530000000 1957000000 1696000000 -809000000 899000000
+- Add lines 12a and 12b ....................... 12364000000 2364000000 2207000000 2883000000 4751000000 3262000000 2015000000 1842000000 -802000000 399000000
+- 12c 12270000000 2478000000 2158000000 92000000 5000000 355000000 26000000 -54000000 74000000 460000000
+- 13 334000000 49000000 188000000 -51000000 113000000 -87000000 -84000000 -92000000 -81000000 40000000
+- Qualified business income deduction from Form 8995 or Form 8995-A ......... -240000000 -163000000 -139000000 0 0 0 0 0
+- 13 0 0 0 0 0 0 0
+- 14 0 0 -613000000 -292000000 -825000000 -223000000 -222000000 24000000 -65000000
+- Add lines 12c and 13 ....................... -1497000000 -108000000 -484000000 21985000000 21283000000 18689000000 13359000000 8277000000 7757000000 10704000000
+- 14 90734000000 24402000000 23064000000 -3460000000 -3353000000 -3462000000 -2112000000 -1318000000 -921000000 -33000000
+- 15 -14701000000 -3760000000 -4128000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- Taxable income. Subtract line 14 from line 11. If zero or less, enter -0- ......... 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- 15 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions. 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- Cat. No. 11320B 76033000000 20642000000 18936000000 18525000000 17930000000 15227000000 11247000000 6959000000 6836000000 10671000000
+- Form 1040 (2021) 76033000000 20642000000 18936000000
+- Reported Normalized and Operating Income/Expense Supplemental Section
+- Total Revenue as Reported, Supplemental 2.57637E+11 75325000000 65118000000 61880000000 55314000000 56898000000 46173000000 38297000000 41159000000 46075000000
+- Total Operating Profit/Loss as Reported, Supplemental 78714000000 21885000000 21031000000 19361000000 16437000000 15651000000 11213000000 6383000000 7977000000 9266000000
+- Reported Effective Tax Rate 0.16 0.179 0.157 0.158 0.158 0.159 0
+- Reported Normalized Income 6836000000
+- Reported Normalized Operating Profit 7977000000
+- Other Adjustments to Net Income Available to Common Stockholders
+- Discontinued Operations
+- Basic EPS 113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49
+- Basic EPS from Continuing Operations 113.88 31.12 28.44 27.69 26.63 22.46 16.55 10.21 9.96 15.47
+- Basic EPS from Discontinued Operations
+- Diluted EPS 112.2 30.69 27.99 27.26 26.29 22.3 16.4 10.13 9.87 15.35
+- Diluted EPS from Continuing Operations 112.2 30.67 27.99 27.26 26.29 22.23 16.4 10.13 9.87 15.33
+- Diluted EPS from Discontinued Operations
+- Basic Weighted Average Shares Outstanding 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000
+- Diluted Weighted Average Shares Outstanding 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000
+- Reported Normalized Diluted EPS 9.87
+- Basic EPS 113.88 31.15 28.44 27.69 26.63 22.54 16.55 10.21 9.96 15.49
+- Diluted EPS 112.2 31 28 27 26 22 16 10 10 15
+- Basic WASO 667650000 662664000 665758000 668958000 673220000 675581000 679449000 681768000 686465000 688804000
+- Diluted WASO 677674000 672493000 676519000 679612000 682071000 682969000 685851000 687024000 692267000 695193000
+-
+- Fiscal year ends in Dec 31 | USD
+-
+- 2017 2018 2019 2020 2021
+-
+- Best Time to 911
+-
+- INTERNAL REVENUE SERVICE
+- PO BOX 1214
+- CHARLOTTE NC 28201-1214 9999999999
+-
+- 633-44-1725
+- ZACHRYTWOOD
+- AMPITHEATRE PARKWAY
+- MOUNTAIN VIEW, Califomia 94043
+-EIN 61-1767919
FEIN 88-1303491
+-
+-
+- 44669
+- Department of the Treasury Calendar Year Check Date
+- Internal Revenue Service Due. (04/18/2022)
+-
+-
+-
+-
+- _______________________________________________________________________________________
+-
+- Tax Period Total Social Security Medicare
+- IEIN: 88-1656495 TxDL: 00037305580 SSN:
+- INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29200
+- 39355 23906.09 10292.9 2407.21
+- 20210418 39355 11247.64 4842.74 1132.57
+- 39355 27198.5 11710.47 2738.73
+- 39355 17028.05
+- CP 575A (Rev. 2-2007) 99999999999 CP 575 A SS-4
+- Earnings Statement
+-
+- IEIN: 88-1656496 TxDL: 00037305581 SSN:
+-
+-
+- INTERNAL REVENUE SERVICE PO BOX 1300, CHARLOTTE, North Carolina 29201
+-
+-
+-
+-
+-
+-
+- Employee Information Pay to the order of ZACHRY T WOOD
+- AMPITHEATRE PARKWAY,
+- MOUNTAIN VIEW, California 94043
+Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share)
+- INTERNAL REVENUE SERVICE, *include interest paid, capital obligation, and underweighting 6858000000
+- PO BOX 1214, Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) 22677000000
+- CHARLOTTE, NC 28201-1214 Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) 22677000000
+- Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) 22677000000
+- Taxes / Deductions Current YTD
+- Fiscal year ends in Dec 31 | USD
+- Rate
+-
+- Total
+- 7567263607 DoB: 1994-10-15
+- YTD
+-
+- April 18, 2022.
+- 7567263607
+- WOOD ZACHRY Tax Period Total Social Security Medicare Withholding
+- Fed 941 Corporate 39355 66986.66 28841.48 6745.18 31400
+- Fed 941 West Subsidiary 39355 17115.41 7369.14 1723.42 8022.85
+- Fed 941 South Subsidiary 39355 23906.09 10292.9 2407.21 11205.98
+- Fed 941 East Subsidiary 39355 11247.64 4842.74 1132.57 5272.33
+- Fed 941 Corp - Penalty 39355 27198.5 11710.47 2738.73 12749.3
+- Fed 940 Annual Unemp - Corp 39355 17028.05
+-
+- Pay Date:
+- 44669
+- 6b 633441725
+- 7 ZACHRY T WOOD Tax Period Total Social Security Medicare Withholding
+- Capital gain or (loss). Attach Schedule D if required. If not required, check here ....▶ Fed 941 Corporate 39355 66986.66 28841.48 6745.18 31400
+- 7 Fed 941 West Subsidiary 39355 17115.41 7369.14 1723.42 8022.85
+- 8 Fed 941 South Subsidiary 39355 23906.09 10292.9 2407.21 11205.98
INTERNAL REVENUE SERVICE, *include interest paid, capital obligation, and underweighting 6858000000
PO BOX 1214, Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) 22677000000
CHARLOTTE, NC 28201-1214 Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share) 22677000000
- Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share) 22677000000
-
Taxes / Deductions Current YTD
-
Fiscal year ends in Dec 31 | USD

   Rate                                                                                                                                                                                                                 
   Total                                                                                                                                                                                                                 
   7567263607                                                                                        DoB: 1994-10-15                                                                                                                        
   YTD                                                                                                                                                                                                                 
   April 18, 2022.                                                                                                                                                                                                                
   7567263607                                                                                                                                                                                                                
   WOOD  ZACHRY                Tax Period         Total        Social Security        Medicare        Withholding                                                                                                                                                                
   Fed 941 Corporate                39355        66986.66        28841.48        6745.18        31400                                                                                                                                                                
   Fed 941 West Subsidiary                39355        17115.41        7369.14        1723.42        8022.85                                                                                                                                                                
   Fed 941 South Subsidiary                39355        23906.09        10292.9        2407.21        11205.98                                                                                                                                                                
   Fed 941 East Subsidiary                39355        11247.64        4842.74        1132.57        5272.33                                                                                                                                                                
   Fed 941 Corp - Penalty                39355        27198.5        11710.47        2738.73        12749.3                                                                                                                                                                
   Fed 940 Annual Unemp - Corp                39355        17028.05                                                                                                                                                                                        
   Pay Date:                                                                                                                                                                                                                
   44669                                                                                                                                                                                                                
   6b                633441725                                                                                                                                                                                                
   7                ZACHRY T WOOD        Tax Period         Total        Social Security        Medicare        Withholding                                                                                                                                                        
   Capital gain or (loss). Attach Schedule D if required. If not required, check here ....▶                Fed 941 Corporate        39355        66986.66        28841.48        6745.18        31400                                                                                                                                                        
   7                Fed 941 West Subsidiary        39355        17115.41        7369.14        1723.42        8022.85                                                                                                                                                        
   8                Fed 941 South Subsidiary        39355        23906.09        10292.9        2407.21        11205.98                                                                                                                                                        
   Other income from Schedule 1, line 10 ..................                Fed 941 East Subsidiary        39355        11247.64        4842.74        1132.57        5272.33                                                                                                                                                        
   8                Fed 941 Corp - Penalty        39355        27198.5        11710.47        2738.73        12749.3                                                                                                                                                        
   9                Fed 940 Annual Unemp - Corp        39355        17028.05                                                                                                                                                                                
   Add lines 
   1, 
   2b,
   3b, 
   4b,
   5b, 
   6b, 
   7
   8. This is your total income .........▶                TTM        Q4 2021        Q3 2021        Q2 2021        Q1 2021        Q4 2020        Q3 2020        Q2 2020        Q1 2020        Q4 2019                                                                                                                        
   9                                                                                                                                                                                                                
   10                1.46698E+11        42337000000        37497000000        35653000000        31211000000        30818000000        25056000000        19744000000        22177000000        25055000000                                                                                                                        
   Adjustments to income from Schedule 1, line 26 ...............                2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000        41159000000        46075000000                                                                                                                        
   10                2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000        41159000000        64133000000                                                                                                                        
   11                                                                                                                                                                                                                
   Subtract line 10 from line 9. This is your adjusted gross income .........▶                -5.79457E+11        -32988000000        -27621000000        -26227000000        -24103000000        -26080000000        -21117000000        -18553000000        -18982000000        -21020000000                                                                                                                        
   11                -1.10939E+11        -32988000000        -27621000000        -26227000000        -24103000000        -26080000000        -21117000000        -18553000000        -18982000000        -21020000000                                                                                                                        
   Standard Deduction for—                -1.10939E+11                        -16292000000        -14774000000        -15167000000        -13843000000        -13361000000        -14200000000        -15789000000                                                                                                                        
   • Single or Married filing separately, $12,550                -67984000000        -20452000000        -16466000000        -8617000000        -7289000000        -8145000000        -6987000000        -6486000000        -7380000000        -8567000000                                                                                                                        
   • Married filing jointly or Qualifying widow(er), $25,100                -36422000000        -11744000000        -8772000000        -3341000000        -2773000000        -2831000000        -2756000000        -2585000000        -2880000000        -2829000000                                                                                                                        
   • Head of household, $18,800                -13510000000        -4140000000        -3256000000        -5276000000        -4516000000        -5314000000        -4231000000        -3901000000        -4500000000        -5738000000                                                                                                                        
   • If you checked any box under Standard Deduction, see instructions.                -22912000000        -7604000000        -5516000000        -7675000000        -7485000000        -7022000000        -6856000000        -6875000000        -6820000000        -7222000000                                                                                                                        
   12                -31562000000        -8708000000        -7694000000        19361000000        16437000000        15651000000        11213000000        6383000000        7977000000        9266000000                                                                                                                        
   a                78714000000        21885000000        21031000000        2624000000        4846000000        3038000000        2146000000        1894000000        -220000000        1438000000                                                                                                                        
   Standard deduction or itemized deductions (from Schedule A) ..                12020000000        2517000000        2033000000        313000000        269000000        333000000        412000000        420000000        565000000        604000000                                                                                                                        
   12a                1153000000        261000000        310000000        313000000        269000000        333000000        412000000        420000000        565000000        604000000                                                                                                                        
   b                1153000000        261000000        310000000                                                                                                                                                                                
   Charitable contributions if you take the standard deduction (see instructions)                                        -76000000        -76000000        -53000000        -48000000        -13000000        -21000000        -17000000                                                                                                                        
   12b                -346000000        -117000000        -77000000        389000000        345000000        386000000        460000000        433000000        586000000        621000000                                                                                                                        
   c                1499000000        378000000        387000000        2924000000        4869000000        3530000000        1957000000        1696000000        -809000000        899000000                                                                                                                        
   Add lines 12a and 12b .......................                12364000000        2364000000        2207000000        2883000000        4751000000        3262000000        2015000000        1842000000        -802000000        399000000                                                                                                                        
   12c                12270000000        2478000000        2158000000        92000000        5000000        355000000        26000000        -54000000        74000000        460000000                                                                                                                        
   13                334000000        49000000        188000000        -51000000        113000000        -87000000        -84000000        -92000000        -81000000        40000000                                                                                                                        
   Qualified business income deduction from Form 8995 or Form 8995-A .........                -240000000        -163000000        -139000000                        0        0        0        0        0                                                                                                                        
   13                0        0                                0        0        0        0        0                                                                                                                        
   14                0        0                -613000000        -292000000        -825000000        -223000000        -222000000        24000000        -65000000                                                                                                                        
   Add lines 12c and 13 .......................                -1497000000        -108000000        -484000000        21985000000        21283000000        18689000000        13359000000        8277000000        7757000000        10704000000                                                                                                                        
   14                90734000000        24402000000        23064000000        -3460000000        -3353000000        -3462000000        -2112000000        -1318000000        -921000000        -33000000                                                                                                                        
   15                -14701000000        -3760000000        -4128000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   Taxable income. Subtract line 14 from line 11. If zero or less, enter -0- .........                76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   15                76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions.                76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   Cat. No. 11320B                76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000        6836000000        10671000000                                                                                                                        
   Form 1040 (2021)                76033000000        20642000000        18936000000                                                                                                                                                                                
   Reported Normalized and Operating Income/Expense Supplemental Section                                                                                                                                                                                                                
   Total Revenue as Reported, Supplemental                2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000        41159000000        46075000000                                                                                                                        
   Total Operating Profit/Loss as Reported, Supplemental                78714000000        21885000000        21031000000        19361000000        16437000000        15651000000        11213000000        6383000000        7977000000        9266000000                                                                                                                        
   Reported Effective Tax Rate                0.16                0.179        0.157        0.158                0.158        0.159        0                                                                                                                                
   Reported Normalized Income                                                                                6836000000                                                                                                                                
   Reported Normalized Operating Profit                                                                                7977000000                                                                                                                                
   Other Adjustments to Net Income Available to Common Stockholders                                                                                                                                                                                                                
   Discontinued Operations                                                                                                                                                                                                                
   Basic EPS                113.88        31.15        28.44        27.69        26.63        22.54        16.55        10.21        9.96        15.49                                                                                                                        
   Basic EPS from Continuing Operations                113.88        31.12        28.44        27.69        26.63        22.46        16.55        10.21        9.96        15.47                                                                                                                        
   Basic EPS from Discontinued Operations                                                                                                                                                                                                                
   Diluted EPS                112.2        30.69        27.99        27.26        26.29        22.3        16.4        10.13        9.87        15.35                                                                                                                        
   Diluted EPS from Continuing Operations                112.2        30.67        27.99        27.26        26.29        22.23        16.4        10.13        9.87        15.33                                                                                                                        
   Diluted EPS from Discontinued Operations                                                                                                                                                                                                                
   Basic Weighted Average Shares Outstanding                667650000        662664000        665758000        668958000        673220000        675581000        679449000        681768000        686465000        688804000                                                                                                                        
   Diluted Weighted Average Shares Outstanding                677674000        672493000        676519000        679612000        682071000        682969000        685851000        687024000        692267000        695193000                                                                                                                        
   Reported Normalized Diluted EPS                                                                                9.87                                                                                                                                
   Basic EPS                113.88        31.15        28.44        27.69        26.63        22.54        16.55        10.21        9.96        15.49                                                                                                                        
   Diluted EPS                112.2        31        28        27        26        22        16        10        10        15                                                                                                                        
   Basic WASO                667650000        662664000        665758000        668958000        673220000        675581000        679449000        681768000        686465000        688804000                                                                                                                        
   Diluted WASO                677674000        672493000        676519000        679612000        682071000        682969000        685851000        687024000        692267000        695193000                                                                                                                        
           2017        2018        2019        2020        2021                                                                                                                                                                        Best Time to 911                                                                                                                                                                        
## Licenses

Content is released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) which gives you permission to use content for almost any purpose (but does not grant you any trademark permissions). See [notices](notices.md) for complete details, including attribution guidelines, contribution terms, and software and third-party licenses and permissions.





"request": "launch",
+      "name": "Launch Program",
+      "args": ["${workspaceRoot}/script/index.ts"],
+      "runtimeArgs": ["-r", "ts-node/register"],
+      "cwd": "${workspaceRoot}/script",
+			"protocol": "inspector",
+			"internalConsoleOptions": "openOnSessionStart",
+			"env": {
+				"TS_NODE_IGNORE": "false"
+			}
+    }
+  ]
+}
\ No newline at end of file
diff --git a/CONTRIBUTING.md b/CONTRIBUTING.md
index 80411383b..f711b7775 100644
--- a/CONTRIBUTING.md
+++ b/CONTRIBUTING.md
@@ -4,11 +4,12 @@
 
 Hi there 👋 We are excited that you want to contribute a new workflow to this repo. By doing this you are helping people get up and running with GitHub Actions and that's cool 😎.
 
-Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](LICENSE.md).
+Contributions to this project are [released](https://help.github.com/articles/github-terms-of-service/#6-contributions-under-repository-license) to the public under the [project's open source license](https://github.com/actions/starter-workflows/blob/master/LICENSE).
 
-Please note that this project is released with a [Contributor Code of Conduct][code-of-conduct]. By participating in this project you agree to abide by its terms.
+Please note that this project is released with a [Contributor Code of Conduct](
+https://github.com/actions/.github/blob/master/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
 
-There are few requirements for adding in a new workflow, which we'll need to review before we merge:
+Before merging a new workflow, the following requirements need to be met:
 
 - Should be as simple as is needed for the service.
 - There are many programming languages and tools out there. Right now we don't have a page that allows for a really large number of workflows, so we do have to be a little choosy about what we accept. Less popular tools or languages might not be accepted.
diff --git a/README.md b/README.md
index b1dd935ea..5d81359d3 100644
--- a/README.md
+++ b/README.md
@@ -4,9 +4,11 @@
 
 ## Starter Workflows
 
-<img src="https://d3vv6lp55qjaqc.cloudfront.net/items/353A3p3Y2x3c2t2N0c01/Image%202019-08-27%20at%203.25.07%20PM.png" max-width="75%"/>
+These are the workflow files for helping people get started with GitHub Actions.  They're presented whenever you start to create a new GitHub Actions workflow.
+
+**If you want to get started with GitHub Actions, you can use these starter workflows by clicking the "Actions" tab in the repository where you want to create a workflow.**
 
-These are the workflow files for helping people get started with GitHub Actions. 
+<img src="https://d3vv6lp55qjaqc.cloudfront.net/items/353A3p3Y2x3c2t2N0c01/Image%202019-08-27%20at%203.25.07%20PM.png" max-width="75%"/>
 
 **Directory structure:**
 * [ci](ci): solutions for Continuous Integration
diff --git a/automation/greetings.yml b/automation/greetings.yml
deleted file mode 100644
index 28ee6b2f1..000000000
--- a/automation/greetings.yml
+++ /dev/null
@@ -1,13 +0,0 @@
-name: Greetings
-
-on: [pull_request, issues]
-
-jobs:
-  greeting:
-    runs-on: ubuntu-latest
-    steps:
-    - uses: actions/first-interaction@v1
-      with:
-        repo-token: ${{ secrets.GITHUB_TOKEN }}
-        issue-message: 'Message that will be displayed on users'' first issue'
-        pr-message: 'Message that will be displayed on users'' first pr'
diff --git a/automation/label.yml b/automation/label.yml
index e90b599b9..98a683c3f 100644
--- a/automation/label.yml
+++ b/automation/label.yml
@@ -1,3 +1,9 @@
+---
+name: Labeler
+description: Labels pull requests based on the files changed
+categories: [Automation, SDLC]
+iconName: octicon tag
+---
 # This workflow will triage pull requests and apply a label based on the
 # paths that are modified in the pull request.
 #
diff --git a/automation/properties/greetings.properties.json b/automation/properties/greetings.properties.json
deleted file mode 100644
index 743afe386..000000000
--- a/automation/properties/greetings.properties.json
+++ /dev/null
@@ -1,6 +0,0 @@
-{
-    "name": "Greetings",
-    "description": "Greets users who are first time contributors to the repo",
-    "iconName": "octicon smiley",
-    "categories": ["Automation", "SDLC"]
-}
diff --git a/automation/properties/label.properties.json b/automation/properties/label.properties.json
deleted file mode 100644
index 87a00c885..000000000
--- a/automation/properties/label.properties.json
+++ /dev/null
@@ -1,6 +0,0 @@
-{
-    "name": "Labeler",
-    "description": "Labels pull requests based on the files changed",
-    "iconName": "octicon tag",
-    "categories": ["Automation", "SDLC"]
-}
diff --git a/automation/properties/stale.properties.json b/automation/properties/stale.properties.json
deleted file mode 100644
index c54e27db3..000000000
--- a/automation/properties/stale.properties.json
+++ /dev/null
@@ -1,6 +0,0 @@
-{
-    "name": "Stale",
-    "description": "Checks for stale issues and pull requests",
-    "iconName": "octicon clock",
-    "categories": ["Automation", "SDLC"]
-}
diff --git a/automation/stale.yml b/automation/stale.yml
index 7bbc0505b..71d57d82b 100644
--- a/automation/stale.yml
+++ b/automation/stale.yml
@@ -1,3 +1,9 @@
+---
+name: Stale
+description: Checks for stale issues and pull requests
+categories: [Automation, SDLC]
+iconName: octicon clock
+---
 name: Mark stale issues and pull requests
 
 on:
diff --git a/ci/android.yml b/ci/android.yml
index 23f10f1f4..0c15a6db8 100644
--- a/ci/android.yml
+++ b/ci/android.yml
@@ -1,17 +1,27 @@
-name: Android CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: set up JDK 1.8
-      uses: actions/setup-java@v1
-      with:
-        java-version: 1.8
-    - name: Build with Gradle
-      run: ./gradlew build
+---
+name: Android CI
+description: Build an Android project with Gradle.
+categories: [Java, Mobile]
+iconName: android
+---
+name: Android CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: set up JDK 1.8
+      uses: actions/setup-java@v1
+      with:
+        java-version: 1.8
+    - name: Build with Gradle
+      run: ./gradlew build
diff --git a/ci/ant.yml b/ci/ant.yml
index d95d6b4db..20d72f182 100644
--- a/ci/ant.yml
+++ b/ci/ant.yml
@@ -1,17 +1,30 @@
-name: Java CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: Set up JDK 1.8
-      uses: actions/setup-java@v1
-      with:
-        java-version: 1.8
-    - name: Build with Ant
-      run: ant -noinput -buildfile build.xml
+---
+name: Java with Ant
+description: Build and test a Java project with Apache Ant.
+categories: [Ant, Java]
+iconName: ant
+---
+# This workflow will build a Java project with Ant
+# For more information see: https://help.github.com/actions/language-and-framework-guides/building-and-testing-java-with-ant
+
+name: Java CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: Set up JDK 1.8
+      uses: actions/setup-java@v1
+      with:
+        java-version: 1.8
+    - name: Build with Ant
+      run: ant -noinput -buildfile build.xml
diff --git a/ci/aws.yml b/ci/aws.yml
new file mode 100644
index 000000000..9cf764d2f
--- /dev/null
+++ b/ci/aws.yml
@@ -0,0 +1,86 @@
+---
+name: Deploy to Amazon ECS
+description: Deploy a container to an Amazon ECS service powered by AWS Fargate or Amazon EC2.
+categories: []
+iconName: aws
+---
+# This workflow will build and push a new container image to Amazon ECR,
+# and then will deploy a new task definition to Amazon ECS, when a release is created
+#
+# To use this workflow, you will need to complete the following set-up steps:
+#
+# 1. Create an ECR repository to store your images.
+#    For example: `aws ecr create-repository --repository-name my-ecr-repo --region us-east-2`.
+#    Replace the value of `ECR_REPOSITORY` in the workflow below with your repository's name.
+#    Replace the value of `aws-region` in the workflow below with your repository's region.
+#
+# 2. Create an ECS task definition, an ECS cluster, and an ECS service.
+#    For example, follow the Getting Started guide on the ECS console:
+#      https://us-east-2.console.aws.amazon.com/ecs/home?region=us-east-2#/firstRun
+#    Replace the values for `service` and `cluster` in the workflow below with your service and cluster names.
+#
+# 3. Store your ECS task definition as a JSON file in your repository.
+#    The format should follow the output of `aws ecs register-task-definition --generate-cli-skeleton`.
+#    Replace the value of `task-definition` in the workflow below with your JSON file's name.
+#    Replace the value of `container-name` in the workflow below with the name of the container
+#    in the `containerDefinitions` section of the task definition.
+#
+# 4. Store an IAM user access key in GitHub Actions secrets named `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
+#    See the documentation for each action used below for the recommended IAM policies for this IAM user,
+#    and best practices on handling the access key credentials.
+
+on:
+  release:
+    types: [created]
+
+name: Deploy to Amazon ECS
+
+jobs:
+  deploy:
+    name: Deploy
+    runs-on: ubuntu-latest
+
+    steps:
+    - name: Checkout
+      uses: actions/checkout@v2
+
+    - name: Configure AWS credentials
+      uses: aws-actions/configure-aws-credentials@v1
+      with:
+        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
+        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
+        aws-region: us-east-2
+
+    - name: Login to Amazon ECR
+      id: login-ecr
+      uses: aws-actions/amazon-ecr-login@v1
+
+    - name: Build, tag, and push image to Amazon ECR
+      id: build-image
+      env:
+        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
+        ECR_REPOSITORY: my-ecr-repo
+        IMAGE_TAG: ${{ github.sha }}
+      run: |
+        # Build a docker container and
+        # push it to ECR so that it can
+        # be deployed to ECS.
+        docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
+        docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
+        echo "::set-output name=image::$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG"
+
+    - name: Fill in the new image ID in the Amazon ECS task definition
+      id: task-def
+      uses: aws-actions/amazon-ecs-render-task-definition@v1
+      with:
+        task-definition: task-definition.json
+        container-name: sample-app
+        image: ${{ steps.build-image.outputs.image }}
+
+    - name: Deploy Amazon ECS task definition
+      uses: aws-actions/amazon-ecs-deploy-task-definition@v1
+      with:
+        task-definition: ${{ steps.task-def.outputs.task-definition }}
+        service: sample-app-service
+        cluster: default
+        wait-for-service-stability: true
\ No newline at end of file
diff --git a/ci/azure.yml b/ci/azure.yml
new file mode 100644
index 000000000..011fa02af
--- /dev/null
+++ b/ci/azure.yml
@@ -0,0 +1,52 @@
+---
+name: Deploy Node.js to Azure Web App
+description: Build a Node.js project and deploy it to an Azure Web App.
+categories: []
+iconName: azure
+---
+# This workflow will build and push a node.js application to an Azure Web App when a release is created.
+#
+# This workflow assumes you have already created the target Azure App Service web app.
+# For instructions see https://docs.microsoft.com/azure/app-service/app-service-plan-manage#create-an-app-service-plan
+#
+# To configure this workflow:
+#
+# 1. Set up a secret in your repository named AZURE_WEBAPP_PUBLISH_PROFILE with the value of your Azure publish profile.
+#    For instructions on obtaining the publish profile see: https://docs.microsoft.com/azure/app-service/deploy-github-actions#configure-the-github-secret
+#
+# 2. Change the values for the AZURE_WEBAPP_NAME, AZURE_WEBAPP_PACKAGE_PATH and NODE_VERSION environment variables  (below).
+#
+# For more information on GitHub Actions for Azure, refer to https://github.com/Azure/Actions
+# For more samples to get started with GitHub Action workflows to deploy to Azure, refer to https://github.com/Azure/actions-workflow-samples
+on:
+  release:
+    types: [created]
+
+env:
+  AZURE_WEBAPP_NAME: your-app-name    # set this to your application's name
+  AZURE_WEBAPP_PACKAGE_PATH: '.'      # set this to the path to your web app project, defaults to the repository root
+  NODE_VERSION: '10.x'                # set this to the node version to use
+
+jobs:
+  build-and-deploy:
+    name: Build and Deploy
+    runs-on: ubuntu-latest
+    steps:
+    - uses: actions/checkout@v2
+    - name: Use Node.js ${{ env.NODE_VERSION }}
+      uses: actions/setup-node@v1
+      with:
+        node-version: ${{ env.NODE_VERSION }}
+    - name: npm install, build, and test
+      run: |
+        # Build and test the project, then
+        # deploy to Azure Web App.
+        npm install
+        npm run build --if-present
+        npm run test --if-present
+    - name: 'Deploy to Azure WebApp'
+      uses: azure/webapps-deploy@v2
+      with:
+        app-name: ${{ env.AZURE_WEBAPP_NAME }}
+        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
+        package: ${{ env.AZURE_WEBAPP_PACKAGE_PATH }}
diff --git a/ci/blank.yml b/ci/blank.yml
index 6bee778b1..8108e2182 100644
--- a/ci/blank.yml
+++ b/ci/blank.yml
@@ -1,17 +1,39 @@
-name: CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: Run a one-line script
-      run: echo Hello, world!
-    - name: Run a multi-line script
-      run: |
-        echo Add other actions to build,
-        echo test, and deploy your project.
+---
+name: Simple workflow
+description: Start with a file with the minimum necessary structure.
+categories: []
+iconName: blank
+---
+# This is a basic workflow to help you get started with Actions
+
+name: CI
+
+# Controls when the action will run. Triggers the workflow on push or pull request
+# events but only for the master branch
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+# A workflow run is made up of one or more jobs that can run sequentially or in parallel
+jobs:
+  # This workflow contains a single job called "build"
+  build:
+    # The type of runner that the job will run on
+    runs-on: ubuntu-latest
+
+    # Steps represent a sequence of tasks that will be executed as part of the job
+    steps:
+    # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
+    - uses: actions/checkout@v2
+
+    # Runs a single command using the runners shell
+    - name: Run a one-line script
+      run: echo Hello, world!
+
+    # Runs a set of commands using the runners shell
+    - name: Run a multi-line script
+      run: |
+        echo Add other actions to build,
+        echo test, and deploy your project.
diff --git a/ci/c-cpp.yml b/ci/c-cpp.yml
index 2ec660636..aa9b9638b 100644
--- a/ci/c-cpp.yml
+++ b/ci/c-cpp.yml
@@ -1,19 +1,29 @@
-name: C/C++ CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-    
-    steps:
-    - uses: actions/checkout@v1
-    - name: configure
-      run: ./configure
-    - name: make
-      run: make
-    - name: make check
-      run: make check
-    - name: make distcheck
-      run: make distcheck
+---
+name: C/C++ with Make
+description: Build and test a C/C++ project using Make.
+categories: [C, C++]
+iconName: c-cpp
+---
+name: C/C++ CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: configure
+      run: ./configure
+    - name: make
+      run: make
+    - name: make check
+      run: make check
+    - name: make distcheck
+      run: make distcheck
diff --git a/ci/clojure.yml b/ci/clojure.yml
index 7932491c5..367511c45 100644
--- a/ci/clojure.yml
+++ b/ci/clojure.yml
@@ -1,15 +1,25 @@
-name: Clojure CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: Install dependencies
-      run: lein deps
-    - name: Run tests
-      run: lein test
+---
+name: Clojure
+description: Build and test a Clojure project with Leiningen.
+categories: [Clojure, Java]
+iconName: clojure
+---
+name: Clojure CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: Install dependencies
+      run: lein deps
+    - name: Run tests
+      run: lein test
diff --git a/ci/crystal.yml b/ci/crystal.yml
index 3f937ebb1..b98715836 100644
--- a/ci/crystal.yml
+++ b/ci/crystal.yml
@@ -1,18 +1,28 @@
-name: Crystal CI
-
-on: [push]
-
-jobs:
-  build:
-
-    runs-on: ubuntu-latest
-
-    container:
-      image: crystallang/crystal
-
-    steps:
-    - uses: actions/checkout@v1
-    - name: Install dependencies
-      run: shards install
-    - name: Run tests
-      run: crystal spec
+---
+name: Crystal
+description: Build and test a Crystal project.
+categories: [Crystal]
+iconName: crystal
+---
+name: Crystal CI
+
+on:
+  push:
+    branches: [ master ]
+  pull_request:
+    branches: [ master ]
+
+jobs:
+  build:
+
+    runs-on: ubuntu-latest
+
+    container:
+      image: crystallang/crystal
+
+    steps:
+    - uses: actions/checkout@v2
+    - name: Install dependencies
+      run: shards install
+    - name: Run tests
+      run: crystal spec
diff --git a/ci/dart.yml b/ci/dart.yml
index 2b99c6473..8f79c28cb 100644
--- a/ci/dart.yml
+++ b/ci/dart.yml
@@ -1,18 +1,28 @@
-name: Dart CI
Fri, Dec 9 at 10:05 PM												Business Checking For 24-hour account information, sign on to                                                                        	
												pnc.com/mybusiness/ Business Checking Account number: 47-2041-6547 - continued                                                                        	
												Activity Detail                                                                        	
		ZACHRY T WOOD                                                                        										Deposits and Other Additions                                                                        	
		Cash and Cash Equivalents, Beginning of Period                                                                        										ACH Additions                                                                        	
		Department of the Treasury                                                                        										Date posted                                                                        	
		Internal Revenue Service                                                                        										27-Apr	
												Checks and Other Deductions                                                                        	
		Calendar Year                                                                        									Operating Income/Expenses                                                             -67984000000        -20452000000        -16466000000        -16292000000        -14774000000        -15167000000        -13843000000        -13361000000	Deductions                                                                        	
		Due: 04/18/2022                                                                        									Selling, General and Administrative Expenses                                                -36422000000        -11744000000        -8772000000        -8617000000        -7289000000        -8145000000        -6987000000        -6486000000	Date posted                                                                        	
											General and Administrative                                                                          13510000000        -4140000000        -3256000000        -3341000000        -2773000000        -2831000000        -2756000000        -2585000000	26-Apr	
		USD in "000'"s                                                                        									Selling and Marketing Expenses                                                                   -22912000000        -7604000000        -5516000000        -5276000000        -4516000000        -5314000000        -4231000000        -3901000000	Service Charges and Fees                                                                        	
		Repayments for Long Term Debt                                                                        									Research and Development Expenses                                                           -31562000000        -8708000000        -7694000000        -7675000000        -7485000000        -7022000000        -6856000000        -6875000000	Date posted                                                                        	
		Costs and expenses:                                                                        									Total Operating Profit/Loss                                                                        78714000000        21885000000        21031000000        19361000000        16437000000        15651000000        11213000000        6383000000	27-Apr	
		Cost of revenues                                                                        									Non-Operating Income/Expenses, Total                                                                 12020000000        2517000000        2033000000        2624000000        4846000000        3038000000        2146000000        1894000000	Detail of Services Used During Current Period                                                                        	
		Research and development                                                                        									Total Net Finance Income/Expense                                                                                  1153000000        261000000        310000000        313000000        269000000        333000000        412000000        420000000	Note: The total charge for the following services will be posted to your account on 05/02/2022 and will appear on your next statement a Charge Period Ending 04/29/2022,                                                                        	
		Sales and marketing                                                                        									Net Interest Income/Expense                                                                                            1153000000      261000000        310000000        313000000        269000000        333000000        412000000        420000000	Description                                                                        	
		General and administrative                                                                        									Income from Associates, Joint Ventures and Other Participating Interests                                          334000000        49000000        188000000        92000000        5000000        355000000        26000000        -54000000	Account Maintenance Charge                                                                        	
		European Commission fines                                                                        									Interest Expense Net of Capitalized Interest                                                                          -346000000        -117000000        -77000000        -76000000        -76000000        -53000000        -48000000        -13000000	Total For Services Used This Peiiod                                                                        	
		Total costs and expenses                                                                        									Pretax Income                                                                                        90734000000        24402000000        23064000000        21985000000        21283000000        18689000000        13359000000        8277000000	Total Service (harge                                                                        	
		Income from operations                                                                        									Provision for Income Tax                                                                         14701000000-       3760000000-         4128000000-        3460000000-         3353000000-        3462000000-         2112000000-        1318000000-	Reviewing Your Statement                                                                        	
		Other income (expense), net                                                                        									Net Investment Income                                                                                     12364000000        2364000000        2207000000        2924000000        4869000000        3530000000        1957000000        1696000000	Please review this statement carefully and reconcile it with your records. Call the telephone number on the upper right side of the first page of this statement if: you have any questions regarding your account(s); your name or address is incorrect; • you have any questions regarding interest paid to an interest-bearing account.                                                                        	
		Income before income taxes                                                                        									Interest Income                                                                                            1499000000        378000000        387000000        389000000        345000000        386000000        460000000        433000000               	Balancing Your Account Update Your Account Register   	
		Provision for income taxes                                                                        									Total Revenue as Reported, Supplemental                                                   2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000		
		Net income 									                                                                                                  2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000		
											Gross Profit                                                                                         1.46698E+11        42337000000        37497000000        35653000000        31211000000        30818000000        25056000000        19744000000		
		 **Does not include interest paid, capital obligation, and underweighting                                                                        									Irregular Income/Expenses                                                                                                                                                                                                  0        0                                0        0        0 		
											Other Irregular Income/Expenses                                                                                                                                                                                           0        0                                0        0        0		
		Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)                                                                        									Other Revenue                                                                		
											Cost of Revenue                                                                           -1.10939E+11        -32988000000        -27621000000        -26227000000        -24103000000        -26080000000        -21117000000        -18553000000		
													
													
													
													
													
													
													
													
													
		Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share)                                                                        											
		*include interest paid, capital obligation, and underweighting                                                                        											
													
		Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)                                                                        											
		Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share)                                                                        											
													
													
													
													
													
													
		+Taxes / Deductions                Stub Number: 1                                                                 -                                                                                                                                                                                                                                                                                                                                                        											
		+Taxable Maritial Status: Single        -                                                                                                                                                                                                                                                                                                                                                                                                                                											
		+TX: 28                                                                                                                                                                                                                                                                                                                                                                											
													
		+EIN:                Total Year to Date                                                                                                                                                                                                                                                                                                                                                											
		+Internal Revenue Service        Due 04/18/2022                2022 Form 1040-ES Payment Voucher 1                                        Pay Day        1/30/2022                                                                                                                                         ++        MOUNTAIN VIEW, C.A., 94043                                                                                                                                                                                                                 ++        Taxable Marital Status :                                                                                                                                                                                                                 ++        Exemptions/Allowances :                                                                                                                                                                                                                 ++        Federal :                                                                                                                                                                                                                 ++        TX : 28        rate        units        this period        year to date        Other Benefits and                         ZACHRY T                                                                                                                                                 ++        Current assets:                                0        Information                        WOOD                                                                                                                                                 ++        Cash and cash equivalents        26465        18498                0        Total Work Hrs                                                                                                                                                                         ++        Marketable securities        110229        101177                0        Important Notes                        DALLAS                                                                                                                                                 ++        Total cash, cash equivalents, and marketable securities        136694        119675                0        COMPANY PH/Y: 650-253-0000                                                0                                                                                                                         ++        Accounts receivable, net        30930        25326                0        BASIS OF PAY : BASIC/DILUTED EPS                                                                                                                                                                         ++        Income taxes receivable, net        454        2166                0                                                                                                                                                                                 ++        Inventory        728        999                0                                Pto Balance                                                                                                                                                 ++        Other current assets        5490        4412                0                                                                                                                                                                                 ++        Total current assets        174296        152578                0                                                                                                                                                                                 ++        Non-marketable investments        20703        13078                0        70842743866                                                                                                                                                                         ++        Deferred income taxes        1084        721                0                                                                                                                                                                                 ++        Property and equipment, net        84749        73646                0        $70,842,743,866.00                                                                                                                                                                          ++        Operating lease assets        12211        10941                0                                                                                                                                                                                 ++        Intangible assets, net        1445        1979                0                                                                                                                                                                                 ++        Goodwill        21175        20624                0                        Advice date :        650001                                                                                                                                                 ++        Other non-current assets        3953        2342                0                        Pay date :        4/18/2022                                                                                                                                                 ++        PLEASE READ THE IMPORTANT DISCLOSURES BELOW.        319616        275909                0                        :xxxxxxxxx6547        JAn 29th., 2022                                                                                                                                                 ++        Paid to the account Of :                                0                                519                                                                                                                                                 ++        Accounts payable        5589        5561                0                                NON-NEGOTIABLE                                                                                                                                                 ++        Accrued compensation and benefits        11086        8495                0                                                                                                                                                                                 ++        Accrued expenses and other current liabilities        28631        23067                0                                                                                                                                                                                 ++        Accrued revenue share        7500        5916                0                                                                                                                                                                                 ++        Deferred revenue        2543        1908                0                                                                                                                                                                                 ++        Income taxes payable, net        1485        274                0                                                                                                                                                                                 ++        Total current liabilities        56834        45221                0                                                                                                                                                                                 ++        Long-term debt        13932        4554                0                                                                                                                                                                                 ++        Deferred revenue, non-current        481        358                0                                                                                                                                                                                 ++        Income taxes payable, non-current        8849        9885                0                                                                                                                                                                                 ++        Deferred income taxes        3561        1701                0                                                                                                                                                                                 ++                11146        10214                0                                                                                                                                                                                 ++        Other long-term liabilities        2269        2534                0                                                                                                                                                                                 ++        Total liabilities        97072        74467                0                                                                                                                                                                                 ++        Commitments and Contingencies (Note 10)                                  0                                                                                                                                                                                 ++        Stockholders’ equity:                                0                                                                                                                                                                                 ++        Convertible preferred stock, $0.001 par value per share, 100,000 shares authorized; no shares issued and outstanding        0        0                0                                                                                                                                                                                 ++        Class A and Class B common stock, and Class C capital stock and additional paid-in capital, $0.001 par value per share: 15,000,000 shares authorized (Class A 9,000,000, Class B 3,000,000, Class C 3,000,000); 688,335 (Class A 299,828, Class B 46,441, Class C 342,066) and 675,222 (Class A 300,730, Class B 45,843, Class C 328,649) shares issued and outstanding        58510        50552                0                                                                                                                                                                                 ++        Accumulated other comprehensive income (loss)        633        -1232                0                                                                                                                                                                                 ++        Retained earnings        163401        152122                0                                                                                                                                                                                 ++        Total stockholders’ equity        222544        201442                0                                                                                                                                                                                 ++        Total liabilities and stockholders’ equity        319616        275909                0                                                                                                                                                                                 ++        Convertible preferred stock, par value (in dollars per share)        0.001        0.001                0                                                                                                                                                                                 ++        Convertible preferred stock, shares authorized (in shares)        100000000        100000000                0                                                                                                                                                                                 ++        Convertible preferred stock, shares issued (in shares)        0        0                0                                                                                                                                                                                 ++        Convertible preferred stock, shares outstanding (in shares)        0        0                0                                                                                                                                                                                 ++        Schedule II: Valuation and Qualifying Accounts (Details) - Allowance for doubtful accounts and sales credits - USD ($) $ in Millions        12 Months Ended                        0                                                                                                                                                                                 ++                Dec. 31, 2020        Dec. 31, 2019        Dec. 31, 2018        0                                                                                                                                                                                 ++        SEC Schedule, 12-09, Movement in Valuation Allowances and Reserves [Roll Forward]                                0                                                                                                                                                                                 ++        Revenues (Narrative) (Details) - USD ($) $ in Billions        12 Months Ended                        0                                                                                                                                                                                 ++                Dec. 31, 2020        Dec. 31, 2019                0                                                                                                                                                                                 ++        Revenue from Contract with Customer [Abstract]                                0                                                                                                                                                                                 ++        Deferred revenue                2.3                0                                                                                                                                                                                 ++        Revenues recognized        1.8                        0                                                                                                                                                                                 ++        Transaction price allocated to remaining performance obligations        29.8                        0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction, Start Date [Axis]: 2021-01-01                                0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction [Line Items]                                0                                                                                                                                                                                 ++        Expected timing of revenue recognition        24 months                        0                                                                                                                                                                                 ++        Expected timing of revenue recognition, percent        0.5                        0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction, Start Date [Axis]: 2023-01-01                                0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction [Line Items]                                0                                                                                                                                                                                 ++        Expected timing of revenue recognition                                 0                                                                                                                                                                                 ++        Expected timing of revenue recognition, percent        0.5                        0                                                                                                                                                                                 ++        Information about Segments and Geographic Areas (Long-Lived Assets by Geographic Area) (Details) - USD ($) $ in Millions        Dec. 31, 2020        Dec. 31, 2019                0                                                                                                                                                                                 ++        Revenues from External Customers and Long-Lived Assets [Line Items]                                0                                                                                                                                                                                 ++        Long-lived assets        96960        84587                0                                                                                                                                                                                 ++        United States                                0                                                                                                                                                                                 ++        Revenues from External Customers and Long-Lived Assets [Line Items]                                0                                                                                                                                                                                 ++        Long-lived assets        69315        63102                0                                                                                                                                                                                 ++        International                                0                                                                                                                                                                                 ++        Revenues from External Customers and Long-Lived Assets [Line Items]                                0                                                                                                                                                                                 ++        Long-lived assets        27645        21485                0                                                                                                                                                                                 ++                2016        2017        2018        2019        2020        2021        TTM                                                                                                                                                         ++                2.23418E+11        2.42061E+11        2.25382E+11        3.27223E+11        2.86256E+11        3.54636E+11        3.54636E+11                                                                                                                                                         ++                45881000000        60597000000        57418000000        61078000000        63401000000        69478000000        69478000000                                                                                                                                                         ++                3143000000        3770000000        4415000000        4743000000        5474000000        6052000000        6052000000                                                                                                                                                         ++         Net Investment Income, Revenue        9531000000        13081000000        10565000000        17214000000        14484000000        8664000000        -14777000000        81847000000        48838000000        86007000000        86007000000                                                                                                                         ++         Realized Gain/Loss on Investments, Revenue        472000000        184000000        72000000        10000000        7553000000        1410000000        -22155000000        71123000000        40905000000        77576000000        77576000000                                                                                                                         ++         Gains/Loss on Derivatives, Revenue        1963000000        2608000000        506000000        974000000        751000000        718000000        -300000000        1484000000        -159000000        966000000        966000000                                                                                                                         ++         Interest Income, Revenue        6106000000        6408000000        6484000000        6867000000        6180000000        6536000000        7678000000        9240000000        8092000000        7465000000        7465000000                                                                                                                         ++         Other Investment Income, Revenue        990000000        3881000000        3503000000        9363000000                                                                                                                                                                                 ++         Rental Income, Revenue                                        2553000000        2452000000        5732000000        5856000000        5209000000        5988000000        5988000000                                                                                                                         ++         Other Revenue        1.18387E+11        1.32385E+11        1.42881E+11        1.52435E+11        1.57357E+11        1.66578E+11        1.72594E+11        1.73699E+11        1.63334E+11        1.87111E+11        1.87111E+11                                                                                                                         ++        Total Expenses        -1.40227E+11        -1.53354E+11        -1.66594E+11        -1.75997E+11        -1.89751E+11        -2.18223E+11        -2.21381E+11        -2.24527E+11        -2.30563E+11        -2.4295E+11        -2.4295E+11                                                                                                                         ++         Benefits,Claims and Loss Adjustment Expense, Net        -25227000000        -26347000000        -31587000000        -31940000000        -36037000000        -54509000000        -45605000000        -49442000000        -49763000000        -55971000000        -55971000000                                                                                                                         ++         Policyholder Future Benefits and Claims, Net        -25227000000        -26347000000        -31587000000        -31940000000        -36037000000        -54509000000        -45605000000        -49442000000        -49763000000        -55971000000        -55971000000                                                                                                                         ++         Other Underwriting Expenses        -7693000000        -7248000000        -6998000000        -7517000000        -7713000000        -9321000000        -9793000000        -11200000000        -12798000000        -12569000000        -12569000000                                                                                                                         ++         Selling, General and Administrative Expenses        -11870000000        -13282000000        -13721000000        -15309000000        -19308000000        -20644000000        -21917000000        -23229000000        -23329000000        -23044000000        -23044000000                                                                                                                         ++         Rent Expense                                        -1335000000        -1455000000        -4061000000        -4003000000        -3520000000        -4201000000        -4201000000                                                                                                                         ++         Selling and Marketing Expenses        -11870000000        -13282000000        -13721000000        -15309000000        -17973000000        -19189000000        -17856000000        -19226000000        -19809000000        -18843000000        -18843000000                                                                                                                         ++         Other Income/Expenses        -92693000000        -1.03676E+11        -1.11009E+11        -1.17594E+11        -1.24061E+11        -1.32377E+11        -1.37664E+11        -1.37775E+11        -1.30645E+11        -1.48189E+11        -1.48189E+11                                                                                                                         ++         Total Net Finance Income/Expense        -2744000000        -2801000000        -3253000000        -3515000000        -3741000000        -4386000000        -3853000000        -3961000000        -4083000000        -4172000000        -4172000000                                                                                                                         ++         Net Interest Income/Expense        -2744000000        -2801000000        -3253000000        -3515000000        -3741000000        -4386000000        -3853000000        -3961000000        -4083000000        -4172000000        -4172000000                                                                                                                         ++         Interest Expense Net of Capitalized Interest        -2744000000        -2801000000        -3253000000        -3515000000        -3741000000        -4386000000        -3853000000        -3961000000        -4083000000        -4172000000        -4172000000                                                                                                                         ++         Income from Associates, Joint Ventures and Other Participating Interests                        -26000000        -122000000        1109000000        3014000000        -2167000000        1176000000        726000000        995000000        995000000                                                                                                                         ++         Irregular Income/Expenses                                                        -382000000        -96000000        -10671000000        .        .                                                                                                                         ++         Impairment/Write Off/Write Down of Capital Assets                                                        -382000000        -96000000        -10671000000        .        .                                                                                                                         ++        Pretax Income        22236000000        28796000000        28105000000        34946000000        33667000000        23838000000        4001000000        1.02696E+11        55693000000        1.11686E+11        1.11686E+11                                                                                                                         ++        Provision for Income Tax        -6924000000        -8951000000        -7935000000        -10532000000        -9240000000        21515000000        321000000        -20904000000        -12440000000        -20879000000        -20879000000                                                                                                                         ++        Net Income from Continuing Operations        15312000000        19845000000        20170000000        24414000000        24427000000        45353000000        4322000000        81792000000        43253000000        90807000000        90807000000                                                                                                                         ++        Net Income after Extraordinary Items and Discontinued Operations        15312000000        19845000000        20170000000        24414000000        24427000000        45353000000        4322000000        81792000000        43253000000        90807000000        90807000000                                                                                                                         ++        Non-Controlling/Minority Interests        -488000000        -369000000        -298000000        -331000000        -353000000        -413000000        -301000000        -375000000        -732000000        -1012000000        -1012000000                                                                                                                         ++        Net Income after Non-Controlling/Minority Interests        14824000000        19476000000        19872000000        24083000000        24074000000        44940000000        4021000000        81417000000        42521000000        89795000000        89795000000                                                                                                                         ++        Net Income Available to Common Stockholders        14824000000        19476000000        19872000000        24083000000        24074000000        44940000000        4021000000        81417000000        42521000000        89795000000        89795000000                                                                                                                         ++        Diluted Net Income Available to Common Stockholders        14824000000        19476000000        19872000000        24083000000        24074000000        44940000000        4021000000        81417000000        42521000000        89795000000        89795000000                                                                                                                         ++        Income Statement Supplemental Section                                                                                                                                                                                                                 ++         Reported Normalized and Operating Income/Expense Supplemental Section                                                            											
		+$$22677000000000.00											
		+Payment Amount (Total) $9,246,754,678,763.00 Display All                                                                                                                                                                                                                                                                                                                                                                											
		+1. Social Security (Employee + Employer) $26,661.80                                                                                                                                                                                                                                                                                                                                                                											
		+2. Medicare (Employee + Employer) $861,193,422,444.20 Hourly                                                                                                                                                                                                                                                                                                                                                                											
		+3. Federal Income Tax $8,385,561,229,657.00                                                                                                                                                                                                                                                                                                                                                                											
		+Note: this Report is generated based on THE payroll data for your reference only. Pease contact IRS office for special cases such as late Payment, previous overpayment, penalty                                        We assigned you Employer Identification Number :        88-1303491                                                      Best Time To Call                                                                                                                                                                                                                                                                                                          											
		+Note: This report doesn't include the pay back amount of                                                                                                                                                                                                                                                                                                                                                                               											
													
													
													
													
													
													
													
													
				Pay Schedule                       this period       year to date        Taxes / Deductions   Current      YTD                                                                                                                                                                                                                                                                                                									
				+                        Sch.      70842745000        70842745000        Federal Withholding        0        0                                                                                                                                                                                                                                                                                                									
		ZACHRY T WOOD		+                        GROSS     70842745000        70842745000        Federal Withholding        0        0                                                                                                                                                                                                                                                                                                									
		ALPHABET		+                        net, pay. 70842745000        70842745000        Federal Withholding        0        0                                                                                                                                                                                                                                                                                                									
		5323 BRADFORD DR		+                        FICA - Medicare        0     70842745000        FUTA        0        0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             									
		DALLAS, TX 75235		                         FICA - Social Security 0        8854            FUTA        0        0                                                                                                                                                                                                                                                                                                                     									
				70842745000                                                              SUTA - 0       0									
				+                        ATAA -                                          RUTA - 0       0      									
				Report Range 5/4/2022 - 6/4/2022 88-1656496  Loca ID:      28 :l ID: 633441725 State: All Local ID: txdl 00037305581 SRVCCHG /*  */$2,267,700.00                                                                                                                                                                                                                                                                                                                                                                									
		For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions.                                                                        								                        Q4 2020                        Q4  2019                			
		Cat. No. 11320B                                                                        								Income Statement                                                                 			
		Form 1040 (2021)                                                                        								USD in "000'"s                                                                			
		Reported Normalized and Operating Income/Expense Supplemental Section                                                                        								Repayments for Long Term Debt                        Dec. 31, 2020                        Dec. 31, 2019                	Net Income after Non-Controlling/Minority Interests        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Total Revenue as Reported, Supplemental                                                                        								Costs and expenses:                                                                			
		Total Operating Profit/Loss as Reported, Supplemental                                                                        								Cost of revenues                        182527                        161857                	Reported Effective Tax Rate        0.162                0.179        0.157        0.158                0.158        0.159		
		Reported Effective Tax Rate                                                                        								Research and development                                                                	Net Income from Continuing Operations        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Reported Normalized Income                                                                        								Sales and marketing                        84732                        71896                	Net Income after Extraordinary Items and Discontinued Operations        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Reported Normalized Operating Profit                                                                        								General and administrative                        27573                        26018                			
		Other Adjustments to Net Income Available to Common Stockholders                                                                        								European Commission fines                        17946                        18464                	Net Income Available to Common Stockholders        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Discontinued Operations                                                                        								Total costs and expenses                        11052                        9551                	Diluted Net Income Available to Common Stockholders        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Basic EPS                                                                        								Income from operations                        0                        1697                	Income Statement Supplemental Section                                                                		
		Basic EPS from Continuing Operations                                                                        								Other income (expense), net                        141303                        127626                	Reported Normalized and Operating Income/Expense Supplemental Section                                                                		
		Basic EPS from Discontinued Operations                                                                        								Income before income taxes                        41224                        34231                	Other Income/Expense, Non-Operating        -1497000000        -108000000        -484000000        -613000000        -292000000        -825000000        -223000000        -222000000		
		Diluted EPS                                                                        								Provision for income taxes                        6858000000                        5394                			
		Diluted EPS from Continuing Operations                                                                        								Net income                        22677000000                        19289000000                			
		Diluted EPS from Discontinued Operations                                                                        								*include interest paid, capital obligation, and underweighting                        22677000000                        19289000000                			
		Basic Weighted Average Shares Outstanding                                                                        								                        22677000000                        19289000000                			
		Diluted Weighted Average Shares Outstanding                                                                        								Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)                                                                	Total Operating Profit/Loss as Reported, Supplemental        78714000000        21885000000        21031000000        19361000000        16437000000        15651000000        11213000000        6383000000		
		Reported Normalized Diluted EPS                                                                        								Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share)                                                                	Total Revenue as Reported, Supplemental        2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000		
		Basic EPS                                                                        											
		Diluted EPS                                                                        									Cost of Goods and Services        -1.10939E+11        -32988000000        -27621000000        -26227000000        -24103000000        -26080000000        -21117000000        -18553000000		
		Basic WASO                                                                        								For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see the seperate Instructions.                                                                			
		Diluted WASO                                                                        											
		Fiscal year end September 28th., 2022. | USD                                                                        								Returned for Signature                                                                			
										Date.______________09/01/2022                        			
		For Paperwork Reduction Act Notice, see the seperate Instructions.                                                                        											
													
													
													
													
													
													
		important information                                                                        											
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
		________________________        ________________________          DATE OF THIS NOTICE:        2022-03-18                                                                                                                                                                                                                                                                                        											
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													Business Checking For 24-hour account information, sign on to [pnc.com/mybusiness/](http://pnc.com/mybusiness/) Business Checking Account number: 47-2041-6547 - continued Activity Detail Deposits and Other Additions ACH Additions Date posted Amount Transaction description For the period 04/13/2022 to 04/29/2022 ZACHRY TYLER WOOD Primary account number: 47-2041-6547 Page 2 of 3 44678 00063 Reverse Corporate ACH Debit Effective 04-26-22 Reference number Checks and Other Deductions 22116905560149 Deductions Reference number Date posted Amount Transaction description 22116905560149 44677 00063 Corporate ACH Quickbooks 180041ntuit 1940868 Reference number Service Charges and Fees 22116905560149 Date posted Amount Transaction description on your next statement as a single line item entitled Service Waived - New Customer Period 44678 00036 Returned Item Fee (nsf) Detail of Services Used During Current Period Note: The total charge for the following services will be posted to your account on 05/02/2022 and will appear on your next statement a Charge Period Ending 04/29/2022, Description Volume Amount Account Maintenance Charge 70846743866 00000 Total For Services Used This Peiiod 00000 00000 Total Service (harge 00 00000 Reviewing Your Statement ('PNCBANK Please review this statement carefully and reconcile it with your records. Call the telephone number on the upper right side of the first page of this statement if: you have any questions regarding your account(s); your name or address is incorrect; • you have any questions regarding interest paid to an interest-bearing account. É Balancing Your Account Update Your Account Register Certified Copy of Resolutionsl Authorizations For Accounts And Loans @PNCBANK (Corporations, Partnerships, Unincorporated Associations, Sole Proprietorships & Other Organizations) step 2: Add together checks and other deductions listed in your account register but not on your statement. PNC Bank, National Association ("Bank") Taxpayer I.D. Number (TIN) C'eck Deduction Descretio• Anount (iv) (v) account or benefit, or in payment of the individual obligations of, any individual obligations of any such persons to the Bank without regard to the disposition or purpose of same as allowed by applicable law. D pNCBANK In addition but not by way of limitation, the Bank may take checks, drafts or other items payable to "cash", the Bank or the Customer, and pay the sums represented by such Items in cash to any person presenting such items or credit such Items to the account or obligations of any person presenting such items or any other person or entity as directed by any such person. Products and Services. Resolved that any of the persons listed in Section 3 above are authorized to enter into contracts and agreements, written or verbal, for any products or services now or in the future offered by the Bank, including but not limited to (i) cash management services, (ii) purchases or sales of foreign exchange, securities or other financial products, (iii) computer/internet-based products and services, (iv) wire transfer of funds from or to the accounts of the Customer at the Bank, and (v) ACH transactions, and the Bank may charge any accounts of the Customer at the Bank for such products or services. 00005 Taxpayer I.D. Number (TIN) OWNER ("Customer") 633-44-1725 are hereby authorized (i) to effect loans, advances and renewals at any time for the Customer from the Bank; (ii) to sign and deliver any notes (with or without warrant of attorney to confess judgment) and evidences of indebtedness of the Customer; (iii) to request the Bank to issue letters of credit and to sign and deliver to the bank any agreements on behalf of the Customer to reimburse the Bank for all payments made and expenses incurred by it under such letters of credit and drafts drawn pursuant thereto; (iv) to sign and deliver any instruments or documents on behalf of the Customer guaranteeing, endorsing or securing the payment of any debts or obligations of any person, form or corporation to the Bank; (v) to pledge, assign, transfer, mortgage, grant a security interest in or otherwise hypothecate to the Bank any stock, securities, commercial paper, warehouse receipts and other documents of title, bills, accounts receivable, contract rights, inventory, equipment, real property, and any other investment 00006 Revolving Credits. Resolved that in connection with any extension of credit obtained by any of the persons authorized in Section 5 above, that permit the Customer to effect multiple advances or draws under such credit, any of the persons listed in Sections 5 (Loans and Extensions of Credit) and 3 (Withdrawals and Endorsements) Resolution for ALPHABET 00007 Telephonic and Facsimile Requests. Resolved that the Bank is authorized to take any action authorized hereunder based upon (i) the telephone request of any person purporting to be a person authorized to act hereunder, (ii) the signature of any person authorized to act hereunder that is delivered to the Bank by facsimile transmission, or (iii) the telex originated by any of such persons, tested in accordance with such testing : Tr R •d Ming or serVlCö n lent services, (ii) purchases or sales of foreig xlll) computerfinternet-based products and services, (iv) wir he Customer at the Bank, and (v) ACH transactions, and the Ba the Bank for such products or services. It. Resolved that any one of the following: procedures as may be established between the Customer and the Bank from time to time. General. Resolved that a certified copy of these resolutiEmployer Taxes                             70842745000        XXX-XX-1725                                                                                                                                                                                                                                                                                               													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
Pay Schedule                       this period       year to date        Taxes / Deductions   Current      YTD                                                                                                                                                                                                                                                                                                													
+                        Sch.      70842745000        70842745000        Federal Withholding        0        0                                                                                                                                                                                                                                                                                                													
+                        GROSS     70842745000        70842745000        Federal Withholding        0        0                                                                                                                                                                                                                                                                                                													
+                        net, pay. 70842745000        70842745000        Federal Withholding        0        0                                                                                                                                                                                                                                                                                                													
+                        FICA - Medicare        0     70842745000        FUTA        0        0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             													
                         FICA - Social Security 0        8854            FUTA        0        0                                                                                                                                                                                                                                                                                                                     													
70842745000                                                              SUTA - 0       0													
+                        ATAA -                                          RUTA - 0       0      													
Report Range 5/4/2022 - 6/4/2022 88-1656496  Loca ID:      28 :l ID: 633441725 State: All Local ID: txdl 00037305581 SRVCCHG /*  */$2,267,700.00                                                                                                                                                                                                                                                                                                                                                                													
													
+Taxes / Deductions                Stub Number: 1                                                                 -                                                                                                                                                                                                                                                                                                                                                        													
+Taxable Maritial Status: Single        -                                                                                                                                                                                                                                                                                                                                                                                                                                													
+TX: 28                                                                                                                                                                                                                                                                                                                                                                													
													
+EIN:                Total Year to Date                                                                                                                                                                                                                                                                                                                                                													
+Internal Revenue Service        Due 04/18/2022                2022 Form 1040-ES Payment Voucher 1                                        Pay Day        1/30/2022                                                                                                                                         ++        MOUNTAIN VIEW, C.A., 94043                                                                                                                                                                                                                 ++        Taxable Marital Status :                                                                                                                                                                                                                 ++        Exemptions/Allowances :                                                                                                                                                                                                                 ++        Federal :                                                                                                                                                                                                                 ++        TX : 28        rate        units        this period        year to date        Other Benefits and                         ZACHRY T                                                                                                                                                 ++        Current assets:                                0        Information                        WOOD                                                                                                                                                 ++        Cash and cash equivalents        26465        18498                0        Total Work Hrs                                                                                                                                                                         ++        Marketable securities        110229        101177                0        Important Notes                        DALLAS                                                                                                                                                 ++        Total cash, cash equivalents, and marketable securities        136694        119675                0        COMPANY PH/Y: 650-253-0000                                                0                                                                                                                         ++        Accounts receivable, net        30930        25326                0        BASIS OF PAY : BASIC/DILUTED EPS                                                                                                                                                                         ++        Income taxes receivable, net        454        2166                0                                                                                                                                                                                 ++        Inventory        728        999                0                                Pto Balance                                                                                                                                                 ++        Other current assets        5490        4412                0                                                                                                                                                                                 ++        Total current assets        174296        152578                0                                                                                                                                                                                 ++        Non-marketable investments        20703        13078                0        70842743866                                                                                                                                                                         ++        Deferred income taxes        1084        721                0                                                                                                                                                                                 ++        Property and equipment, net        84749        73646                0        $70,842,743,866.00                                                                                                                                                                          ++        Operating lease assets        12211        10941                0                                                                                                                                                                                 ++        Intangible assets, net        1445        1979                0                                                                                                                                                                                 ++        Goodwill        21175        20624                0                        Advice date :        650001                                                                                                                                                 ++        Other non-current assets        3953        2342                0                        Pay date :        4/18/2022                                                                                                                                                 ++        PLEASE READ THE IMPORTANT DISCLOSURES BELOW.        319616        275909                0                        :xxxxxxxxx6547        JAn 29th., 2022                                                                                                                                                 ++        Paid to the account Of :                                0                                519                                                                                                                                                 ++        Accounts payable        5589        5561                0                                NON-NEGOTIABLE                                                                                                                                                 ++        Accrued compensation and benefits        11086        8495                0                                                                                                                                                                                 ++        Accrued expenses and other current liabilities        28631        23067                0                                                                                                                                                                                 ++        Accrued revenue share        7500        5916                0                                                                                                                                                                                 ++        Deferred revenue        2543        1908                0                                                                                                                                                                                 ++        Income taxes payable, net        1485        274                0                                                                                                                                                                                 ++        Total current liabilities        56834        45221                0                                                                                                                                                                                 ++        Long-term debt        13932        4554                0                                                                                                                                                                                 ++        Deferred revenue, non-current        481        358                0                                                                                                                                                                                 ++        Income taxes payable, non-current        8849        9885                0                                                                                                                                                                                 ++        Deferred income taxes        3561        1701                0                                                                                                                                                                                 ++                11146        10214                0                                                                                                                                                                                 ++        Other long-term liabilities        2269        2534                0                                                                                                                                                                                 ++        Total liabilities        97072        74467                0                                                                                                                                                                                 ++        Commitments and Contingencies (Note 10)                                  0                                                                                                                                                                                 ++        Stockholders’ equity:                                0                                                                                                                                                                                 ++        Convertible preferred stock, $0.001 par value per share, 100,000 shares authorized; no shares issued and outstanding        0        0                0                                                                                                                                                                                 ++        Class A and Class B common stock, and Class C capital stock and additional paid-in capital, $0.001 par value per share: 15,000,000 shares authorized (Class A 9,000,000, Class B 3,000,000, Class C 3,000,000); 688,335 (Class A 299,828, Class B 46,441, Class C 342,066) and 675,222 (Class A 300,730, Class B 45,843, Class C 328,649) shares issued and outstanding        58510        50552                0                                                                                                                                                                                 ++        Accumulated other comprehensive income (loss)        633        -1232                0                                                                                                                                                                                 ++        Retained earnings        163401        152122                0                                                                                                                                                                                 ++        Total stockholders’ equity        222544        201442                0                                                                                                                                                                                 ++        Total liabilities and stockholders’ equity        319616        275909                0                                                                                                                                                                                 ++        Convertible preferred stock, par value (in dollars per share)        0.001        0.001                0                                                                                                                                                                                 ++        Convertible preferred stock, shares authorized (in shares)        100000000        100000000                0                                                                                                                                                                                 ++        Convertible preferred stock, shares issued (in shares)        0        0                0                                                                                                                                                                                 ++        Convertible preferred stock, shares outstanding (in shares)        0        0                0                                                                                                                                                                                 ++        Schedule II: Valuation and Qualifying Accounts (Details) - Allowance for doubtful accounts and sales credits - USD ($) $ in Millions        12 Months Ended                        0                                                                                                                                                                                 ++                Dec. 31, 2020        Dec. 31, 2019        Dec. 31, 2018        0                                                                                                                                                                                 ++        SEC Schedule, 12-09, Movement in Valuation Allowances and Reserves [Roll Forward]                                0                                                                                                                                                                                 ++        Revenues (Narrative) (Details) - USD ($) $ in Billions        12 Months Ended                        0                                                                                                                                                                                 ++                Dec. 31, 2020        Dec. 31, 2019                0                                                                                                                                                                                 ++        Revenue from Contract with Customer [Abstract]                                0                                                                                                                                                                                 ++        Deferred revenue                2.3                0                                                                                                                                                                                 ++        Revenues recognized        1.8                        0                                                                                                                                                                                 ++        Transaction price allocated to remaining performance obligations        29.8                        0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction, Start Date [Axis]: 2021-01-01                                0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction [Line Items]                                0                                                                                                                                                                                 ++        Expected timing of revenue recognition        24 months                        0                                                                                                                                                                                 ++        Expected timing of revenue recognition, percent        0.5                        0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction, Start Date [Axis]: 2023-01-01                                0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction [Line Items]                                0                                                                                                                                                                                 ++        Expected timing of revenue recognition                                 0                                                                                                                                                                                 ++        Expected timing of revenue recognition, percent        0.5                        0                                                                                                                                                                                 ++        Information about Segments and Geographic Areas (Long-Lived Assets by Geographic Area) (Details) - USD ($) $ in Millions        Dec. 31, 2020        Dec. 31, 2019                0                                                                                                                                                                                 ++        Revenues from External Customers and Long-Lived Assets [Line Items]                                0                                                                                                                                                                                 ++        Long-lived assets        96960        84587                0                                                                                                                                                                                 ++        United States                                0                                                                                                                                                                                 ++        Revenues from External Customers and Long-Lived Assets [Line Items]                                0                                                                                                                                                                                 ++        Long-lived assets        69315        63102                0                                                                                                                                                                                 ++        International                                0                                                                                                                                                                                 ++        Revenues from External Customers and Long-Lived Assets [Line Items]                                0                                                                                                                                                                                 ++        Long-lived assets        27645        21485                0                                                                                                                                                                                 ++                2016        2017        2018        2019        2020        2021        TTM                                                                                                                                                         ++                2.23418E+11        2.42061E+11        2.25382E+11        3.27223E+11        2.86256E+11        3.54636E+11        3.54636E+11                                                                                                                                                         ++                45881000000        60597000000        57418000000        61078000000        63401000000        69478000000        69478000000                                                                                                                                                         ++                3143000000        3770000000        4415000000        4743000000        5474000000        6052000000        6052000000                                                                                                                                                         ++         Net Investment Income, Revenue        9531000000        13081000000        10565000000        17214000000        14484000000        8664000000        -14777000000        81847000000        48838000000        86007000000        86007000000                                                                                                                         ++         Realized Gain/Loss on Investments, Revenue        472000000        184000000        72000000        10000000        7553000000        1410000000        -22155000000        71123000000        40905000000        77576000000        77576000000                                                                                                                         ++         Gains/Loss on Derivatives, Revenue        1963000000        2608000000        506000000        974000000        751000000        718000000        -300000000        1484000000        -159000000        966000000        966000000                                                                                                                         ++         Interest Income, Revenue        6106000000        6408000000        6484000000        6867000000        6180000000        6536000000        7678000000        9240000000        8092000000        7465000000        7465000000                                                                                                                         ++         Other Investment Income, Revenue        990000000        3881000000        3503000000        9363000000                                                                                                                                                                                 ++         Rental Income, Revenue                                        2553000000        2452000000        5732000000        5856000000        5209000000        5988000000        5988000000                                                                                                                         ++         Other Revenue        1.18387E+11        1.32385E+11        1.42881E+11        1.52435E+11        1.57357E+11        1.66578E+11        1.72594E+11        1.73699E+11        1.63334E+11        1.87111E+11        1.87111E+11                                                                                                                         ++        Total Expenses        -1.40227E+11        -1.53354E+11        -1.66594E+11        -1.75997E+11        -1.89751E+11        -2.18223E+11        -2.21381E+11        -2.24527E+11        -2.30563E+11        -2.4295E+11        -2.4295E+11                                                                                                                         ++         Benefits,Claims and Loss Adjustment Expense, Net        -25227000000        -26347000000        -31587000000        -31940000000        -36037000000        -54509000000        -45605000000        -49442000000        -49763000000        -55971000000        -55971000000                                                                                                                         ++         Policyholder Future Benefits and Claims, Net        -25227000000        -26347000000        -31587000000        -31940000000        -36037000000        -54509000000        -45605000000        -49442000000        -49763000000        -55971000000        -55971000000                                                                                                                         ++         Other Underwriting Expenses        -7693000000        -7248000000        -6998000000        -7517000000        -7713000000        -9321000000        -9793000000        -11200000000        -12798000000        -12569000000        -12569000000                                                                                                                         ++         Selling, General and Administrative Expenses        -11870000000        -13282000000        -13721000000        -15309000000        -19308000000        -20644000000        -21917000000        -23229000000        -23329000000        -23044000000        -23044000000                                                                                                                         ++         Rent Expense                                        -1335000000        -1455000000        -4061000000        -4003000000        -3520000000        -4201000000        -4201000000                                                                                                                         ++         Selling and Marketing Expenses        -11870000000        -13282000000        -13721000000        -15309000000        -17973000000        -19189000000        -17856000000        -19226000000        -19809000000        -18843000000        -18843000000                                                                                                                         ++         Other Income/Expenses        -92693000000        -1.03676E+11        -1.11009E+11        -1.17594E+11        -1.24061E+11        -1.32377E+11        -1.37664E+11        -1.37775E+11        -1.30645E+11        -1.48189E+11        -1.48189E+11                                                                                                                         ++         Total Net Finance Income/Expense        -2744000000        -2801000000        -3253000000        -3515000000        -3741000000        -4386000000        -3853000000        -3961000000        -4083000000        -4172000000        -4172000000                                                                                                                         ++         Net Interest Income/Expense        -2744000000        -2801000000        -3253000000        -3515000000        -3741000000        -4386000000        -3853000000        -3961000000        -4083000000        -4172000000        -4172000000                                                                                                                         ++         Interest Expense Net of Capitalized Interest        -2744000000        -2801000000        -3253000000        -3515000000        -3741000000        -4386000000        -3853000000        -3961000000        -4083000000        -4172000000        -4172000000                                                                                                                         ++         Income from Associates, Joint Ventures and Other Participating Interests                        -26000000        -122000000        1109000000        3014000000        -2167000000        1176000000        726000000        995000000        995000000                                                                                                                         ++         Irregular Income/Expenses                                                        -382000000        -96000000        -10671000000        .        .                                                                                                                         ++         Impairment/Write Off/Write Down of Capital Assets                                                        -382000000        -96000000        -10671000000        .        .                                                                                                                         ++        Pretax Income        22236000000        28796000000        28105000000        34946000000        33667000000        23838000000        4001000000        1.02696E+11        55693000000        1.11686E+11        1.11686E+11                                                                                                                         ++        Provision for Income Tax        -6924000000        -8951000000        -7935000000        -10532000000        -9240000000        21515000000        321000000        -20904000000        -12440000000        -20879000000        -20879000000                                                                                                                         ++        Net Income from Continuing Operations        15312000000        19845000000        20170000000        24414000000        24427000000        45353000000        4322000000        81792000000        43253000000        90807000000        90807000000                                                                                                                         ++        Net Income after Extraordinary Items and Discontinued Operations        15312000000        19845000000        20170000000        24414000000        24427000000        45353000000        4322000000        81792000000        43253000000        90807000000        90807000000                                                                                                                         ++        Non-Controlling/Minority Interests        -488000000        -369000000        -298000000        -331000000        -353000000        -413000000        -301000000        -375000000        -732000000        -1012000000        -1012000000                                                                                                                         ++        Net Income after Non-Controlling/Minority Interests        14824000000        19476000000        19872000000        24083000000        24074000000        44940000000        4021000000        81417000000        42521000000        89795000000        89795000000                                                                                                                         ++        Net Income Available to Common Stockholders        14824000000        19476000000        19872000000        24083000000        24074000000        44940000000        4021000000        81417000000        42521000000        89795000000        89795000000                                                                                                                         ++        Diluted Net Income Available to Common Stockholders        14824000000        19476000000        19872000000        24083000000        24074000000        44940000000        4021000000        81417000000        42521000000        89795000000        89795000000                                                                                                                         ++        Income Statement Supplemental Section                                                                                                                                                                                                                 ++         Reported Normalized and Operating Income/Expense Supplemental Section                                                            													
Fri, Dec 9 at 10:05 PM												Business Checking For 24-hour account information, sign on to                                                                        	
												pnc.com/mybusiness/ Business Checking Account number: 47-2041-6547 - continued                                                                        	
												Activity Detail                                                                        	
		ZACHRY T WOOD                                                                        										Deposits and Other Additions                                                                        	
		Cash and Cash Equivalents, Beginning of Period                                                                        										ACH Additions                                                                        	
		Department of the Treasury                                                                        										Date posted                                                                        	
		Internal Revenue Service                                                                        										27-Apr	
												Checks and Other Deductions                                                                        	
		Calendar Year                                                                        									Operating Income/Expenses                                                             -67984000000        -20452000000        -16466000000        -16292000000        -14774000000        -15167000000        -13843000000        -13361000000	Deductions                                                                        	
		Due: 04/18/2022                                                                        									Selling, General and Administrative Expenses                                                -36422000000        -11744000000        -8772000000        -8617000000        -7289000000        -8145000000        -6987000000        -6486000000	Date posted                                                                        	
											General and Administrative                                                                          13510000000        -4140000000        -3256000000        -3341000000        -2773000000        -2831000000        -2756000000        -2585000000	26-Apr	
		USD in "000'"s                                                                        									Selling and Marketing Expenses                                                                   -22912000000        -7604000000        -5516000000        -5276000000        -4516000000        -5314000000        -4231000000        -3901000000	Service Charges and Fees                                                                        	
		Repayments for Long Term Debt                                                                        									Research and Development Expenses                                                           -31562000000        -8708000000        -7694000000        -7675000000        -7485000000        -7022000000        -6856000000        -6875000000	Date posted                                                                        	
		Costs and expenses:                                                                        									Total Operating Profit/Loss                                                                        78714000000        21885000000        21031000000        19361000000        16437000000        15651000000        11213000000        6383000000	27-Apr	
		Cost of revenues                                                                        									Non-Operating Income/Expenses, Total                                                                 12020000000        2517000000        2033000000        2624000000        4846000000        3038000000        2146000000        1894000000	Detail of Services Used During Current Period                                                                        	
		Research and development                                                                        									Total Net Finance Income/Expense                                                                                  1153000000        261000000        310000000        313000000        269000000        333000000        412000000        420000000	Note: The total charge for the following services will be posted to your account on 05/02/2022 and will appear on your next statement a Charge Period Ending 04/29/2022,                                                                        	
		Sales and marketing                                                                        									Net Interest Income/Expense                                                                                            1153000000      261000000        310000000        313000000        269000000        333000000        412000000        420000000	Description                                                                        	
		General and administrative                                                                        									Income from Associates, Joint Ventures and Other Participating Interests                                          334000000        49000000        188000000        92000000        5000000        355000000        26000000        -54000000	Account Maintenance Charge                                                                        	
		European Commission fines                                                                        									Interest Expense Net of Capitalized Interest                                                                          -346000000        -117000000        -77000000        -76000000        -76000000        -53000000        -48000000        -13000000	Total For Services Used This Peiiod                                                                        	
		Total costs and expenses                                                                        									Pretax Income                                                                                        90734000000        24402000000        23064000000        21985000000        21283000000        18689000000        13359000000        8277000000	Total Service (harge                                                                        	
		Income from operations                                                                        									Provision for Income Tax                                                                         14701000000-       3760000000-         4128000000-        3460000000-         3353000000-        3462000000-         2112000000-        1318000000-	Reviewing Your Statement                                                                        	
		Other income (expense), net                                                                        									Net Investment Income                                                                                     12364000000        2364000000        2207000000        2924000000        4869000000        3530000000        1957000000        1696000000	Please review this statement carefully and reconcile it with your records. Call the telephone number on the upper right side of the first page of this statement if: you have any questions regarding your account(s); your name or address is incorrect; • you have any questions regarding interest paid to an interest-bearing account.                                                                        	
		Income before income taxes                                                                        									Interest Income                                                                                            1499000000        378000000        387000000        389000000        345000000        386000000        460000000        433000000               	Balancing Your Account Update Your Account Register   	
		Provision for income taxes                                                                        									Total Revenue as Reported, Supplemental                                                   2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000		
		Net income 									                                                                                                  2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000		
											Gross Profit                                                                                         1.46698E+11        42337000000        37497000000        35653000000        31211000000        30818000000        25056000000        19744000000		
		 **Does not include interest paid, capital obligation, and underweighting                                                                        									Irregular Income/Expenses                                                                                                                                                                                                  0        0                                0        0        0 		
											Other Irregular Income/Expenses                                                                                                                                                                                           0        0                                0        0        0		
		Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)                                                                        									Other Revenue                                                                		
											Cost of Revenue                                                                           -1.10939E+11        -32988000000        -27621000000        -26227000000        -24103000000        -26080000000        -21117000000        -18553000000		
													
													
													
													
													
													
													
													
													
		Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share)                                                                        											
		*include interest paid, capital obligation, and underweighting                                                                        											
													
		Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)                                                                        											
		Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share)                                                                        											
													
													
													
													
													
													
		+Taxes / Deductions                Stub Number: 1                                                                 -                                                                                                                                                                                                                                                                                                                                                        											
		+Taxable Maritial Status: Single        -                                                                                                                                                                                                                                                                                                                                                                                                                                											
		+TX: 28                                                                                                                                                                                                                                                                                                                                                                											
													
		+EIN:                Total Year to Date                                                                                                                                                                                                                                                                                                                                                											
		+Internal Revenue Service        Due 04/18/2022                2022 Form 1040-ES Payment Voucher 1                                        Pay Day        1/30/2022                                                                                                                                         ++        MOUNTAIN VIEW, C.A., 94043                                                                                                                                                                                                                 ++        Taxable Marital Status :                                                                                                                                                                                                                 ++        Exemptions/Allowances :                                                                                                                                                                                                                 ++        Federal :                                                                                                                                                                                                                 ++        TX : 28        rate        units        this period        year to date        Other Benefits and                         ZACHRY T                                                                                                                                                 ++        Current assets:                                0        Information                        WOOD                                                                                                                                                 ++        Cash and cash equivalents        26465        18498                0        Total Work Hrs                                                                                                                                                                         ++        Marketable securities        110229        101177                0        Important Notes                        DALLAS                                                                                                                                                 ++        Total cash, cash equivalents, and marketable securities        136694        119675                0        COMPANY PH/Y: 650-253-0000                                                0                                                                                                                         ++        Accounts receivable, net        30930        25326                0        BASIS OF PAY : BASIC/DILUTED EPS                                                                                                                                                                         ++        Income taxes receivable, net        454        2166                0                                                                                                                                                                                 ++        Inventory        728        999                0                                Pto Balance                                                                                                                                                 ++        Other current assets        5490        4412                0                                                                                                                                                                                 ++        Total current assets        174296        152578                0                                                                                                                                                                                 ++        Non-marketable investments        20703        13078                0        70842743866                                                                                                                                                                         ++        Deferred income taxes        1084        721                0                                                                                                                                                                                 ++        Property and equipment, net        84749        73646                0        $70,842,743,866.00                                                                                                                                                                          ++        Operating lease assets        12211        10941                0                                                                                                                                                                                 ++        Intangible assets, net        1445        1979                0                                                                                                                                                                                 ++        Goodwill        21175        20624                0                        Advice date :        650001                                                                                                                                                 ++        Other non-current assets        3953        2342                0                        Pay date :        4/18/2022                                                                                                                                                 ++        PLEASE READ THE IMPORTANT DISCLOSURES BELOW.        319616        275909                0                        :xxxxxxxxx6547        JAn 29th., 2022                                                                                                                                                 ++        Paid to the account Of :                                0                                519                                                                                                                                                 ++        Accounts payable        5589        5561                0                                NON-NEGOTIABLE                                                                                                                                                 ++        Accrued compensation and benefits        11086        8495                0                                                                                                                                                                                 ++        Accrued expenses and other current liabilities        28631        23067                0                                                                                                                                                                                 ++        Accrued revenue share        7500        5916                0                                                                                                                                                                                 ++        Deferred revenue        2543        1908                0                                                                                                                                                                                 ++        Income taxes payable, net        1485        274                0                                                                                                                                                                                 ++        Total current liabilities        56834        45221                0                                                                                                                                                                                 ++        Long-term debt        13932        4554                0                                                                                                                                                                                 ++        Deferred revenue, non-current        481        358                0                                                                                                                                                                                 ++        Income taxes payable, non-current        8849        9885                0                                                                                                                                                                                 ++        Deferred income taxes        3561        1701                0                                                                                                                                                                                 ++                11146        10214                0                                                                                                                                                                                 ++        Other long-term liabilities        2269        2534                0                                                                                                                                                                                 ++        Total liabilities        97072        74467                0                                                                                                                                                                                 ++        Commitments and Contingencies (Note 10)                                  0                                                                                                                                                                                 ++        Stockholders’ equity:                                0                                                                                                                                                                                 ++        Convertible preferred stock, $0.001 par value per share, 100,000 shares authorized; no shares issued and outstanding        0        0                0                                                                                                                                                                                 ++        Class A and Class B common stock, and Class C capital stock and additional paid-in capital, $0.001 par value per share: 15,000,000 shares authorized (Class A 9,000,000, Class B 3,000,000, Class C 3,000,000); 688,335 (Class A 299,828, Class B 46,441, Class C 342,066) and 675,222 (Class A 300,730, Class B 45,843, Class C 328,649) shares issued and outstanding        58510        50552                0                                                                                                                                                                                 ++        Accumulated other comprehensive income (loss)        633        -1232                0                                                                                                                                                                                 ++        Retained earnings        163401        152122                0                                                                                                                                                                                 ++        Total stockholders’ equity        222544        201442                0                                                                                                                                                                                 ++        Total liabilities and stockholders’ equity        319616        275909                0                                                                                                                                                                                 ++        Convertible preferred stock, par value (in dollars per share)        0.001        0.001                0                                                                                                                                                                                 ++        Convertible preferred stock, shares authorized (in shares)        100000000        100000000                0                                                                                                                                                                                 ++        Convertible preferred stock, shares issued (in shares)        0        0                0                                                                                                                                                                                 ++        Convertible preferred stock, shares outstanding (in shares)        0        0                0                                                                                                                                                                                 ++        Schedule II: Valuation and Qualifying Accounts (Details) - Allowance for doubtful accounts and sales credits - USD ($) $ in Millions        12 Months Ended                        0                                                                                                                                                                                 ++                Dec. 31, 2020        Dec. 31, 2019        Dec. 31, 2018        0                                                                                                                                                                                 ++        SEC Schedule, 12-09, Movement in Valuation Allowances and Reserves [Roll Forward]                                0                                                                                                                                                                                 ++        Revenues (Narrative) (Details) - USD ($) $ in Billions        12 Months Ended                        0                                                                                                                                                                                 ++                Dec. 31, 2020        Dec. 31, 2019                0                                                                                                                                                                                 ++        Revenue from Contract with Customer [Abstract]                                0                                                                                                                                                                                 ++        Deferred revenue                2.3                0                                                                                                                                                                                 ++        Revenues recognized        1.8                        0                                                                                                                                                                                 ++        Transaction price allocated to remaining performance obligations        29.8                        0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction, Start Date [Axis]: 2021-01-01                                0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction [Line Items]                                0                                                                                                                                                                                 ++        Expected timing of revenue recognition        24 months                        0                                                                                                                                                                                 ++        Expected timing of revenue recognition, percent        0.5                        0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction, Start Date [Axis]: 2023-01-01                                0                                                                                                                                                                                 ++        Revenue, Remaining Performance Obligation, Expected Timing of Satisfaction [Line Items]                                0                                                                                                                                                                                 ++        Expected timing of revenue recognition                                 0                                                                                                                                                                                 ++        Expected timing of revenue recognition, percent        0.5                        0                                                                                                                                                                                 ++        Information about Segments and Geographic Areas (Long-Lived Assets by Geographic Area) (Details) - USD ($) $ in Millions        Dec. 31, 2020        Dec. 31, 2019                0                                                                                                                                                                                 ++        Revenues from External Customers and Long-Lived Assets [Line Items]                                0                                                                                                                                                                                 ++        Long-lived assets        96960        84587                0                                                                                                                                                                                 ++        United States                                0                                                                                                                                                                                 ++        Revenues from External Customers and Long-Lived Assets [Line Items]                                0                                                                                                                                                                                 ++        Long-lived assets        69315        63102                0                                                                                                                                                                                 ++        International                                0                                                                                                                                                                                 ++        Revenues from External Customers and Long-Lived Assets [Line Items]                                0                                                                                                                                                                                 ++        Long-lived assets        27645        21485                0                                                                                                                                                                                 ++                2016        2017        2018        2019        2020        2021        TTM                                                                                                                                                         ++                2.23418E+11        2.42061E+11        2.25382E+11        3.27223E+11        2.86256E+11        3.54636E+11        3.54636E+11                                                                                                                                                         ++                45881000000        60597000000        57418000000        61078000000        63401000000        69478000000        69478000000                                                                                                                                                         ++                3143000000        3770000000        4415000000        4743000000        5474000000        6052000000        6052000000                                                                                                                                                         ++         Net Investment Income, Revenue        9531000000        13081000000        10565000000        17214000000        14484000000        8664000000        -14777000000        81847000000        48838000000        86007000000        86007000000                                                                                                                         ++         Realized Gain/Loss on Investments, Revenue        472000000        184000000        72000000        10000000        7553000000        1410000000        -22155000000        71123000000        40905000000        77576000000        77576000000                                                                                                                         ++         Gains/Loss on Derivatives, Revenue        1963000000        2608000000        506000000        974000000        751000000        718000000        -300000000        1484000000        -159000000        966000000        966000000                                                                                                                         ++         Interest Income, Revenue        6106000000        6408000000        6484000000        6867000000        6180000000        6536000000        7678000000        9240000000        8092000000        7465000000        7465000000                                                                                                                         ++         Other Investment Income, Revenue        990000000        3881000000        3503000000        9363000000                                                                                                                                                                                 ++         Rental Income, Revenue                                        2553000000        2452000000        5732000000        5856000000        5209000000        5988000000        5988000000                                                                                                                         ++         Other Revenue        1.18387E+11        1.32385E+11        1.42881E+11        1.52435E+11        1.57357E+11        1.66578E+11        1.72594E+11        1.73699E+11        1.63334E+11        1.87111E+11        1.87111E+11                                                                                                                         ++        Total Expenses        -1.40227E+11        -1.53354E+11        -1.66594E+11        -1.75997E+11        -1.89751E+11        -2.18223E+11        -2.21381E+11        -2.24527E+11        -2.30563E+11        -2.4295E+11        -2.4295E+11                                                                                                                         ++         Benefits,Claims and Loss Adjustment Expense, Net        -25227000000        -26347000000        -31587000000        -31940000000        -36037000000        -54509000000        -45605000000        -49442000000        -49763000000        -55971000000        -55971000000                                                                                                                         ++         Policyholder Future Benefits and Claims, Net        -25227000000        -26347000000        -31587000000        -31940000000        -36037000000        -54509000000        -45605000000        -49442000000        -49763000000        -55971000000        -55971000000                                                                                                                         ++         Other Underwriting Expenses        -7693000000        -7248000000        -6998000000        -7517000000        -7713000000        -9321000000        -9793000000        -11200000000        -12798000000        -12569000000        -12569000000                                                                                                                         ++         Selling, General and Administrative Expenses        -11870000000        -13282000000        -13721000000        -15309000000        -19308000000        -20644000000        -21917000000        -23229000000        -23329000000        -23044000000        -23044000000                                                                                                                         ++         Rent Expense                                        -1335000000        -1455000000        -4061000000        -4003000000        -3520000000        -4201000000        -4201000000                                                                                                                         ++         Selling and Marketing Expenses        -11870000000        -13282000000        -13721000000        -15309000000        -17973000000        -19189000000        -17856000000        -19226000000        -19809000000        -18843000000        -18843000000                                                                                                                         ++         Other Income/Expenses        -92693000000        -1.03676E+11        -1.11009E+11        -1.17594E+11        -1.24061E+11        -1.32377E+11        -1.37664E+11        -1.37775E+11        -1.30645E+11        -1.48189E+11        -1.48189E+11                                                                                                                         ++         Total Net Finance Income/Expense        -2744000000        -2801000000        -3253000000        -3515000000        -3741000000        -4386000000        -3853000000        -3961000000        -4083000000        -4172000000        -4172000000                                                                                                                         ++         Net Interest Income/Expense        -2744000000        -2801000000        -3253000000        -3515000000        -3741000000        -4386000000        -3853000000        -3961000000        -4083000000        -4172000000        -4172000000                                                                                                                         ++         Interest Expense Net of Capitalized Interest        -2744000000        -2801000000        -3253000000        -3515000000        -3741000000        -4386000000        -3853000000        -3961000000        -4083000000        -4172000000        -4172000000                                                                                                                         ++         Income from Associates, Joint Ventures and Other Participating Interests                        -26000000        -122000000        1109000000        3014000000        -2167000000        1176000000        726000000        995000000        995000000                                                                                                                         ++         Irregular Income/Expenses                                                        -382000000        -96000000        -10671000000        .        .                                                                                                                         ++         Impairment/Write Off/Write Down of Capital Assets                                                        -382000000        -96000000        -10671000000        .        .                                                                                                                         ++        Pretax Income        22236000000        28796000000        28105000000        34946000000        33667000000        23838000000        4001000000        1.02696E+11        55693000000        1.11686E+11        1.11686E+11                                                                                                                         ++        Provision for Income Tax        -6924000000        -8951000000        -7935000000        -10532000000        -9240000000        21515000000        321000000        -20904000000        -12440000000        -20879000000        -20879000000                                                                                                                         ++        Net Income from Continuing Operations        15312000000        19845000000        20170000000        24414000000        24427000000        45353000000        4322000000        81792000000        43253000000        90807000000        90807000000                                                                                                                         ++        Net Income after Extraordinary Items and Discontinued Operations        15312000000        19845000000        20170000000        24414000000        24427000000        45353000000        4322000000        81792000000        43253000000        90807000000        90807000000                                                                                                                         ++        Non-Controlling/Minority Interests        -488000000        -369000000        -298000000        -331000000        -353000000        -413000000        -301000000        -375000000        -732000000        -1012000000        -1012000000                                                                                                                         ++        Net Income after Non-Controlling/Minority Interests        14824000000        19476000000        19872000000        24083000000        24074000000        44940000000        4021000000        81417000000        42521000000        89795000000        89795000000                                                                                                                         ++        Net Income Available to Common Stockholders        14824000000        19476000000        19872000000        24083000000        24074000000        44940000000        4021000000        81417000000        42521000000        89795000000        89795000000                                                                                                                         ++        Diluted Net Income Available to Common Stockholders        14824000000        19476000000        19872000000        24083000000        24074000000        44940000000        4021000000        81417000000        42521000000        89795000000        89795000000                                                                                                                         ++        Income Statement Supplemental Section                                                                                                                                                                                                                 ++         Reported Normalized and Operating Income/Expense Supplemental Section                                                            											
		+$$22677000000000.00											
		+Payment Amount (Total) $9,246,754,678,763.00 Display All                                                                                                                                                                                                                                                                                                                                                                											
		+1. Social Security (Employee + Employer) $26,661.80                                                                                                                                                                                                                                                                                                                                                                											
		+2. Medicare (Employee + Employer) $861,193,422,444.20 Hourly                                                                                                                                                                                                                                                                                                                                                                											
		+3. Federal Income Tax $8,385,561,229,657.00                                                                                                                                                                                                                                                                                                                                                                											
		+Note: this Report is generated based on THE payroll data for your reference only. Pease contact IRS office for special cases such as late Payment, previous overpayment, penalty                                        We assigned you Employer Identification Number :        88-1303491                                                      Best Time To Call                                                                                                                                                                                                                                                                                                          											
		+Note: This report doesn't include the pay back amount of                                                                                                                                                                                                                                                                                                                                                                               											
													
													
													
													
													
													
													
													
				Pay Schedule                       this period       year to date        Taxes / Deductions   Current      YTD                                                                                                                                                                                                                                                                                                									
				+                        Sch.      70842745000        70842745000        Federal Withholding        0        0                                                                                                                                                                                                                                                                                                									
		ZACHRY T WOOD		+                        GROSS     70842745000        70842745000        Federal Withholding        0        0                                                                                                                                                                                                                                                                                                									
		ALPHABET		+                        net, pay. 70842745000        70842745000        Federal Withholding        0        0                                                                                                                                                                                                                                                                                                									
		5323 BRADFORD DR		+                        FICA - Medicare        0     70842745000        FUTA        0        0                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             									
		DALLAS, TX 75235		                         FICA - Social Security 0        8854            FUTA        0        0                                                                                                                                                                                                                                                                                                                     									
				70842745000                                                              SUTA - 0       0									
				+                        ATAA -                                          RUTA - 0       0      									
				Report Range 5/4/2022 - 6/4/2022 88-1656496  Loca ID:      28 :l ID: 633441725 State: All Local ID: txdl 00037305581 SRVCCHG /*  */$2,267,700.00                                                                                                                                                                                                                                                                                                                                                                									
		For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions.                                                                        								                        Q4 2020                        Q4  2019                			
		Cat. No. 11320B                                                                        								Income Statement                                                                 			
		Form 1040 (2021)                                                                        								USD in "000'"s                                                                			
		Reported Normalized and Operating Income/Expense Supplemental Section                                                                        								Repayments for Long Term Debt                        Dec. 31, 2020                        Dec. 31, 2019                	Net Income after Non-Controlling/Minority Interests        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Total Revenue as Reported, Supplemental                                                                        								Costs and expenses:                                                                			
		Total Operating Profit/Loss as Reported, Supplemental                                                                        								Cost of revenues                        182527                        161857                	Reported Effective Tax Rate        0.162                0.179        0.157        0.158                0.158        0.159		
		Reported Effective Tax Rate                                                                        								Research and development                                                                	Net Income from Continuing Operations        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Reported Normalized Income                                                                        								Sales and marketing                        84732                        71896                	Net Income after Extraordinary Items and Discontinued Operations        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Reported Normalized Operating Profit                                                                        								General and administrative                        27573                        26018                			
		Other Adjustments to Net Income Available to Common Stockholders                                                                        								European Commission fines                        17946                        18464                	Net Income Available to Common Stockholders        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Discontinued Operations                                                                        								Total costs and expenses                        11052                        9551                	Diluted Net Income Available to Common Stockholders        76033000000        20642000000        18936000000        18525000000        17930000000        15227000000        11247000000        6959000000		
		Basic EPS                                                                        								Income from operations                        0                        1697                	Income Statement Supplemental Section                                                                		
		Basic EPS from Continuing Operations                                                                        								Other income (expense), net                        141303                        127626                	Reported Normalized and Operating Income/Expense Supplemental Section                                                                		
		Basic EPS from Discontinued Operations                                                                        								Income before income taxes                        41224                        34231                	Other Income/Expense, Non-Operating        -1497000000        -108000000        -484000000        -613000000        -292000000        -825000000        -223000000        -222000000		
		Diluted EPS                                                                        								Provision for income taxes                        6858000000                        5394                			
		Diluted EPS from Continuing Operations                                                                        								Net income                        22677000000                        19289000000                			
		Diluted EPS from Discontinued Operations                                                                        								*include interest paid, capital obligation, and underweighting                        22677000000                        19289000000                			
		Basic Weighted Average Shares Outstanding                                                                        								                        22677000000                        19289000000                			
		Diluted Weighted Average Shares Outstanding                                                                        								Basic net income per share of Class A and B common stock and Class C capital stock (in dollars par share)                                                                	Total Operating Profit/Loss as Reported, Supplemental        78714000000        21885000000        21031000000        19361000000        16437000000        15651000000        11213000000        6383000000		
		Reported Normalized Diluted EPS                                                                        								Diluted net income per share of Class A and Class B common stock and Class C capital stock (in dollars par share)                                                                	Total Revenue as Reported, Supplemental        2.57637E+11        75325000000        65118000000        61880000000        55314000000        56898000000        46173000000        38297000000		
		Basic EPS                                                                        											
		Diluted EPS                                                                        									Cost of Goods and Services        -1.10939E+11        -32988000000        -27621000000        -26227000000        -24103000000        -26080000000        -21117000000        -18553000000		
		Basic WASO                                                                        								For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see the seperate Instructions.                                                                			
		Diluted WASO                                                                        											
		Fiscal year end September 28th., 2022. | USD                                                                        								Returned for Signature                                                                			
										Date.______________09/01/2022                        			
		For Paperwork Reduction Act Notice, see the seperate Instructions.                                                                        											
													
													
													
													
													
													
		important information                                                                        											
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
		________________________        ________________________          DATE OF THIS NOTICE:        2022-03-18                                                                                                                                                                                                                                                                                        											
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
													
