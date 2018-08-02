package fi.fta.utils.parse.wfs;

import org.dom4j.Element;

import fi.fta.utils.Util;
import fi.fta.utils.parse.MetaDataSpecification;

public class MetaData extends fi.fta.utils.parse.MetaData
{
		
	public MetaData(Element root, MetaDataSpecification specification)
	{
		super(root, specification);
	}
	
	public void fromElement(Element root, MetaDataSpecification specification)
	{
		if (!Util.isEmptyString(root.getStringValue()))
		{
			this.setUrl(root.getStringValue());
		}
		if (!Util.isEmptyString(root.attributeValue(specification.getHref())))
		{
			this.setUrl(root.attributeValue(specification.getHref()));
		}
		if (!Util.isEmptyString(root.attributeValue(specification.getMetaDataFormat())))
		{
			this.setFormat(root.attributeValue(specification.getMetaDataFormat()));
		}
	}
	
}
