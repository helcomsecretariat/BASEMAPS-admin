package fi.fta.utils.parse;

public interface WMSSpecification extends WMSFeatureInfoSpecification, WMSLayerSpecification
{
	
	public String getRootName();
	public String getVersion();
	
}
