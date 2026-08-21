FROM jenkins/jenkins:lts

USER root

RUN apt-get update && \
    apt-get install -y docker.io docker-compose-plugin && \
    rm -rf /var/lib/apt/lists/*

USER jenkins

ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY security.groovy /usr/share/jenkins/ref/init.groovy.d/security.groovy
COPY job.groovy /usr/share/jenkins/ref/init.groovy.d/job.groovy