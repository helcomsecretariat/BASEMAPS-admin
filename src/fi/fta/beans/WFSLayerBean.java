package fi.fta.beans;

import java.io.Serializable;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;

import org.hibernate.annotations.Type;

@MappedSuperclass
public class WFSLayerBean implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -5360395601594329796L;
	
	
	private String version;
	
	private String provider;
	
	private String title;
	
	@Column(columnDefinition="character varying(50)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> keywords;
	
	@Column(columnDefinition="character varying(50)[]")
	@Type(type="fi.fta.data.dao.PersistentStringListType")
	private List<String> formats;
	
	
	public WFSLayerBean()
	{}
	
	public WFSLayerBean(WFSLayerBean layer)
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

	public String getProvider() {
		return provider;
	}

	public void setProvider(String provider) {
		this.provider = provider;
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

	public void copy(WFSLayerBean from)
	{
		this.setVersion(from.getVersion());
		this.setProvider(from.getProvider());
		this.setTitle(from.getTitle());
		this.setKeywords(from.getKeywords());
		this.setFormats(from.getFormats());
	}
	
}
