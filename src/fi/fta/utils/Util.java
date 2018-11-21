package fi.fta.utils;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import fi.fta.beans.Named;

public class Util
{
	
	public static String md5(String encode)
	{
		try
		{
			MessageDigest md = MessageDigest.getInstance("MD5");
			md.update(encode.getBytes("UTF8"));
			byte s[] = md.digest();
			String ret = "";
			for (int i = 0; i < s.length; i++)
				ret += Integer.toHexString((0x000000ff & s[i]) | 0xffffff00).substring(6);
			return ret;
		}
		catch (UnsupportedEncodingException ex)
		{
			return encode;
		}
		catch (NoSuchAlgorithmException ex)
		{
			return encode;
		}
	}
	
	public static boolean equalsWithNull(Object o1, Object o2)
    {
    	if (o1 != null)
    		if (o2 != null)
    			return o1.equals(o2);
    		else
    			return false;
    	else
    		return o2 == null;
    }
	
	public static <T extends Comparable<T>> int compareAsc(T first, T second)
    {
    	if (first != null)
    		if (second != null)
    			return first.compareTo(second);
    		else
    			return 1;
    	else 
    		return (second == null) ? 0 : -1;
    }
	
	public static <T> String toCSV(Collection<T> values)
	{
		return Util.toCSV(values, "", "");
    }
	
	public static <T> String toCSV(Collection<T> values, String prefix, String suffix)
	{
		return new Util.TokenizedValues<T>(", ", values, prefix, suffix)
		{
			protected String val(T v)
			{
				return v.toString();
			};
		}.values();
    }
	
	public static <T extends Named> String csNames(Collection<T> values)
	{
		return Util.csNames(values, "", "");
    }
	
	public static <T extends Named> String csNames(Collection<T> values, String prefix, String suffix)
	{
		return new Util.TokenizedValues<T>(", ", values, prefix, suffix)
			{
				protected String val(T v)
				{
					return v.getName();
				};
			}.values();
    }

	public static <T> String toDSV(String delimiter, Collection<T> values)
	{
		return new Util.TokenizedValues<T>(delimiter, values, "", "")
		{
			protected String val(T v)
			{
				return v.toString();
			};
		}.values();
    }
	
	private abstract static class TokenizedValues<T>
	{
		
		protected String token;
		protected Collection<T> values;
		protected String prefix;
		protected String suffix;
		
		public TokenizedValues(String token, Collection<T> values, String prefix, String suffix)
		{
			this.token = token;
			this.values = values;
			this.prefix = prefix;
			this.suffix = suffix;
		}
		
		public String values()
		{
			if (values == null || values.isEmpty())
				return "";
			StringBuffer b = new StringBuffer();
			boolean first = true;
			for (T v : values)
			{
			    if (!first)
			    	b.append(token);
			    else
			    	first = false;
			    b.append(prefix + this.val(v) + suffix);
			}
			return b.toString();
		}
		
		protected abstract String val(T v);
		
	}
	
	public static boolean isEmptyString(String str)
	{
		return (str == null || str.length() == 0 || str.trim().length() == 0);
	}
	
	public static boolean isNaturalNumber(Number n)
	{
		return !(n == null || n instanceof Double || n instanceof Float || n.longValue() < 0);
	}
	
	public static boolean isEmptyCollection(Collection<?> c)
	{
		return (c == null || c.isEmpty());
	}
	
	public static boolean isEmptyMap(Map<?, ?> m)
	{
		return (m == null || m.isEmpty());
	}
	
	public static <T> boolean isEmptyArray(T[] array)
	{
		return (array == null || array.length == 0);
	}
	
	public static boolean isEmptyStringBuffer(StringBuffer str)
	{
		return (str == null || str.length() == 0 || str.toString().trim().length() == 0);
	}
	
	public static boolean isEmptyNumber(Number n)
	{
		return (n == null || n.doubleValue() == 0.0); 
	}
	
	public static boolean isEmpty(Object o)
	{
		if (o == null)
			return true;
		
		if (o instanceof String)
			return ((String)o).length() == 0 || ((String)o).trim().length() == 0;
		
		else if (o instanceof Object[])
			return ((Object[])o).length == 0;
		
		else if (o instanceof Collection)
			return ((Collection<?>)o).isEmpty();
		
		else if (o instanceof Map)
			return ((Map<?,?>)o).isEmpty();
		
		else if (o instanceof StringBuffer)
			return ((StringBuffer)o).length() == 0 || ((StringBuffer)o).toString().trim().length() == 0;
		
		return false;
	}
	
	public static boolean isTrue(Boolean b)
	{
		return b != null && b.booleanValue();
	}
	
	private static final String NORMAL_EMAIL_CHARS = 
		"^[A-Za-z0-9_\\+-]+(\\.[A-Za-z0-9_\\+-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*\\.([A-Za-z]{2,4})$";
	private static final Pattern NORMAL_PATTERN = Pattern.compile(Util.NORMAL_EMAIL_CHARS);
	private static final String RARE_EMAIL_CHARS = 
		"^[A-Za-z0-9!#\\$%&'\\*\\+/=\\?\\^_`\\{\\|}~-]+(\\.[A-Za-z0-9!#\\$%&'\\*\\+/=\\?\\^_`\\{\\|}~-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*\\.([A-Za-z]{2,})$";
	private static final Pattern RARE_PATTERN = Pattern.compile(Util.RARE_EMAIL_CHARS);
	
