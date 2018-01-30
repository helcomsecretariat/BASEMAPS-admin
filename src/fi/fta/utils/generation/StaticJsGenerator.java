package fi.fta.utils.generation;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;

import fi.fta.utils.Util;

public class StaticJsGenerator
{
	
	private static Logger logger = Logger.getLogger(StaticJsGenerator.class);
	
	
	private enum MessagesSource
	{
		
		COMMON("messages.js", "msg");
		
		
		protected String file;
		
		protected String[] keywords;
		
		private MessagesSource(String file, String ... keywords)
		{
			this.file = file;
			this.keywords = keywords;
		}
		
	}
	
	public static void collectMessagesSource(String outputDir, MessagesSource ms)
	{
		SystemMessagesSource source = new SystemMessagesSource();
		source.addMessageFilter(ms.keywords);
		StaticJsGenerator.toFile(outputDir+"/"+ms.file, source.collect());
	}
	
	private static void toFile(String outputFile, String content)
	{
		if (!Util.isEmptyString(content))
		{
			try
			{
				FileUtils.writeStringToFile(new File(outputFile), content);
			}
			catch (IOException ex)
			{
				logger.error("StaticJsGenerator.toFile(" + outputFile + ")", ex);
			}
		}
	}
	
	
	public static void main(String arg[])
	{
		StaticJsGenerator.collectMessagesSource(arg[0], MessagesSource.valueOf(arg[1]));
	}
	
}
