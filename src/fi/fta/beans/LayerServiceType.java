package fi.fta.beans;

public enum LayerServiceType
{
	
	WMS(Values.WMS), WFS(Values.WFS), ARCGIS(Values.ARCGIS), DOWNLOAD(Values.DOWNLOAD);
	
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
		public static final String ARCGIS = "ARCGIS";
		public static final String DOWNLOAD = "DOWNLOAD";
		
	}
	
}
