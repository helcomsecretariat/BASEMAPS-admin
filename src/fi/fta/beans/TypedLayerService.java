package fi.fta.beans;

import javax.persistence.MappedSuperclass;

import fi.fta.beans.ui.LayerServiceUI;

@MappedSuperclass
public abstract class TypedLayerService extends LayerService
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -7547831672845424603L;
	
	
	public TypedLayerService()
	{}
	
	public TypedLayerService(LayerServiceUI ui)
	{
		super(ui);
	}
	
	public abstract LayerServiceType getType();
	
}