	public static boolean isValidEmail(String email)
	{
		if (Util.isEmptyString(email))
			return false;
		
		if (Util.NORMAL_PATTERN.matcher(email).matches())
			return true;
		else
			return Util.RARE_PATTERN.matcher(email).matches();
	}
	
    public static String URLEncode(String url)
	{
		try
		{
			return url != null ? URLEncoder.encode(url, "UTF-8") : null;
		}
		catch (UnsupportedEncodingException ex)
		{
			return url;
		}
	}
    
    public static String URLDecode(String url)
	{
		try
		{
			return url != null ? URLDecoder.decode(url, "UTF-8") : null;
		}
		catch (UnsupportedEncodingException ex)
		{
			return url;
		}
	}
    
    public static Map<String, Set<String>> mapParameters(HttpServletRequest request)
	{
		ParameterMapper pm = new ParameterMapper();
		pm.map(request);
		return pm.getValues();
	}
	
	public static Map<String, Set<String>> mapParameters(String query, String ... remove)
	{
		ParameterMapper pm = new ParameterMapper();
		pm.map(query);
		if (remove != null)
			for (String r : remove)
				pm.remove(r);
		return pm.getValues();
	}
	
	public static String composeQuery(Map<String, Set<String>> parameters, String ... skip)
	{
		StringBuffer sb = new StringBuffer();
		Set<String> toSkip = new HashSet<String>();
		if (skip != null)
			Collections.addAll(toSkip, skip);
		for (String key : parameters.keySet())
		{
			if (!toSkip.contains(key))
				for (String value : parameters.get(key))
					sb.append(key + "=" + Util.URLDecode(value) + "&");
		}
		return sb.length() > 0 ? sb.deleteCharAt(sb.length() - 1).toString() : sb.toString();
	}
	
	public static String getStackTrace(Throwable th)
	{
		StringWriter sw = new StringWriter();
	    th.printStackTrace(new PrintWriter(sw));
	    return sw.toString();
	}
	
	public static Float getFloat(String source, Float defaultValue)
	{
		try
		{
			return Util.isEmptyString(source) ? defaultValue : new Float(source);
		}
		catch (Exception e)
		{
			return defaultValue;
		}
	}
	
	public static Double getDouble(String source, Double defaultValue)
	{
		try
		{
			return Util.isEmptyString(source) ? defaultValue : new Double(source);
		}
		catch (Exception e)
		{
			return defaultValue;
		}
	}
	
	public static boolean containsHTML(String content)
	{
		return content != null && content.replaceAll("[\r\n]", "").matches(".*<[^>]*>.*");
	}
	
	public static boolean containsHTML(String content, String tags)
	{
		return content != null && content.replaceAll("[\r\n]", "").toLowerCase().matches(".*<\\s*(" + tags.toLowerCase() + ")(\\s+[^>]*>|>).*");
	}
	
	public static boolean startsWithHTML(String content, String tags)
	{
		return content != null && content.replaceAll("[\r\n]", "").toLowerCase().trim().matches("<\\s*(" + tags.toLowerCase() + ")(\\s+[^>]*>|>).*");
	}
	
	public static String wrapHTML(String content, String wrapper)
	{
		return wrapper.replaceFirst("><", new StringBuffer(">").append(content).append("<").toString());
	}
	
	public static String stripHTML(String content)
	{
		return Util.stripHTMLWithReplacement(content, "");
	}
	
	public static String stripHTML(String content, String allowedTags)
	{
		if (content != null)
		{
			if (Util.isEmptyString(allowedTags))
			{
				return Util.stripHTML(content);
			}
			else
			{
				String exp = "(?i)<(?!\\s*(/?\\s*(" + allowedTags + "|" + allowedTags.toUpperCase() + ")[^a-zA-Z]))[^>]*>";
				return content.replaceAll(exp, "");
			}
		}
		return content;
	}
	
	public static String stripMajorHTML(String content)
	{
		return Util.stripHTML(content, "div|br|b|i|ul|ol|li|strong");
	}
	
	public static String stripHTMLWithReplacement(String content, String replacement)
	{
		return content != null ? content.replaceAll("<[^>]*>", replacement) : "";
	}
	
	public static String stripHTMLTag(String content, String ... tags)
	{
		if (content != null && tags != null)
		{
			for (String tag : tags)
			{
				if (tag != null)
				{
					content = content.replaceAll("(?s)<\\s*" + tag + "[^>]*>.*</?\\s*" + tag + "\\s*>", "");
				}
			}
		}
		return content;
	}
	
	public static String stripUTF16(String source)
	{
		if (!Util.isEmptyString(source))
		{
			StringBuffer b = new StringBuffer();
			for (int i = 0; i < source.length(); i++)
			{
				char c = source.charAt(i);
				if (!Character.isHighSurrogate(c) && !Character.isLowSurrogate(c))
				{
					b.append(c);
				}
			}
			return b.toString();
		}
		return source;
	}
	
}
