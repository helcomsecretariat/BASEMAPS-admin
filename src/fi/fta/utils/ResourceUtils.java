package fi.fta.utils;

import java.util.Locale;
import java.util.ResourceBundle;

public class ResourceUtils
{
	
	public static final String MESSAGES_RESOURCE = "fi.fta.messages.messages";
	
	public static String getMessage(String key)
	{
		return ResourceBundle.getBundle(
			ResourceUtils.MESSAGES_RESOURCE, Locale.ENGLISH).getString(key);
	}
	
}
