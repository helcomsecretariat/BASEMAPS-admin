package fi.fta.beans.ui;

import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.LayerService;
import fi.fta.beans.Named;
import fi.fta.beans.UrlFacade;

public class LayerServiceUI extends CategoryBeanUI implements Named, UrlFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -968759793549553472L;
	

	protected String name;
	
	@NotBlank(message = "msg.validation.required")
	protected String url;
	
	
	public LayerServiceUI()
	{
		super();
	}
	
	public LayerServiceUI(LayerService bean)
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
