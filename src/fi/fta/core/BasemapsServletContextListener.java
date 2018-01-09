package fi.fta.core;

import java.util.Enumeration;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import fi.fta.data.managers.WMSManager;


public class BasemapsServletContextListener implements ServletContextListener
{
	
	public void contextInitialized(ServletContextEvent arg0)
	{}
	
	public void contextDestroyed(ServletContextEvent arg0)
	{
		WMSManager.getInstance().clear();
		
		// Axis 2 commons-httpclient-3.1 memory leak workaround
		//MultiThreadedHttpConnectionManager.shutdownAll();
		
		// Log4j leak workaround
		@SuppressWarnings("unchecked")
		Enumeration<Logger> el = (Enumeration<Logger>)LogManager.getCurrentLoggers();
		while (el.hasMoreElements())
		{
			Logger l = el.nextElement();
			l.removeAllAppenders();
		}
		LogManager.shutdown();
		
		// common-loggings leak workaround
		org.apache.commons.logging.LogFactory.release(this.getClass().getClassLoader());
		org.apache.commons.logging.LogFactory.releaseAll();
	}
	
}
