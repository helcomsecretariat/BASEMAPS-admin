package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.UrlFacade;
import fi.fta.beans.WMS;
import fi.fta.utils.BeansUtils;

public class WMSUI extends CategoryUI implements UrlFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -968759793549553472L;
	

	protected String name;
	
	protected String url;
	
	protected List<WMSMetaDataUI> metaData;
	
	
	public WMSUI()
	{}
	
	public WMSUI(WMS bean)
	{
		super(bean);
		this.setParent(bean.getParent() != null ? bean.getParent().getId() : null);
		this.setName(bean.getName());
		this.setUrl(bean.getUrl());
		this.setMetaData(BeansUtils.getMetaDataUI(bean.getMetadata()));
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public List<WMSMetaDataUI> getMetaData() {
		return metaData;
	}

	public void setMetaData(List<WMSMetaDataUI> metaData) {
		this.metaData = metaData;
	}
	
}
