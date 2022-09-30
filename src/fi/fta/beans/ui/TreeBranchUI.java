package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.Category;
import fi.fta.utils.BeansUtils;

public class TreeBranchUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 8280196459726504709L;
	
	
	private Integer position;

	private String label;
	
	private String helcomMetadata;
	
	private String downloadUrl;
	
	private List<MetaDataUI> metadata;
	
	private String description;
	
	private String tags;
	
	
	public TreeBranchUI()
	{}
	
	public TreeBranchUI(Category c)
	{
		super(c);
		this.setPosition(c.getPosition());
		this.setLabel(c.getLabel());
		this.setHelcomMetadata(c.getHelcomMetadata());
		this.setDownloadUrl(c.getDownloadUrl());
		this.setMetadata(BeansUtils.getMetaDataUI(c.getMetadata()));
		this.setDescription(c.getDescription());
		this.setTags(c.getTags());
	}
	
	public Integer getPosition() {
		return position;
	}

	public void setPosition(Integer position) {
		this.position = position;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public String getHelcomMetadata() {
		return helcomMetadata;
	}

	public void setHelcomMetadata(String helcomMetadata) {
		this.helcomMetadata = helcomMetadata;
	}

	public String getDownloadUrl() {
		return downloadUrl;
	}

	public void setDownloadUrl(String downloadUrl) {
		this.downloadUrl = downloadUrl;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getTags() {
		return tags;
	}

	public void setTags(String tags) {
		this.tags = tags;
	}

	public List<MetaDataUI> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetaDataUI> metadata) {
		this.metadata = metadata;
	}
	
}
