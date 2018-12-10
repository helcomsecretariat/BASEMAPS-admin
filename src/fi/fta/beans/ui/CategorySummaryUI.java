package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.Category;

public class CategorySummaryUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -1865150182643880986L;
	
	
	private String label;
	
	private CategoryCountsUI counts;
	
	private List<CategorySummaryUI> children;
	
	
	public CategorySummaryUI()
	{}
	
	public CategorySummaryUI(Category c)
	{
		super(c);
		this.label = c.getLabel();
	}
	
	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public CategoryCountsUI getCounts() {
		return counts;
	}

	public void setCounts(CategoryCountsUI counts) {
		this.counts = counts;
	}

	public List<CategorySummaryUI> getChildren() {
		return children;
	}

	public void setChildren(List<CategorySummaryUI> children) {
		this.children = children;
	}
	
}
