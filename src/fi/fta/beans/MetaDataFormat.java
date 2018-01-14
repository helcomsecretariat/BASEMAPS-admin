package fi.fta.beans;

public enum MetaDataFormat
{
	
	UNKNOWN, PLAIN, HTML, XML;
	
	public static MetaDataFormat fromString(String format)
	{
		if (format != null)
		{
			if (format.trim().toLowerCase().endsWith("xml"))
			{
				return XML;
			}
			if (format.trim().toLowerCase().endsWith("html"))
			{
				return HTML;
			}
			if (format.trim().toLowerCase().endsWith("plain"))
			{
				return PLAIN;
			}
		}
		return UNKNOWN;
	}
	
}
