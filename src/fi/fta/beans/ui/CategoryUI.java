package fi.fta.beans.ui;

import java.util.List;

import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.Category;
import fi.fta.utils.BeansUtils;

public class CategoryUI extends CategoryBeanUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -8948280269829644624L;

	@NotBlank(message = "msg.validation.required")
	private String label;
	
	private String downloadUrl;
	
	protected List<MetaDataUI> metaData;

	private String helcomMetadata;
	private String description;
	private String tags;
	
	
	public CategoryUI()
	{
		super();
	}
	
	public CategoryUI(Category bean)
	{
		super(bean);
		this.setLabel(bean.getLabel());
		this.setDownloadUrl(bean.getDownloadUrl());
		this.setParent(bean.getParent() != null ? bean.getParent().getId() : null);
		this.setMetaData(BeansUtils.getMetaDataUI(bean.getMetadata()));
		this.setHelcomMetadata(bean.getHelcomMetadata());
		this.setDescription(bean.getDescription());
		this.setTags(bean.getTags());
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
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

	public List<MetaDataUI> getMetaData() {
		return metaData;
	}

	public void setMetaData(List<MetaDataUI> metaData) {
		this.metaData = metaData;
	}

	public String getHelcomMetadata() {
		return helcomMetadata;
	}

	public void setHelcomMetadata(String helcomMetadata) {
		this.helcomMetadata = helcomMetadata;
	}
	
}
