package fi.fta.utils.generation;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.ResourceBundle;
import java.util.Set;

import org.springframework.context.support.ResourceBundleMessageSource;

public class MessagesBundle extends ResourceBundleMessageSource
{
	
	private Set<String> filter;
	
	public MessagesBundle(String ... keys)
	{
		super();
		if (keys != null)
		{
			this.filter = new HashSet<>();
			for (String key : keys)
			{
				this.filter.add(key);
			}
		}
	}
	
	public Map<String, String> getBundleContent(String name, Locale locale)
	{
		Map<String, String> ret = new HashMap<String, String>();
		ResourceBundle bundle = getResourceBundle(name, locale);
		for (String key : bundle.keySet())
		{
			if (this.match(key))
			{
				ret.put(key, bundle.getString(key));
			}
		}
		return ret;
	}
	
	private boolean match(String key)
	{
		if (filter != null)
		{
			for (String f : filter)
			{
				if (key.startsWith(f))
				{
					return true;
				}
			}
			return false;
		}
		return true;
	}
	
}
