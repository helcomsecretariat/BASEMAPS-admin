package fi.fta.beans.ui;

import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.Category;
import fi.fta.beans.CategoryBean;

public class CategoryUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -8948280269829644624L;
	
	@NotBlank(message = "msg.validation.required")
	private String label;
	
	private Integer position;
	
	private Long parent;
	
	
	public CategoryUI()
	{}
	
	public CategoryUI(CategoryBean bean)
	{
		this.setId(bean.getId());
		this.setLabel(bean.getLabel());
		this.setPosition(bean.getPosition());
	}
	
	public CategoryUI(Category bean)
	{
		this((CategoryBean)bean);
		this.setParent(bean.getParent() != null ? bean.getParent().getId() : null);
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

	public Long getParent() {
		return parent;
	}

	public void setParent(Long parent) {
		this.parent = parent;
	}
	
}
