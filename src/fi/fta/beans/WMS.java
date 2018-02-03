package fi.fta.beans;

import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.OneToOne;
import javax.persistence.PrimaryKeyJoinColumn;

import fi.fta.beans.ui.LayerServiceUI;

@Entity
@DiscriminatorValue(LayerServiceType.Values.WMS)
public class WMS extends LayerService
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 5013510611635706115L;

	@OneToOne(targetEntity=WMSInfo.class, cascade={CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	@PrimaryKeyJoinColumn
	protected WMSInfo info;
	
	
	public WMS()
	{}
	
	public WMS(LayerServiceUI ui)
	{
		super(ui);
	}
	
	public WMSInfo getInfo() {
		return info;
	}

	public void setInfo(WMSInfo info) {
		this.info = info;
	}
	
}
