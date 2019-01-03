package fi.fta.core;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;

import org.springframework.web.servlet.DispatcherServlet;

import fi.fta.utils.HibernateUtil;


public class BasemapsServlet extends DispatcherServlet
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 976116503337286583L;

	@Override
	public void init(ServletConfig config) throws ServletException
	{
		super.init(config);
		
		try
		{
			HibernateUtil.create();
		}
		catch (Exception ex)
		{
			ex.printStackTrace();
		}
	}
	
	@Override
	public void destroy()
	{
		try
		{
			HibernateUtil.close();
		}
		catch (Exception ex)
		{
			ex.printStackTrace();
		}
		
		super.destroy();
	}
	
}
