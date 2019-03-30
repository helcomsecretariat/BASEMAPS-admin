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
    	return (o1 == null) ? o2 == null : ((o2 == null) ? false : o1.equals(o2));
    }
	
	public static boolean equalsIgnoreCase(String s1, String ... ss)
	{
		if (s1 != null && ss != null)
		{
			for (String s : ss)
			{
				if (s1.equalsIgnoreCase(s))
				{
					return true;
				}
			}
		}
		return false;
	}
	
	public static <T extends Comparable<T>> int compareAsc(T c1, T c2)
    {
    	return (c1 == null) ? ((c2 == null) ? 0 : -1) : ((c2 == null) ? 1 : c1.compareTo(c2));
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
			StringBuilder b = new StringBuilder();
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
	
	public static boolean isPositive(Number n)
	{
		return !(n == null || n.floatValue() <= 0.0);
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
	
	public static boolean isEmptyStringBuilder(StringBuilder str)
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
		
		else if (o instanceof StringBuilder)
			return ((StringBuilder)o).length() == 0 || ((StringBuilder)o).toString().trim().length() == 0;
		
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
		StringBuilder sb = new StringBuilder();
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
		return wrapper.replaceFirst("><", new StringBuilder(">").append(content).append("<").toString());
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
			StringBuilder b = new StringBuilder();
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
	
	public static String osFromUserAgent(String ua)
    {
    	if (ua != null)
    	{
    		String[][] oss = new String[][]{
	    		new String[]{"Windows", "Windows|Win 9x|Win16|Win95|Win98|WinNT4.0|WinNT"},
	    		new String[]{"Android", "Android"},
	    		new String[]{"Open BSD", "OpenBSD"},
	    		new String[]{"Sun OS", "SunOS"},
	    		new String[]{"Linux", "Linux|X11"},
	    		new String[]{"iOS", "iPhone|iPad|iPod"},
	    		new String[]{"Mac OS X", "Mac OS X"},
	    		new String[]{"Mac OS", "MacPPC|MacIntel|Mac_PowerPC|Macintosh"},
	    		new String[]{"QNX", "QNX"},
	    		new String[]{"UNIX", "UNIX"},
	    		new String[]{"BeOS", "BeOS"},
	    		new String[]{"OS/2", "OS\\/2"},
	    		new String[]{"Search Bot", "nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\\/Teoma|ia_archiver"}
	    	};
	    	for (String[] os : oss)
	    	{
	    		if (Pattern.matches(".*(" + os[1] + ").*", ua))
	    		{
	    			return os[0];
	    		}
	    	}
    	}
    	return null;
    }
    
    public static String browserFromUserAgent(String ua)
    {
		if (ua != null)
		{
	    	// Opera
			if (ua.indexOf("Opera") >= 0)
			{
				return "Opera";
			}
			// MSIE
			else if (ua.indexOf("MSIE") >= 0)
			{
				return "Microsoft Internet Explorer";
			}
			//IE 11 no longer identifies itself as MS IE, so trap it
			//http://stackoverflow.com/questions/17907445/how-to-detect-ie11
			else if (ua.indexOf("Netscape") >= 0 && ua.indexOf("Trident/") >= 0)
			{
				return "Microsoft Internet Explorer";
			}
			// Chrome
			else if (ua.indexOf("Chrome") >= 0)
			{
				return "Chrome";
			}
			// Safari
			else if (ua.indexOf("Safari") >= 0)
			{
				return "Safari";
			}
			// Chrome on iPad identifies itself as Safari. Actual results do not match what Google claims
			//  at: https://developers.google.com/chrome/mobile/docs/user-agent?hl=ja
			//  No mention of chrome in the user agent string. However it does mention CriOS, which presumably
			//  can be keyed on to detect it.
			if (ua.indexOf("CriOS") >= 0)
			{
				//Chrome on iPad spoofing Safari...correct it.
				return "Chrome";
			}
			// Firefox
			else if (ua.indexOf("Firefox") >= 0)
			{
				return "Firefox";
			}
			// Other browsers
			else if ((ua.lastIndexOf(' ') + 1) < ua.lastIndexOf("/"))
			{
				return ua.substring((ua.lastIndexOf(' ') + 1), ua.lastIndexOf('/'));
			}
		}
		return null;
    }
    
}
