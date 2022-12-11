#!/usr/bin/env node

"use strict";

module.exports = join.path("bitore.sig/my.sigs").join(+console.func(r)).''
':Build::':'')colsole.func('((c)(r))','' '+','' '('A'G'S')')'.')':''     '\'';
':'Build':'':'' :'
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
