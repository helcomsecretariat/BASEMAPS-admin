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
	
	
	protected Integer position;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false)
	protected Date created;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false)
	protected Date updated;
	
	
	public CategoryBean()
	{}

	public CategoryBean(CategoryBeanUI ui)
	{
		this();
		this.setId(ui.getId());
		this.setPosition(ui.getPosition() != null ? ui.getPosition() : 1);
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
