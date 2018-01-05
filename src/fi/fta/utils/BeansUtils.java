package fi.fta.utils;

import org.geotools.data.ows.Layer;
import org.geotools.data.ows.WMSCapabilities;

public class BeansUtils
{
	
	public static Layer getLayerByName(WMSCapabilities capabilities, String name)
	{
		for (Layer l : capabilities.getLayerList())
		{
			if (!Util.isEmptyString(l.getName()) && l.getName().equalsIgnoreCase(name))
			{
				return l;
			}
		}
		return null;
	}
	
}
