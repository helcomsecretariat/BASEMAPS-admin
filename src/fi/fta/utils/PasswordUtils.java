package fi.fta.utils;

import org.apache.commons.codec.digest.DigestUtils;

public class PasswordUtils
{
	
	private static final String KEY = "helCom";
	
	public static String encode(String password)
	{
		return DigestUtils.sha1Hex(PasswordUtils.KEY + password);
	}
	
}
