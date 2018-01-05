package fi.fta.beans.ui;

import java.io.Serializable;
import java.util.List;

public class WMSInfoUI implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7633006930814896400L;
	
	
	private String version;
	
	private String organisation;
	
	private List<String> languages;
	
	private String title;
	
	private List<String> keywords;
	
	private String metadataFormat;
	
	private String metadataUrl;
	
	
	public WMSInfoUI()
	{}

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

	public List<String> getLanguages() {
		return languages;
	}

	public void setLanguages(List<String> languages) {
		this.languages = languages;
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

	public String getMetadataFormat() {
		return metadataFormat;
	}

	public void setMetadataFormat(String metadataFormat) {
		this.metadataFormat = metadataFormat;
	}

	public String getMetadataUrl() {
		return metadataUrl;
	}

	public void setMetadataUrl(String metadataUrl) {
		this.metadataUrl = metadataUrl;
	}
	
}
