package fi.fta.beans.ui;

import fi.fta.beans.UrlFacade;
import fi.fta.beans.WMS;

public class WMSUI extends CategoryBeanUI implements UrlFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -968759793549553472L;
	

	protected String name;
	
	protected String url;
	
	
	public WMSUI()
	{
		super();
	}
	
	public WMSUI(WMS bean)
	{
		super(bean);
		this.setParent(bean.getParent());
		this.setName(bean.getName());
		this.setUrl(bean.getUrl());
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
	
}
