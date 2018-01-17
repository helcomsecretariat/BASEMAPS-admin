package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.WMS;
import fi.fta.utils.BeansUtils;

public class TreeWMSLayerUI extends TreeLayerUI
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1812458807754701691L;
	
	private String name;
	
	private String url;
	
	private String version;
	
	private String organisation;
	
	private String title;
	
	private List<String> keywords;
	
	private Boolean queryable;
	
	private List<String> formats;
	
	private List<String> crs;
	
	private Double scaleMin;
	
	private Double scaleMax;
	
	private List<WMSMetaDataUI> metadata;
	
	private List<WMSStyleUI> styles;
	
	
	public TreeWMSLayerUI()
	{}
	
	public TreeWMSLayerUI(WMS wms)
	{
		super(wms);
		this.setName(wms.getName());
		this.setUrl(wms.getUrl());
		if (wms.getInfo() != null)
		{
			this.setVersion(wms.getInfo().getVersion());
			this.setOrganisation(wms.getInfo().getOrganisation());
			this.setTitle(wms.getInfo().getTitle());
			this.setKeywords(wms.getInfo().getKeywords());
			this.setQueryable(wms.getInfo().getQueryable());
			this.setFormats(wms.getInfo().getFormats());
			this.setCrs(wms.getInfo().getCrs());
			this.setScaleMin(wms.getInfo().getScaleMin());
			this.setScaleMax(wms.getInfo().getScaleMax());
			this.setStyles(BeansUtils.getStylesUI(wms.getInfo().getStyles()));
		}
		this.setMetadata(BeansUtils.getMetaDataUI(wms.getMetadata()));
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

	public String getVersion() {
		return version;
	}

	public void setVersion(String version) {
		this.version = version;
	}

	public String getOrganisation() {
		return organisation;
	}

	public void setOrganisation(String organisation) {
		this.organisation = organisation;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public List<String> getKeywords() {
		return keywords;
	}

	public void setKeywords(List<String> keywords) {
		this.keywords = keywords;
	}

	public Boolean getQueryable() {
		return queryable;
	}

	public void setQueryable(Boolean queryable) {
		this.queryable = queryable;
	}

	public List<String> getFormats() {
		return formats;
	}

	public void setFormats(List<String> formats) {
		this.formats = formats;
	}

	public List<String> getCrs() {
		return crs;
	}

	public void setCrs(List<String> crs) {
		this.crs = crs;
	}

	public Double getScaleMin() {
		return scaleMin;
	}

	public void setScaleMin(Double scaleMin) {
		this.scaleMin = scaleMin;
	}

	public Double getScaleMax() {
		return scaleMax;
	}

	public void setScaleMax(Double scaleMax) {
		this.scaleMax = scaleMax;
	}

	public List<WMSMetaDataUI> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<WMSMetaDataUI> metadata) {
		this.metadata = metadata;
	}

	public List<WMSStyleUI> getStyles() {
		return styles;
	}

	public void setStyles(List<WMSStyleUI> styles) {
		this.styles = styles;
	}
	
}
