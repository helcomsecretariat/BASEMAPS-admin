package fi.fta.beans.ui;

import fi.fta.beans.CategoryBean;

public class TreeBranchUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 8280196459726504709L;
	
	
	private Integer position;
	
	
	public TreeBranchUI()
	{}
	
	public TreeBranchUI(CategoryBean c)
	{
		super(c);
		this.setPosition(c.getPosition());
	}
	
	public Integer getPosition() {
		return position;
	}

	public void setPosition(Integer position) {
		this.position = position;
	}
	
}
