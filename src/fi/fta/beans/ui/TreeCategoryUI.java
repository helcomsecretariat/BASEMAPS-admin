package fi.fta.beans.ui;

import java.util.ArrayList;
import java.util.List;

import fi.fta.beans.Category;

public class TreeCategoryUI extends TreeBranchUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -7278925183115158510L;

	private boolean category;
	
	private List<TreeBranchUI> layers;
	
	
	public TreeCategoryUI()
	{}
	
	public TreeCategoryUI(Category c)
	{
		super(c);
		this.setCategory(!c.getChildren().isEmpty() || c.getMetadata().isEmpty());
		this.setLayers(new ArrayList<>());
	}
	
	public boolean isCategory() {
		return category;
	}
	
	public void setCategory(boolean category) {
		this.category = category;
	}

	public List<TreeBranchUI> getLayers() {
		return layers;
	}
	
	public void setLayers(List<TreeBranchUI> layers) {
		this.layers = layers;
	}
	
}
