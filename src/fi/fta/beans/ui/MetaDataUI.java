package fi.fta.beans.ui;

import fi.fta.beans.MetaData;
import fi.fta.beans.MetaDataFormat;
import fi.fta.beans.MetaDataSource;
import fi.fta.beans.UrlFacade;

public class MetaDataUI extends IdUI implements UrlFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -7115849229969412235L;
	
	
	protected Long parent;
	
	protected MetaDataFormat format;
	
	protected String url;
	
	protected MetaDataSource source;
	
	protected String description;
	
	
	public MetaDataUI()
	{}
	
	public MetaDataUI(MetaData bean)
	{
		super(bean);
		this.setParent(bean.getParent());
		this.setFormat(bean.getFormat());
		this.setUrl(bean.getUrl());
		this.setSource(bean.getSource());
		this.setDescription(bean.getDescription());
	}
	
	public Long getParent() {
		return parent;
	}

	public void setParent(Long parent) {
		this.parent = parent;
	}

	public MetaDataFormat getFormat() {
		return format;
	}

	public void setFormat(MetaDataFormat format) {
		this.format = format;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public MetaDataSource getSource() {
		return source;
	}

	public void setSource(MetaDataSource source) {
		this.source = source;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
}
