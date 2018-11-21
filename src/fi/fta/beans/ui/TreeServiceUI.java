package fi.fta.beans.ui;

import fi.fta.beans.TypedLayerService;

public class TreeServiceUI extends LayerServiceUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -440986218224389529L;
	
	
	private String type;
	
	public TreeServiceUI()
	{
		super();
	}
	
	public TreeServiceUI(TypedLayerService service)
	{
		super(service);
		this.type = service.getType().name();
	}
	
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
	
}
