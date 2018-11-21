package fi.fta.beans;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

import fi.fta.beans.ui.LayerServiceUI;

@Entity
@DiscriminatorValue(LayerServiceType.Values.ARCGIS)
public class ArcGISService extends TypedLayerService
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 2128988316984867581L;
	
	
	public ArcGISService()
	{}
	
	public ArcGISService(LayerServiceUI ui)
	{
		super(ui);
	}
	
	public LayerServiceType getType()
	{
		return LayerServiceType.ARCGIS;
	}
	
}
