package fi.fta.beans.ui;

import java.util.ArrayList;
import java.util.List;

import fi.fta.beans.CategoryBean;

public class TreeLayerUI extends IdUI
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 8280196459726504709L;
	
	
	private String label;
	
	private Integer position;
	
	private boolean category;
	
	private List<TreeLayerUI> layers;
	
	
	public TreeLayerUI()
	{}
	
	public TreeLayerUI(CategoryBean c)
	{
		super(c);
		this.setLabel(c.getLabel());
		this.setPosition(c.getPosition());
		this.setCategory(false);
		this.setLayers(new ArrayList<>());
	}
	
	public String getLabel() {
		return label;
	}
	
	public void setLabel(String label) {
		this.label = label;
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
	
	public List<TreeLayerUI> getLayers() {
		return layers;
	}
	
	public void setLayers(List<TreeLayerUI> layers) {
		this.layers = layers;
	}
	
}
