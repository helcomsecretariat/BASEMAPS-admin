package fi.fta.velocity;

import java.io.StringWriter;
import java.util.List;
import java.util.Map;

import org.apache.velocity.Template;
import org.apache.velocity.app.VelocityEngine;
import org.apache.velocity.context.Context;
import org.apache.velocity.exception.ParseErrorException;
import org.apache.velocity.exception.ResourceNotFoundException;

import fi.fta.data.managers.PropertiesManager;
import fi.fta.utils.Encoding;
import fi.fta.utils.ProjectProperties;


public class VelocityTemplateTool
{
	
	protected VelocityEngine velocityEngine;
	
	protected static VelocityTemplateTool instance = null;
	
	protected VelocityTemplateTool() throws Exception
	{
		velocityEngine = new VelocityEngine();
		velocityEngine.setProperty(
			VelocityEngine.FILE_RESOURCE_LOADER_PATH, ProjectProperties.getInstance().getPathTemplates());
		velocityEngine.init(PropertiesManager.loadPropertiesResource(
			ProjectProperties.getInstance().getPropertiesPath("velocity")));
		
		System.out.println(
			"FILE_RESOURCE_LOADER_PATH = [" + 
			velocityEngine.getProperty(VelocityEngine.FILE_RESOURCE_LOADER_PATH) + "]");
	}
	
	protected VelocityTemplateTool(Map<String, List<String>> additionalProperties) throws Exception
	{
		velocityEngine = new VelocityEngine();
		velocityEngine.setProperty(
			VelocityEngine.FILE_RESOURCE_LOADER_PATH, ProjectProperties.getInstance().getPathTemplates());
		for (String key : additionalProperties.keySet())
			for (String value : additionalProperties.get(key))
				velocityEngine.addProperty(key, value);
		velocityEngine.init(PropertiesManager.loadPropertiesResource(
			ProjectProperties.getInstance().getPropertiesPath("velocity")));
		
		System.out.println(
			"FILE_RESOURCE_LOADER_PATH = [" + 
			velocityEngine.getProperty(VelocityEngine.FILE_RESOURCE_LOADER_PATH) + "]");
	}
	
	public static VelocityTemplateTool getInstance() throws Exception
	{
		if (instance == null)
		{
			synchronized (VelocityTemplateTool.class)
			{
				if (instance == null)
				{
					instance = new VelocityTemplateTool();
				}
			}
		}
		return instance;
	}
	
	public String render(String templateName, Context ctx) throws Exception
	{
		return render(templateName, ctx, Encoding.DEFAULT_ENCODING);
	}
	
	public String render(String templateName, Context ctx, String encoding) throws ResourceNotFoundException, ParseErrorException, Exception
	{
		Template t = velocityEngine.getTemplate(templateName, encoding);
		
		if (t == null)
			return null;
		
		StringWriter sw = new StringWriter();
		t.merge(ctx, sw);
		
		return sw.toString();
	}
	
	public boolean templateExists(String templateName)
	{
		return velocityEngine.resourceExists(templateName);
	}
	
}
