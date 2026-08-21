import jenkins.model.*
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import hudson.plugins.git.GitSCM
import hudson.plugins.git.BranchSpec

def instance = Jenkins.getInstance()
def jobName = "jenkins-assignment"

if (instance.getItem(jobName) == null) {
    def job = instance.createProject(WorkflowJob.class, jobName)

    def scm = new GitSCM("https://github.com/idan70000-ui/Jenkins-project.git")
    scm.getBranches().clear()
    scm.getBranches().add(new BranchSpec("*/master"))

    def flowDefinition = new CpsScmFlowDefinition(scm, "Jenkinsfile")
    job.setDefinition(flowDefinition)
    job.save()

    instance.save()
}