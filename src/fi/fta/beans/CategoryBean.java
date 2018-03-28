package fi.fta.beans;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import fi.fta.beans.ui.CategoryBeanUI;

@MappedSuperclass
public class CategoryBean extends IdBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 2794539619136248979L;
	

	protected String label;
	
	protected Integer position;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false, updatable=false)
	protected Date created;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false)
	protected Date updated;

	@Column(name = "helcom_metadata")
	protected String helcomMetadata;
	
	
	public CategoryBean()
	{}

	public CategoryBean(CategoryBeanUI ui)
	{
		this();
		this.setId(ui.getId());
		this.setLabel(ui.getLabel());
		this.setPosition(ui.getPosition() != null ? ui.getPosition() : 1);
		this.setHelcomMetadata(ui.getHelcomMetadata());
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

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public Date getUpdated() {
		return updated;
	}

	public void setUpdated(Date updated) {
		this.updated = updated;
	}

	public String getHelcomMetadata() {
		return helcomMetadata;
	}

	public void setHelcomMetadata(String helcomMetadata) {
		this.helcomMetadata = helcomMetadata;
	}
	
}
