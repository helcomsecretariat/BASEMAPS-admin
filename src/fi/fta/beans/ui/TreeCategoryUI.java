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

	private String label;

	private boolean category;
	
	private List<MetaDataUI> metadata;

	private List<TreeBranchUI> layers;
	
	
	public TreeCategoryUI()
	{}
	
	public TreeCategoryUI(Category c)
	{
		super(c);
		this.setLabel(c.getLabel());
		this.setCategory(!c.getChildren().isEmpty() || c.getMetadata().isEmpty());
		this.setMetadata(BeansUtils.getMetaDataUI(c.getMetadata()));
		this.setLayers(new ArrayList<>());
	}
	
	public String getLabel() {
		return label;
	}
	
	public void setLabel(String label) {
		this.label = label;
	}

	public boolean isCategory() {
		return category;
	}
	
	public void setCategory(boolean category) {
		this.category = category;
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
