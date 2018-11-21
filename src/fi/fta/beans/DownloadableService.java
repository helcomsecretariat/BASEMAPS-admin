package fi.fta.beans;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import fi.fta.beans.ui.LayerServiceUI;

@Entity
@DiscriminatorValue(LayerServiceType.Values.DOWNLOAD)
public class DownloadableService extends TypedLayerService
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -4672612710674117837L;
	
	
	public DownloadableService()
	{}
	
	public DownloadableService(LayerServiceUI ui)
	{
		super(ui);
	}
	
	public LayerServiceType getType()
	{
		return LayerServiceType.DOWNLOAD;
	}
	
}
