package fi.fta.beans;

import java.io.Serializable;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;

import org.hibernate.annotations.Type;

@MappedSuperclass
public class ServiceLayerBean implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 9189691401731093171L;
	
	
	private String version;
	
	private String organisation;
	
	private String title;
	
	@Column(columnDefinition="character varying(50)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> keywords;
	
	@Column(columnDefinition="character varying(20)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> formats;
	
	@Column(columnDefinition="character varying(20)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> crs;
	
	private String description;
	
	@Column(columnDefinition="character varying(3)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> languages;
	
	private String fees;
	
	@Column(name = "access_constraints")
	private String accessConstraints;
	
	
	public ServiceLayerBean()
	{}
	
	public ServiceLayerBean(ServiceLayerBean layer)
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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<String> getLanguages() {
		return languages;
	}

	public void setLanguages(List<String> languages) {
		this.languages = languages;
	}

	public String getFees() {
		return fees;
	}

	public void setFees(String fees) {
		this.fees = fees;
	}

	public String getAccessConstraints() {
		return accessConstraints;
	}

	public void setAccessConstraints(String accessConstraints) {
		this.accessConstraints = accessConstraints;
	}

	public void copy(ServiceLayerBean from)
	{
		this.setVersion(from.getVersion());
		this.setOrganisation(from.getOrganisation());
		this.setTitle(from.getTitle());
		this.setKeywords(from.getKeywords());
		this.setFormats(from.getFormats());
		this.setCrs(from.getCrs());
		this.setDescription(from.getDescription());
		this.setFees(from.getFees());
		this.setAccessConstraints(from.getAccessConstraints());
	}
	
}
