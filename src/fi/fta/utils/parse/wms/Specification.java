package fi.fta.utils.parse.wms;

public interface Specification extends FeatureInfoSpecification, LayerSpecification
{
	
	public String getRootName();
	public String getVersion();
	
}
