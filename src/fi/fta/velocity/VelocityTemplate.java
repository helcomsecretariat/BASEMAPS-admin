package fi.fta.velocity;

import java.io.File;

import org.apache.velocity.VelocityContext;

import fi.fta.utils.ProjectProperties;

public class VelocityTemplate
{
	
	protected VelocityContext ctx;
	
	protected String name;
	
	public VelocityTemplate(String name)
	{
		ctx = new VelocityContext();
		this.name = name.replace("/", File.separator) + ".vm";
	}
	
	public void set(String name, Object value)
	{
		ctx.put(name, value);
	}
	
	public Object get(String name)
	{
		return ctx.get(name);
	}
	
	public String render()
	{
		try
		{
			ctx.put("props", ProjectProperties.getInstance());
			
			return VelocityTemplateTool.getInstance().render(name, ctx);
		}
		catch (Exception ex)
		{
			ex.printStackTrace();
			return null;
		}
	}
	
	public boolean exists()
	{
		try
		{
			return VelocityTemplateTool.getInstance().templateExists(name);
		}
		catch (Exception ex)
		{
			return false;
		}
	}
	
}
