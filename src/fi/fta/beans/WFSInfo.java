package fi.fta.beans;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

public class WFSInfo implements Serializable
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 6887803585674705753L;
	
	@Id
	private Long parent;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false)
	private Date updated;
	
	
	public WFSInfo()
	{}

	public Long getParent() {
		return parent;
	}

	public void setParent(Long parent) {
		this.parent = parent;
	}

	public Date getUpdated() {
		return updated;
	}

	public void setUpdated(Date updated) {
		this.updated = updated;
	}
	
}
