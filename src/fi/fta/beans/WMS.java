package fi.fta.beans;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import fi.fta.beans.ui.WMSUI;

@Entity
@Table(name="wmses")
public class WMS extends CategoryBean implements Named
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 5013510611635706115L;
	
	protected String name;
	
	protected String url;
	
	@Column(name = "meta_data_url")
	protected String metaDataUrl;
	
	protected String view;
	
	protected String download;
	
	@Column(name = "catalogue_meta_id")
	protected String catalogueMetaId;
	
	@ManyToOne(targetEntity=Category.class, cascade={CascadeType.PERSIST, CascadeType.MERGE}, fetch=FetchType.EAGER)
	@JoinColumn(name = "parent")
	protected Category parent;
	
	
	public WMS()
	{}
	
	public WMS(WMSUI ui)
	{
		super(ui);
		this.setName(ui.getName());
		this.setUrl(ui.getUrl());
		this.setMetaDataUrl(ui.getMetaDataUrl());
		this.setView(ui.getView());
		this.setDownload(ui.getDownload());
		this.setCatalogueMetaId(ui.getCatalogueMetaId());
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

	public String getMetaDataUrl() {
		return metaDataUrl;
	}

	public void setMetaDataUrl(String metaDataUrl) {
		this.metaDataUrl = metaDataUrl;
	}

	public String getView() {
		return view;
	}

	public void setView(String view) {
		this.view = view;
	}

	public String getDownload() {
		return download;
	}

	public void setDownload(String download) {
		this.download = download;
	}

	public String getCatalogueMetaId() {
		return catalogueMetaId;
	}

	public void setCatalogueMetaId(String catalogueMetaId) {
		this.catalogueMetaId = catalogueMetaId;
	}

	public Category getParent() {
		return parent;
	}

	public void setParent(Category parent) {
		this.parent = parent;
	}
	
}
