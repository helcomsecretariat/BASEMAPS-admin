package fi.fta.utils;

import java.io.InputStream;
import java.util.Properties;


public class ProjectProperties
{
	
	protected String pathTemplates;
	protected String resourcePath;
	
	protected String emailAdmin;
	
	protected String projectName;
	protected String projectURL;
	
	protected String SMTPServer;
	protected Integer SMTPPort;
	protected String SMTPUser;
	protected String SMTPPassword;
	
	
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
	        
			SMTPServer = props.getProperty("smtp.server");
			SMTPPort = Integer.valueOf(props.getProperty("smtp.port"));
			SMTPUser = props.getProperty("smtp.user");
			SMTPPassword = props.getProperty("smtp.password");
			
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
	
	public String getSMTPServer() {
		return SMTPServer;
	}
	
	public Integer getSMTPPort() {
		return SMTPPort;
	}
	
	public String getSMTPUser()
	{
		return SMTPUser;
	}
	
	public String getSMTPPassword()
	{
		return SMTPPassword;
	}
	
}
