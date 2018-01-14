package fi.fta.beans;

import java.util.Date;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name="wms_infos")
public class WMSInfo extends WMSLayerBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 8823591344167060228L;
	
	
	@Id
	private Long parent;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false)
	private Date updated;
	
	@OneToMany(targetEntity=WMSStyle.class, cascade={CascadeType.ALL}, fetch=FetchType.EAGER)
	@JoinColumn(name = "parent", nullable = false, updatable = false, insertable = true)
	@OrderBy("id")
	private Set<WMSStyle> styles;
	
	
	public WMSInfo()
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

	public Set<WMSStyle> getStyles() {
		return styles;
	}

	public void setStyles(Set<WMSStyle> styles) {
		this.styles = styles;
	}
	
}
