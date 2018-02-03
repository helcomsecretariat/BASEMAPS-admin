package fi.fta.beans;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import fi.fta.beans.ui.LayerServiceUI;


@Entity
@DiscriminatorValue(LayerServiceType.Values.WFS)
public class WFS extends LayerService
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 8813064476364353015L;
	
	//@OneToOne(targetEntity=WFSInfo.class, cascade={CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.REMOVE}, fetch=FetchType.EAGER)
	//@PrimaryKeyJoinColumn
	protected WFSInfo info;
	
	
	public WFS()
	{}
	
	public WFS(LayerServiceUI ui)
	{
		super(ui);
	}

	public WFSInfo getInfo() {
		return info;
	}

	public void setInfo(WFSInfo info) {
		this.info = info;
	}
	
}
