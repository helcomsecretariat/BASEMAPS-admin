package fi.fta.utils.parse.wms;

import org.dom4j.Element;

import fi.fta.utils.parse.MetaDataSpecification;

public class MetaData extends fi.fta.utils.parse.MetaData
{
	
	public MetaData(Element root, MetaDataSpecification specification)
	{
		super(root, specification);
	}
	
	public void fromElement(Element root, MetaDataSpecification specification)
	{
		this.setFormat(root.elementText(specification.getMetaDataFormat()));
		this.setUrl(root.element(specification.getOnlineResource()).attributeValue(specification.getHref()));
	}
	
}
