package fi.fta.utils.parse.wms;

/**
 * Version description for parsing WMS
 * 
 * @author andrysta
 *
 */
public interface Specification extends FeatureInfoSpecification, LayerSpecification
{
	
	public String getRootName();
	public String getVersion();
	
}
