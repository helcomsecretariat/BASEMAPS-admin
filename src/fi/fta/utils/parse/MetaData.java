package fi.fta.utils.parse;

import org.dom4j.Element;

import fi.fta.beans.UrlFacade;

public abstract class MetaData extends XmlBean<MetaDataSpecification> implements UrlFacade
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
	
}
