package fi.fta.utils.parse.wfs;

/**
 * Version description for parsing WFS
 * 
 * @author andrysta
 *
 */
public interface Specification extends FeatureInfoSpecification, FeatureTypeSpecification
{
	
	public String getRootName();
	public String getVersion();
	public String getPathFeatureType();
	
}
