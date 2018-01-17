package fi.fta.beans;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.OrderBy;
import javax.persistence.PrimaryKeyJoinColumn;
import javax.persistence.Table;

import fi.fta.beans.ui.WMSMetaDataUI;
import fi.fta.beans.ui.WMSUI;
import fi.fta.utils.Util;

@Entity
@Table(name="wmses")
public class WMS extends CategoryBean implements Named, UrlFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 5013510611635706115L;
	
	protected String name;
	
	protected String url;
	
	@OneToOne(targetEntity=WMSInfo.class, cascade={CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	@PrimaryKeyJoinColumn
	protected WMSInfo info;
	
	protected Long parent;
	
	@OneToMany(targetEntity=WMSMetaData.class, cascade={CascadeType.ALL}, fetch=FetchType.EAGER)
	@JoinColumn(name = "parent", nullable = false, updatable = false, insertable = true)
	@OrderBy("id")
	protected Set<WMSMetaData> metadata;
	
	
	public WMS()
	{}
	
	public WMS(WMSUI ui)
	{
		super(ui);
		this.setName(ui.getName());
		this.setUrl(ui.getUrl());
		this.setMetadata(new HashSet<>());
		if (!Util.isEmptyCollection(ui.getMetaData()))
		{
			for (WMSMetaDataUI wui : ui.getMetaData())
			{
				if (!Util.isEmptyString(wui.getUrl()))
				{
					this.getMetadata().add(new WMSMetaData(wui));
				}
			}
		}
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

	public Long getParent() {
		return parent;
	}

	public void setParent(Long parent) {
		this.parent = parent;
	}

	public Set<WMSMetaData> getMetadata() {
		return metadata;
	}

	public void setMetadata(Set<WMSMetaData> metadata) {
		this.metadata = metadata;
	}
	
}
