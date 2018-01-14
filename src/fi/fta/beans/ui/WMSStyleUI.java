package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.WMSStyle;

public class WMSStyleUI extends IdUI
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -7631775486909918729L;
	

	protected Long parent;
	
	protected String name;
	
	protected List<String> urls;

	protected Boolean main;
	
	
	public WMSStyleUI()
	{}
	
	public WMSStyleUI(WMSStyle bean)
	{
		super(bean);
		this.setParent(bean.getParent());
		this.setName(bean.getName());
		this.setUrls(bean.getUrls());
		this.setMain(bean.getMain());
	}
	
	public Long getParent() {
		return parent;
	}

	public void setParent(Long parent) {
		this.parent = parent;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public List<String> getUrls() {
		return urls;
	}

	public void setUrls(List<String> urls) {
		this.urls = urls;
	}

	public Boolean getMain() {
		return main;
	}

	public void setMain(Boolean main) {
		this.main = main;
	}
	
}
