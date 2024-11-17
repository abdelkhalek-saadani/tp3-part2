pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE = "abdelkhaleksaadanii/k8s-app"
        DOCKER_TAG = "${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/abdelkhalek-saadani/tp3-part2.git'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                sh """
                    docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .
                    docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest
                """
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                sh """
                    echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin
                    docker push ${DOCKER_IMAGE}:${DOCKER_TAG}
                    docker push ${DOCKER_IMAGE}:latest
                """
            }
        }
        
        // stage('Deploy to Kubernetes') {
        //     steps {
        //         ansiblePlaybook(
        //             playbook: 'deploy.yml',
        //             inventory: 'inventory.ini'
        //         )
        //     }
        // }
        
        stage('Monitor') {
            steps {
                script {
                    // Simple check if Nagios can see the deployment
                    sh '''
                        curl -f -u nagiosadmin:nagiosadmin \
                            http://nagios:80/nagios/cgi-bin/statusjson.cgi?query=service \
                            || echo "Monitoring check failed"
                    '''
                }
            }
        }
    }
    
    
}