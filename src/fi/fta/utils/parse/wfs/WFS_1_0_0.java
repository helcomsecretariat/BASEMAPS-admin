package fi.fta.utils.parse.wfs;

public class WFS_1_0_0 implements Specification
{
	
	public String getRootName() {
		return "WFS_Capabilities";
	}
	
	public String getVersion() {
		return "1.0.0";
	}

	public String getPathFeatureType() {
		return "FeatureTypeList/FeatureType";
	}

	public String getPathProvider() {
		return "ServiceProvider/ProviderName";
	}
	
	public String getPathServiceTitle() {
		return "ServiceIdentification/Title";
	}
	
	public String getPathKeywords() {
		return "ServiceIdentification/Keywords/Keyword";
	}
	
	public String getName() {
		return "Name";
	}
	
	public String getTitle() {
		return "Title";
	}
	
	public String getPathOutputFormat() {
		return "OutputFormats/Format";
	}
	
}
