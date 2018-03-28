package fi.fta.beans.ui;

import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.CategoryBean;

public class CategoryBeanUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -857410635322942756L;
	
	@NotBlank(message = "msg.validation.required")
	private String label;
	
	private Integer position;
	
	private Long parent;

	private String helcomMetadata;
	
	
	public CategoryBeanUI()
	{
		super();
	}
	
	public CategoryBeanUI(CategoryBean bean)
	{
		super(bean);
		this.setLabel(bean.getLabel());
		this.setPosition(bean.getPosition());
		this.setHelcomMetadata(bean.getHelcomMetadata());
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

	public String getHelcomMetadata() {
		return helcomMetadata;
	}

	public void setHelcomMetadata(String helcomMetadata) {
		this.helcomMetadata = helcomMetadata;
	}
	
}
