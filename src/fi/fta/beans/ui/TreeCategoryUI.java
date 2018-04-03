package fi.fta.beans.ui;

import java.util.ArrayList;
import java.util.List;

import fi.fta.beans.Category;
import fi.fta.utils.BeansUtils;

public class TreeCategoryUI extends TreeBranchUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -7278925183115158510L;

	private boolean category;

	private String label;
	
	private String helcomMetadata;
	
	private String downloadUrl;
	
	private List<MetaDataUI> metadata;
	
	private List<TreeBranchUI> layers;
	
	
	public TreeCategoryUI()
	{}
	
	public TreeCategoryUI(Category c)
	{
		super(c);
		this.setCategory(!c.getChildren().isEmpty() || c.getMetadata().isEmpty());
		this.setLabel(c.getLabel());
		this.setHelcomMetadata(c.getHelcomMetadata());
		this.setDownloadUrl(c.getDownloadUrl());
		this.setMetadata(BeansUtils.getMetaDataUI(c.getMetadata()));
		this.setLayers(new ArrayList<>());
	}
	
	public boolean isCategory() {
		return category;
	}
	
	public void setCategory(boolean category) {
		this.category = category;
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

	public List<MetaDataUI> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetaDataUI> metadata) {
		this.metadata = metadata;
	}
	
	public List<TreeBranchUI> getLayers() {
		return layers;
	}
	
	public void setLayers(List<TreeBranchUI> layers) {
		this.layers = layers;
	}
	
}
