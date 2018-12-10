package fi.fta.utils;

public enum MimeFormat
{
	
	JSON("application/json"),
	GEOJSON("application/geojson"),
	XML("text/xml"),
	GML("application/vnd.ogc.gml"),
	XLXS("application/vnd.ms-excel"),
	HTML("text/html");
	
	
	private String type;
	
	private MimeFormat(String type)
	{
		this.type = type;
	}
	
	public String getType()
	{
		return type;
	}
	
	public boolean is(String type)
	{
		return this.type.equalsIgnoreCase(type);
	}
	
	
	public static MimeFormat get(String type)
	{
		for (MimeFormat f : MimeFormat.values())
		{
			if (f.is(type))
			{
				return f;
			}
		}
		return null;
	}
	
}
