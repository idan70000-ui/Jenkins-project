pipeline {
    agent any

    environment {
        BUILD_NUMBER_TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Test - api') {
            steps {
                dir('api') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Test - web') {
            steps {
                dir('web') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }

        stage('Build Images') {
            steps {
                sh """
                    docker build \
                      --build-arg BUILD_NUMBER=${BUILD_NUMBER_TAG} \
                      --build-arg GIT_COMMIT=${env.GIT_COMMIT_SHORT} \
                      -t api-service:${BUILD_NUMBER_TAG} ./api
                """
                sh """
                    docker build \
                      --build-arg BUILD_NUMBER=${BUILD_NUMBER_TAG} \
                      --build-arg GIT_COMMIT=${env.GIT_COMMIT_SHORT} \
                      -t web-service:${BUILD_NUMBER_TAG} ./web
                """
            }
        }

                stage('Deploy') {
            when {
                branch 'master'
            }
            steps {
                sh 'docker network create app-network || true'
                sh 'docker rm -f api web nginx || true'
                sh """
                    docker run -d --network app-network --name api \
                      api-service:${BUILD_NUMBER_TAG}
                """
                sh """
                    docker run -d --network app-network --name web \
                      -e API_URL=http://api:4000 \
                      web-service:${BUILD_NUMBER_TAG}
                """
                sh 'docker build -t nginx-proxy:latest ./nginx'
                sh """
                    docker run -d --network app-network --name nginx \
                      -p 4000:4000 -p 5000:5000 \
                      nginx-proxy:latest
                """
            }
        }

        stage('Integration Test') {
            when {
                branch 'master'
            }
            steps {
                sh 'sleep 5'
                sh 'API_URL=http://api:4000 WEB_URL=http://web:5000 node integration-test.js'
            }
        }
    }
}



