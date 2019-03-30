package fi.fta.utils;

import java.util.Base64;

import org.apache.commons.codec.digest.DigestUtils;

import fi.fta.beans.Pair;
import fi.fta.beans.PasswordResetToken;

public class PasswordUtils
{
	
	private static String SEPARATOR = "|";
	private static final String KEY = "helCom";
	
	
	public static String encode(String password)
	{
		return DigestUtils.sha1Hex(PasswordUtils.KEY + password);
	}
	
	public static String generate(int length)
	{
		StringBuilder pass = new StringBuilder();
		for (int i = 0; i < (length > 0 ? length : 14); i++)
		{
			char c = (char)MathUtils.random(33, 125);
			while (StringUtils.isExcluded(c))
			{
				c = (char)MathUtils.random(33, 125);
			}
			pass.append(c);
		}
		return pass.toString();
	}
	
	public static String getKey(PasswordResetToken token)
	{
		StringBuilder sb = new StringBuilder(token.getId() != null ? token.getId().toString() : "null");
		sb.append(PasswordUtils.SEPARATOR);
		sb.append(DigestUtils.sha1Hex(token.getCode() + PasswordUtils.KEY));
		return Base64.getUrlEncoder().encodeToString(sb.toString().getBytes());
	}
	
	public static Pair<Long, String> decodeKey(String key)
	{
		String[] parts = new String(Base64.getUrlDecoder().decode(key)).split("\\" + PasswordUtils.SEPARATOR);
		Pair<Long, String> ret = new Pair<>();
		if (parts.length > 0)
		{
			try
			{
				ret.setFirst(new Long(parts[0]));
			}
			catch (NumberFormatException ex)
			{}
		}
		if (parts.length > 1)
		{
			ret.setSecond(parts[1]);
		}
		return ret;
	}
	
	public static boolean validate(String signature, PasswordResetToken token)
	{
		return !Util.isEmptyString(signature) && !Util.isEmptyString(token.getCode()) &&
			signature.equals(DigestUtils.sha1Hex(token.getCode() + PasswordUtils.KEY));
	}
	
}
