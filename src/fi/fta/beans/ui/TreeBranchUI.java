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

	private List<MetaDataUI> metadata;
	
	
	public TreeBranchUI()
	{}
	
	public TreeBranchUI(Category c)
	{
		super(c);
		this.setPosition(c.getPosition());
		this.setLabel(c.getLabel());
		this.setMetadata(BeansUtils.getMetaDataUI(c.getMetadata()));
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

	public List<MetaDataUI> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetaDataUI> metadata) {
		this.metadata = metadata;
	}
	
}
