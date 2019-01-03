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
	
	/**
	 * Queue position in the list of siblings of parent category
	 */
	protected Integer position;
	
	/**
	 * Create time
	 */
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false, updatable=false)
	protected Date created;
	
	/**
	 * Last update time
	 */
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false)
	protected Date updated;
	
	
	public CategoryBean()
	{
		super();
	}

	public CategoryBean(CategoryBeanUI ui)
	{
		super(ui.getId());
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
