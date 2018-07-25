package fi.fta.beans;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name="wfs_infos")
public class WFSInfo extends WFSLayerBean
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
