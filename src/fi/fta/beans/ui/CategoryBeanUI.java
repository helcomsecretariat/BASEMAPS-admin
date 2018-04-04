package fi.fta.beans.ui;

import fi.fta.beans.CategoryBean;

public class CategoryBeanUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -857410635322942756L;
	
	private Integer position;
	
	private Long parent;

	
	public CategoryBeanUI()
	{
		super();
	}
	
	public CategoryBeanUI(CategoryBean bean)
	{
		super(bean);
		this.setPosition(bean.getPosition());
	}
	
	public Integer getPosition() {
		return position;
	}

	public void setPosition(Integer position) {
		this.position = position;
	}

	public Long getParent() {
		return parent;
	}

	public void setParent(Long parent) {
		this.parent = parent;
	}
	
}
