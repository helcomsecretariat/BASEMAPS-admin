package fi.fta.utils.parse.wfs;

public class WFS_1_0_0 implements Specification
{
	
	public String getRootName() {
		return "WFS_Capabilities";
	}
	
	public String getVersion() {
		return "1.0.0";
	}
	
	public String getPathProvider() {
		return "ServiceProvider/ProviderName";
	}

	public String getServiceIdentification() {
		return "Service";
	}

	public String getPathKeywords() {
		return "Keywords/Keyword";
	}
	
	public String getAbstract() {
		return "Abstract";
	}
	
	public String getFees() {
		return "Fees";
	}
	
	public String getAccessConstraints() {
		return "AccessConstraints";
	}
	
	public String getPathOperation() {
		return "OperationsMetadata/Operation";
	}
	
	public String getFeatureOperationName() {
		return "GetFeature";
	}
	
	public String getFeatureOutputFormat() {
		return "outputFormat";
	}
	
	public String getParameter() {
		return "Parameter";
	}
	
	public String getPathAllowedValue() {
		return "AllowedValues/Value";
	}
	
	public String getPathExtendedCapabilities() {
		return "OperationsMetadata/ExtendedCapabilities/ExtendedCapabilities";
	}
	
	public String getSupportedLanguages() {
		return "SupportedLanguages";
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
	
	public String getPathExtendedMetadataUrl() {
		return "MetadataUrl/URL";
	}
	
	public String getPathFeatureType() {
		return "FeatureTypeList/FeatureType";
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
	
	public String getDefaultCrs() {
		return "DefaultCRS";
	}
	
	public String getOtherCrs() {
		return "OtherCRS";
	}
	
	public String getOtherSrs() {
		return "SRS";
	}
	
	public String getPathLowerCorner() {
		return "WGS84BoundingBox/LowerCorner";
	}
	
	public String getPathUpperCorner() {
		return "WGS84BoundingBox/UpperCorner";
	}
	
	public String getMetadataUrl() {
		return "MetadataURL";
	}
	
}
