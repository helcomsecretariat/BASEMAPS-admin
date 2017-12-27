package fi.fta.beans.ui;

import org.hibernate.validator.constraints.NotBlank;

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
