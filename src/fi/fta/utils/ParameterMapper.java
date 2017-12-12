package fi.fta.utils;

import java.util.Enumeration;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;




public class ParameterMapper
{
	
	public LinkedHashMap<String, Set<String>> values;
	
	public ParameterMapper()
	{
		values = new LinkedHashMap<String, Set<String>>();
	}
	
	public ParameterMapper(HttpServletRequest request)
	{
		this();
		this.map(request);
	}
	
	public void map(HttpServletRequest request)
	{
		Enumeration<?> parameterNames = request.getParameterNames();
		while (parameterNames.hasMoreElements())
		{
			String key = (String)parameterNames.nextElement();
			if (!Util.isEmptyString(key) && request.getParameterValues(key) != null)
			{
				for (String value : request.getParameterValues(key))
					this.add(key, Util.URLEncode(value));
			}
		}
	}
	
	public void map(String query)
	{
		if (Util.isEmptyString(query))
			return;
		for (String entry : query.split("[\\?&]"))
		{
			if (Util.isEmptyString(entry))
				continue;
			String[] pair = entry.split("=");
			if (pair.length > 1 && !Util.isEmptyString(pair[0]))
				this.add(pair[0], Util.URLEncode(pair[1]));
		}
	}
	
	protected synchronized void add(String key, String value)
	{
		if (!values.containsKey(key))
			values.put(key, new HashSet<String>());
		values.get(key).add(value);
	}
	
	public Set<String> get(String key)
	{
		return values.get(key);
	}
	
	public String getFirst(String key)
	{
		return values.containsKey(key) ? values.get(key).iterator().next() : null;
	}
	
	public Set<String> remove(String key)
	{
		return values.remove(key);
	}
	
	public LinkedHashMap<String, Set<String>> getValues()
	{
		return values;
	}
	
	
	public static ParameterMapper get(HttpServletRequest request)
	{
		return new ParameterMapper(request);
	}
	
}
