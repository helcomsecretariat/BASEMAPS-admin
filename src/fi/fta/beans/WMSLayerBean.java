package fi.fta.beans;

import java.io.Serializable;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;

import org.hibernate.annotations.Type;

@MappedSuperclass
public class WMSLayerBean implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -9120144310435460424L;
	

	private String version;
	
	private String organisation;
	
	private String title;
	
	@Column(columnDefinition="character varying(50)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> keywords;
	
	private Boolean queryable;
	
	@Column(columnDefinition="character varying(20)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> formats;
	
	@Column(columnDefinition="character varying(20)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> crs;
	
	@Column(name = "scale_min")
	private Double scaleMin;
	
	@Column(name = "scale_max")
	private Double scaleMax;
	
	@Column(columnDefinition="character varying(3)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> languages;
	
	
	public WMSLayerBean()
	{}
	
	public WMSLayerBean(WMSLayerBean layer)
	{
		this();
		this.copy(layer);
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

	public List<String> getLanguages() {
		return languages;
	}

	public void setLanguages(List<String> languages) {
		this.languages = languages;
	}

	public void copy(WMSLayerBean from)
	{
		this.setVersion(from.getVersion());
		this.setOrganisation(from.getOrganisation());
		this.setTitle(from.getTitle());
		this.setKeywords(from.getKeywords());
		this.setQueryable(from.getQueryable());
		this.setFormats(from.getFormats());
		this.setCrs(from.getCrs());
		this.setScaleMin(from.getScaleMin());
		this.setScaleMax(from.getScaleMax());
		this.setLanguages(from.getLanguages());
	}
	
}
