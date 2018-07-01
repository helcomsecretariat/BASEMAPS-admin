package fi.fta.utils.parse.wms;

import org.dom4j.Element;

import fi.fta.utils.Util;

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
		return e != null ? Util.getDouble(e.getText(), null) : null;
	}
	
	public String getScaleMax() {
		return "MaxScaleDenominator";
	}
	
	public Double retrieveScaleMax(Element e) {
		return e != null ? Util.getDouble(e.getText(), null) : null;
	}
	
	public String getBoundBox() {
		return "EX_GeographicBoundingBox";
	}
	
	public Double retrieveBoundWest(Element e) {
		return e != null ? Util.getDouble(e.elementText("westBoundLongitude"), null) : null;
	}
	
	public Double retrieveBoundEast(Element e) {
		return e != null ? Util.getDouble(e.elementText("eastBoundLongitude"), null) : null;
	}
	
	public Double retrieveBoundSouth(Element e) {
		return e != null ? Util.getDouble(e.elementText("southBoundLatitude"), null) : null;
	}
	
	public Double retrieveBoundNorth(Element e) {
		return e != null ? Util.getDouble(e.elementText("northBoundLatitude"), null) : null;
	}
	
}
