package fi.fta.utils.parse.wfs;

import fi.fta.utils.parse.MetaDataSpecification;
import fi.fta.utils.parse.NamedTitledSpecification;

public interface FeatureTypeSpecification extends MetaDataSpecification, NamedTitledSpecification
{
	
	public String getAbstract();
	public String getPathKeywords();
	public String getDefaultCrs();
	public String getOtherCrs();
	public String getOtherSrs();
	public String getPathOutputFormat();
	public String getPathLowerCorner();
	public String getPathUpperCorner();
	
}
