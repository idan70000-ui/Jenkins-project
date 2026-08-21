import jenkins.model.*
import org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject
import jenkins.branch.BranchSource
import jenkins.plugins.git.GitSCMSource
import com.cloudbees.hudson.plugins.folder.computed.PeriodicFolderTrigger

def instance = Jenkins.getInstance()
def jobName = "jenkins-assignment-mb"

if (instance.getItem(jobName) == null) {
    def mb = instance.createProject(WorkflowMultiBranchProject.class, jobName)

    def gitSource = new GitSCMSource("https://github.com/idan70000-ui/Jenkins-project.git")
    def branchSource = new BranchSource(gitSource)
    mb.getSourcesList().add(branchSource)

    mb.addTrigger(new PeriodicFolderTrigger("1m"))

    mb.save()
    instance.save()
}