package fi.fta.utils.parse.wms;

import org.dom4j.Element;

public class WMS_1_3_0 extends WMS_1_1_1
{
	
	public String getRootName()
	{
		return "WMS_Capabilities";
	}
	
	public String getVersion()
	{
		return "1.3.0";
	}
	
	public String getPathSupportedLanguages() {
		return "Capability/ExtendedCapabilities/SupportedLanguages";
	}
	
	public String getSrs() {
		return "CRS";
	}

	public String getScaleMin() {
		return "MinScaleDenominator";
	}
	
	public Double retrieveScaleMin(Element e) {
		try
		{
			return e!= null ? new Double(e.getText()) : null;
		}
		catch (NumberFormatException ex)
		{
			return null;
		}
	}
	
	public String getScaleMax() {
		return "MaxScaleDenominator";
	}
	
	public Double retrieveScaleMax(Element e) {
		try
		{
			return e != null ? new Double(e.getText()) : null;
		}
		catch (NumberFormatException ex)
		{
			return null;
		}
	}
	
}
