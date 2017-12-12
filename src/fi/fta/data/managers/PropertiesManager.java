package fi.fta.data.managers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class PropertiesManager
{

	public static final String EXT = ".properties";
	
	public static Properties loadPropertiesFile(String fileName) throws FileNotFoundException, IOException
	{
		File f = new File(fileName);
		FileInputStream fin = null;
		try
		{
			fin = new FileInputStream(f);
			Properties props = new Properties();
			props.load(fin);
			return props;
		}
		catch (IOException ex)
		{
			throw ex;
		}
		finally
		{
			if (fin != null)
				fin.close();
		}
	}
	
	protected static InputStream loadPropertiesStream(String path)
	{
		return PropertiesManager.class.getClassLoader().getResourceAsStream(path);
	}
	
	public static Properties loadPropertiesResource(String path) throws IOException
	{
		InputStream in = null;
		try
		{
			in = PropertiesManager.loadPropertiesStream(path);
			Properties props = new Properties();
			props.load(in);
			return props;
			
		}
		catch (IOException ex)
		{
			throw ex;
		}
		finally
		{
			if (in != null)
				in.close();
		}
	}
	
}
