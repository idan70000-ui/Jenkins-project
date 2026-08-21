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

                sh 'docker rm -f api-new web-new || true'
                sh """
                    docker run -d --network app-network --name api-new \
                      api-service:${BUILD_NUMBER_TAG}
                """
                sh """
                    docker run -d --network app-network --name web-new \
                      -e API_URL=http://api-new:4000 \
                      web-service:${BUILD_NUMBER_TAG}
                """

                sh 'sleep 3'

                script {
                    def healthy = true
                    try {
                        sh 'curl -f http://api-new:4000/health'
                        sh 'curl -f http://web-new:5000/health'
                    } catch (err) {
                        healthy = false
                    }

                    if (!healthy) {
                        sh 'docker rm -f api-new web-new || true'
                        error('Deployment failed: New containers are not healthy, rolling back to previous version.')
                    }

                    sh 'docker rename api-current api-old || true'
                    sh 'docker rename web-current web-old || true'
                    sh 'docker rename api-new api-current'
                    sh 'docker rename web-new web-current'
                    sh 'docker rm -f api-old web-old || true'

                    sh '''
                        if [ -z "$(docker ps -q -f name=^nginx$)" ]; then
                            docker build -t nginx-proxy:latest ./nginx
                            docker run -d --network app-network --name nginx \
                              -p 4000:4000 -p 5000:5000 nginx-proxy:latest
                        else
                            docker exec nginx nginx -s reload
                        fi
                    '''
                }
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



