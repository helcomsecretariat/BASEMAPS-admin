package fi.fta.utils.parse.wfs;

public interface Specification extends FeatureInfoSpecification, FeatureTypeSpecification
{
	
	public String getRootName();
	public String getVersion();
	public String getPathFeatureType();
	
}
