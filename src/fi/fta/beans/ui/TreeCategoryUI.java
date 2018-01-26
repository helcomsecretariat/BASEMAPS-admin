package fi.fta.beans.ui;

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
	
	private List<MetaDataUI> metadata;
	
	public TreeCategoryUI()
	{}
	
	public TreeCategoryUI(Category c)
	{
		super(c);
		this.setLabel(c.getLabel());
		this.setCategory(c.getMetadata().isEmpty());
		this.setMetadata(BeansUtils.getMetaDataUI(c.getMetadata()));
	}
	
	public String getLabel() {
		return label;
	}
	
	public void setLabel(String label) {
		this.label = label;
	}

	public List<MetaDataUI> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetaDataUI> metadata) {
		this.metadata = metadata;
	}
	
}
