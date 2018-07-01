package fi.fta.utils.parse.wms;

import org.dom4j.Element;

import fi.fta.utils.Util;

public class WMS_1_0_0 implements Specification
{
	
	public String getRootName() {
		return "WMT_MS_Capabilities";
	}
	
	public String getVersion() {
		return "1.0.0";
	}
	
	public String getPathOrganisation() {
		return "Service/ContactInformation/ContactPersonPrimary/ContactOrganization";
	}
	
	public String getPathFormat() {
		return "Capability/Request/GetFeatureInfo/Format";
	}
	
	public String getPathSupportedLanguages() {
		return "Capability/VendorSpecificCapabilities/ExtendedCapabilities/SupportedLanguages";
	}
	
	public String getPathDefaultLanguage() {
		return "DefaultLanguage/Language";
	}
	
	public String getSupportedLanguage() {
		return "SupportedLanguage";
	}
	
	public String getLanguage() {
		return "Language";
	}
	
	public String getPathFees() {
		return "Service/Fees";
	}
	
	public String getPathAccessConstraints() {
		return "Service/AccessConstraints";
	}
	
	public String getPathLayer() {
		return "Capability/Layer";
	}
	
	public String getLayer() {
		return "Layer";
	}
	
	public String getQueryable() {
		return "queryable";
	}
	
	public String getName() {
		return "Name";
	}
	
	public String getTitle() {
		return "Title";
	}
	
	public String getPathKeywords() {
		return "KeywordList/Keyword";
	}
	
	public String getSrs() {
		return "SRS";
	}
	
	public String getScaleMin() {
		return "ScaleHint";
	}
	
	public Double retrieveScaleMin(Element e) {
		return e != null ? Util.getDouble(e.attributeValue("min"), null) : null;
	}
	
	public String getScaleMax() {
		return "ScaleHint";
	}
	
	public Double retrieveScaleMax(Element e) {
		return e != null ? Util.getDouble(e.attributeValue("max"), null) : null;
	}
	
	public String getDescription() {
		return "Abstract";
	}
	
	public String getBoundBox() {
		return "LatLonBoundingBox";
	}
	
	public Double retrieveBoundWest(Element e) {
		return e != null ? Util.getDouble(e.attributeValue("minx"), null) : null;
	}
	
	public Double retrieveBoundEast(Element e) {
		return e != null ? Util.getDouble(e.attributeValue("maxx"), null) : null;
	}
	
	public Double retrieveBoundSouth(Element e) {
		return e != null ? Util.getDouble(e.attributeValue("miny"), null) : null;
	}
	
	public Double retrieveBoundNorth(Element e) {
		return e != null ? Util.getDouble(e.attributeValue("maxy"), null) : null;
	}
	
	public String getOnlineResource() {
		return "OnlineResource";
	}
	
	public String getHref() {
		return "href";
	}
	
	public String getMetaDataURL() {
		return "MetadataURL";
	}
	
	public String getMetaDataFormat() {
		return "Format";
	}
	
	public String getStyle() {
		return "Style";
	}
	
	public String getLegendURL() {
		return "LegendURL";
	}
	
}
