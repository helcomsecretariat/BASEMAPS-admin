package fi.fta.utils.parse;

public interface WMSLayerSpecification extends WMSMetaDataSpecification, WMSStyleSpecification
{
	
	public String getPathLayer();
	public String getLayer();
	public String getQueryable();
	public String getPathKeywords();
	public String getSrs();
	
}
