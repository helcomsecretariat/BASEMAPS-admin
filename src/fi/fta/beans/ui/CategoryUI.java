package fi.fta.beans.ui;

import java.util.List;

import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.Category;
import fi.fta.utils.BeansUtils;

public class CategoryUI extends CategoryBeanUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -8948280269829644624L;
	
	@NotBlank(message = "msg.validation.required")
	private String label;

	protected List<MetaDataUI> metaData;
	
	
	public CategoryUI()
	{
		super();
	}
	
	public CategoryUI(Category bean)
	{
		super(bean);
		this.setLabel(bean.getLabel());
		this.setParent(bean.getParent() != null ? bean.getParent().getId() : null);
		this.setMetaData(BeansUtils.getMetaDataUI(bean.getMetadata()));
	}
	
	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public List<MetaDataUI> getMetaData() {
		return metaData;
	}

	public void setMetaData(List<MetaDataUI> metaData) {
		this.metaData = metaData;
	}
	
}
