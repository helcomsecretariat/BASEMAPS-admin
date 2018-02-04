package fi.fta.utils.parse.wms;

import org.dom4j.Element;

public interface LayerSpecification extends MetaDataSpecification, StyleSpecification
{
	
	public String getPathLayer();
	public String getLayer();
	public String getQueryable();
	public String getPathKeywords();
	public String getSrs();
	public String getScaleMin();
	public Double retrieveScaleMin(Element e);
	public String getScaleMax();
	public Double retrieveScaleMax(Element e);
	
}
