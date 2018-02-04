package fi.fta.utils.parse.wms;

import org.dom4j.Element;

import fi.fta.beans.UrlFacade;
import fi.fta.utils.parse.XmlBean;

public class MetaData extends XmlBean<MetaDataSpecification> implements UrlFacade
{
	
	private String format;
	
	private String url;
	
	
	public MetaData(Element root, MetaDataSpecification specification)
	{
		super(root, specification);
	}

	public String getFormat() {
		return format;
	}

	public void setFormat(String format) {
		this.format = format;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}
	
	public void fromElement(Element root, MetaDataSpecification specification)
	{
		this.setFormat(root.elementText(specification.getMetaDataFormat()));
		this.setUrl(root.element(specification.getOnlineResource()).attributeValue(specification.getHref()));
	}
	
}
