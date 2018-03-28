package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.Category;
import fi.fta.utils.BeansUtils;

public class CategoryUI extends CategoryBeanUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -8948280269829644624L;
	
	private String downloadUrl;
	
	protected List<MetaDataUI> metaData;
	
	
	public CategoryUI()
	{
		super();
	}
	
	public CategoryUI(Category bean)
	{
		super(bean);
		this.setDownloadUrl(bean.getDownloadUrl());
		this.setParent(bean.getParent() != null ? bean.getParent().getId() : null);
		this.setMetaData(BeansUtils.getMetaDataUI(bean.getMetadata()));
	}
	
	public String getDownloadUrl() {
		return downloadUrl;
	}

	public void setDownloadUrl(String downloadUrl) {
		this.downloadUrl = downloadUrl;
	}

	public List<MetaDataUI> getMetaData() {
		return metaData;
	}

	public void setMetaData(List<MetaDataUI> metaData) {
		this.metaData = metaData;
	}
	
}
