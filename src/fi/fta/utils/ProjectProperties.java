package fi.fta.utils;

import java.io.InputStream;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

import fi.fta.beans.MailSettingsFacade;


public class ProjectProperties implements MailSettingsFacade
{
	
	protected String pathTemplates;
	protected String resourcePath;
	
	protected String emailAdmin;
	
	protected String projectName;
	protected String projectURL;
	
	protected String azureKey;
	protected Set<String> translationAcceptableLanguages;
	
	protected String smtpServer;
	protected Integer smtpPort;
	protected String smtpUser;
	protected String smtpPassword;
	
	
	protected static ProjectProperties instance;
	
	public static ProjectProperties getInstance()
	{
		if (instance == null)
		{
			synchronized (ProjectProperties.class)
			{
				if (instance == null)
				{
					instance = new ProjectProperties();
				}
			}
		}
		return instance;
	}
	
	protected ProjectProperties()
	{
		try
		{
			InputStream in = ProjectProperties.class.getClassLoader().getResourceAsStream("project.properties");
			
			Properties props = new Properties();
			props.load(in);
			in.close();
			
			pathTemplates = props.getProperty("path.templates");
			resourcePath = props.getProperty("path.resource");
			
			emailAdmin = props.getProperty("email.admin");
			
	        projectName = props.getProperty("project.name");
	        projectURL = props.getProperty("project.url");
	        
	        azureKey = props.getProperty("azure.key");
	        translationAcceptableLanguages = new HashSet<>(
	        	Arrays.asList(props.getProperty("translation.acceptable.languages").split(",")));
	        
			smtpServer = props.getProperty("smtp.server");
			smtpPort = Integer.valueOf(props.getProperty("smtp.port"));
			smtpUser = props.getProperty("smtp.user");
			smtpPassword = props.getProperty("smtp.password");
			
		}
		catch (Exception ex)
		{
			System.out.println("PROBLEMS WHILE LOADING PROPERTIES:");
			ex.printStackTrace();
		}
	}
	
	public String getPathTemplates() {
		return pathTemplates;
	}

	public String getResourcePath() {
		return resourcePath;
	}
	
	public String getPropertiesPath(String name) {
		return resourcePath + "/" + name + ".properties";
	}
	
	public String getEmailAdmin() {
		return emailAdmin;
	}

	public String getProjectName() {
		return projectName;
	}
	
	public String getProjectURL() {
		return projectURL;
	}
	
	public String getProjectHost() {
		int ind = projectURL.indexOf('/', projectURL.indexOf("://") + 3);
		return ind > 0 ? projectURL.substring(0, ind) : projectURL;
	}
	
	public String getAzureKey() {
		return azureKey;
	}

	public Set<String> getTranslationAcceptableLanguages() {
		return translationAcceptableLanguages;
	}

	public String getSmtpServer() {
		return smtpServer;
	}
	
	public Integer getSmtpPort() {
		return smtpPort;
	}
	
	public String getSmtpUser()
	{
		return smtpUser;
	}
	
	public String getSmtpPassword()
	{
		return smtpPassword;
	}
	
}
