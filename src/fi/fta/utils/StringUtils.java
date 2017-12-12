package fi.fta.utils;

import java.text.Collator;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StringUtils
{
	
	protected static String AMPERSAND = "&";
	
	protected static Map<String, String> specialHTMLChars = new HashMap<String, String>();
	static
	{
		specialHTMLChars.put("<", "&#60;");
		specialHTMLChars.put(">", "&#62;");
		specialHTMLChars.put("(", "&#40;");
		specialHTMLChars.put(")", "&#41;");
		specialHTMLChars.put("\"", "&#34;");
		specialHTMLChars.put("'", "&#39;");
		//restrictedChars.put("#", "&#35;");
		specialHTMLChars.put(StringUtils.AMPERSAND, "&#38;");
	}
	
	public static boolean hasSpecialHTMLChars(String input)
	{
		for (String key : specialHTMLChars.keySet())
			if (input.indexOf(key) >= 0)
				return true;
		return false;
	}
	
	public static String replaceSpecialHTMLChars(String input)
	{
		if (input == null || input.equals(""))
			return input;
		
		String ret = StringUtils.replaceAmpersand(input);
		for (String key : specialHTMLChars.keySet())
			if (key != StringUtils.AMPERSAND)
				if (key == "(" || key == ")")
					ret = ret.replaceAll("\\" + key, specialHTMLChars.get(key));
				else
					ret = ret.replaceAll(key, specialHTMLChars.get(key));
		return ret;
	}
	
	protected static Pattern htmlCodePattern = Pattern.compile("#[0-9]*;");
	protected static String replaceAmpersand(String input)
	{
		String[] parts = input.split(StringUtils.AMPERSAND);
		String out = parts.length > 0 ? parts[0] : "";
		for (int i = 1; i < parts.length; i++)
		{
			Matcher m = htmlCodePattern.matcher(parts[i]);
			if (!m.find() || m.start() != 0)
				out = out + specialHTMLChars.get(StringUtils.AMPERSAND) + parts[i];
			else
				out = out + StringUtils.AMPERSAND + parts[i];
		}
		if (input.endsWith(StringUtils.AMPERSAND))
			out = out + specialHTMLChars.get(StringUtils.AMPERSAND);
		return out;
	}
	
	protected static Map<String, Collator> localeCollators = new HashMap<String, Collator>();
	
	public static Collator getCollator(Locale l)
	{
		synchronized (localeCollators)
		{
			if (!localeCollators.containsKey(l.getLanguage()))
			{
				Collator c = Collator.getInstance(l);
				c.setStrength(Collator.SECONDARY);
				localeCollators.put(l.getLanguage(), c);
			}
		}
		return localeCollators.get(l.getLanguage()); 
	}
	
	public static int compare(Locale l, String s1, String s2)
	{
		return StringUtils.getCollator(l).compare(s1, s2);
	}
	
	public static Comparator<String> getLocaleStringComparator(final Locale l)
	{
		return new Comparator<String>()
		{
			public int compare(String o1, String o2)
			{
				return StringUtils.compare(l, o1, o2);
			}
		};
	}
	
	public static String print(Double n, int positions)
	{
		return n != null ? String.format("%1$." + positions + "f", n) : "..";
	}
	
}
