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
	public String getDescription();
	public String getBoundBox();
	public Double retrieveBoundWest(Element e);
	public Double retrieveBoundEast(Element e);
	public Double retrieveBoundSouth(Element e);
	public Double retrieveBoundNorth(Element e);
	
}
