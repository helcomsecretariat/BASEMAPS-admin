package fi.fta.beans.ui;

import java.util.ArrayList;
import java.util.List;

import fi.fta.beans.CategoryBean;

public class TreeBranchUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 8280196459726504709L;
	
	
	private Integer position;
	
	private boolean category;
	
	private List<TreeBranchUI> layers;
	
	
	public TreeBranchUI()
	{}
	
	public TreeBranchUI(CategoryBean c)
	{
		super(c);
		this.setPosition(c.getPosition());
		this.setCategory(false);
		this.setLayers(new ArrayList<>());
	}
	
	public Integer getPosition() {
		return position;
	}

	public void setPosition(Integer position) {
		this.position = position;
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
