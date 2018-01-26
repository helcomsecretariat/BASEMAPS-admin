package fi.fta.beans;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;

import fi.fta.beans.ui.WMSUI;

@Entity
@Table(name="wmses")
public class WMS extends CategoryBean implements Named, UrlFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 5013510611635706115L;

	protected Long parent;
	
	protected String name;
	
	protected String url;
	
	@OneToOne(targetEntity=WMSInfo.class, cascade={CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	@PrimaryKeyJoinColumn
	protected WMSInfo info;
	
	
	public WMS()
	{}
	
	public WMS(WMSUI ui)
	{
		super(ui);
		this.setParent(ui.getParent());
		this.setName(ui.getName());
		this.setUrl(ui.getUrl());
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

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public WMSInfo getInfo() {
		return info;
	}

	public void setInfo(WMSInfo info) {
		this.info = info;
	}
	
}
