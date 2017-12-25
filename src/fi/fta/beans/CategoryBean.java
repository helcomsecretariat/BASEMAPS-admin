package fi.fta.beans;

import java.util.Date;

import javax.persistence.MappedSuperclass;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import fi.fta.beans.ui.CategoryUI;

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
	protected Date created;
	
	@Temporal(TemporalType.TIMESTAMP)
	protected Date updated;
	
	
	public CategoryBean()
	{}

	public CategoryBean(CategoryUI ui)
	{
		this();
		this.setId(ui.getId());
		this.setLabel(ui.getLabel());
		this.setPosition(ui.getPosition());
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
	
}
