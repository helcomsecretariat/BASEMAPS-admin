package fi.fta.beans;

public enum LayerServiceType
{
	
	WMS(Values.WMS), WFS(Values.WFS);
	
	private LayerServiceType(String value)
	{
		if (this.name() != value)
		{
			throw new IllegalArgumentException("Must be of registered value!");
		}
	}
	
	public static final class Values
	{
		
		public static final String WMS = "WMS";
		public static final String WFS = "WFS";
		
	}
	
}
