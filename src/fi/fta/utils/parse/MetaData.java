package fi.fta.utils.parse;

import org.dom4j.Element;

import fi.fta.beans.UrlFacade;

public class MetaData extends XmlBean<WMSMetaDataSpecification> implements UrlFacade
{
	
	private String format;
	
	private String url;
	
	
	public MetaData(Element root, WMSMetaDataSpecification specification)
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
	
	public void fromElement(Element root, WMSMetaDataSpecification specification)
	{
		this.setFormat(root.elementText(specification.getMetaDataFormat()));
		this.setUrl(root.element(specification.getOnlineResource()).attributeValue(specification.getHref()));
	}
	
}
