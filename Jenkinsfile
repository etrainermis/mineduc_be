pipeline {
    agent any
    environment {
        DOCKER_IMAGE = 'etrainermis/fsf-backend-service'
        DOCKER_CONTAINER='fsf-backend-service'
        GITHUB_TOKEN = credentials('github-token-id')
        REPO = 'etrainermis/FSF-backend-service'
        APP_PORT = 4045
    }
    stages {
        stage('Checkout') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [[
                        $class: 'PathRestriction',
                        excludedRegions: 'src/main/resources/application*.properties'
                    ]],
                    userRemoteConfigs: [[
                        url: 'https://github.com/etrainermis/mineduc_be.git',
                        credentialsId: 'etrainer_org_secret'
                    ]]
                ])
            }
        }

        stage('Set up env variables') {
            steps {
                withCredentials([file(credentialsId: 'fsf-be-env', variable: 'FSF_ENV_FILE')]) {
                    script {
                        // Make sure the shell script uses proper quoting and escaping
                        sh '''
                        mkdir -p /tmp/env-files   # Create a temporary directory if it doesn't exist
                        cp "${FSF_ENV_FILE}" /tmp/env-files/.env   # Copy the file to a temporary directory
                        mv /tmp/env-files/.env "$(pwd)/.env"   # Move the file to the workspace directory
                        '''
                    }
                }
                }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t $DOCKER_IMAGE ."
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def instances = 2
                    for (int i = 0; i < instances; i++) {
                        def port = 3036.toInteger() + i
                        sh """
                            docker rm -f ${DOCKER_CONTAINER}-${i} || true
                            docker run -d \
                                --name ${DOCKER_CONTAINER}-${i} \
                                -p ${port}:${env.APP_PORT} \
                                --restart unless-stopped \
                                ${DOCKER_IMAGE}
                            echo "Deployed ${DOCKER_CONTAINER}-${i} on port ${port}"
                        """
                        sleep(time: 5, unit: 'SECONDS')
                        sh "docker logs ${DOCKER_CONTAINER}-${i}"
                    }
                }
            }
        }
    }
    post {
        always {
            sh "docker image prune -f"
            sh "docker ps -a | grep ${DOCKER_CONTAINER}"
        }
        failure {
            sh "docker ps -a | grep ${DOCKER_CONTAINER} && docker logs ${DOCKER_CONTAINER}-0"
        }
    }
}