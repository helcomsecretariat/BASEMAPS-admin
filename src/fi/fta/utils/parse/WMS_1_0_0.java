package fi.fta.utils.parse;

public class WMS_1_0_0 implements WMSSpecification
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
		return "Capability/ExtendedCapabilities/SupportedLanguages";
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
