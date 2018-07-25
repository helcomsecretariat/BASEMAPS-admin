package fi.fta.beans.ui;

import fi.fta.beans.WFS;
import fi.fta.beans.WFSLayerBean;

public class TreeWFSLayerUI extends LayerServiceUI
{

	
	/**
	 * 
	 */
	private static final long serialVersionUID = 6334382420148033834L;

	private WFSLayerBean info;
	
	
	public TreeWFSLayerUI()
	{
		super();
	}
	
	public TreeWFSLayerUI(WFS wfs)
	{
		super(wfs);
		if (wfs.getInfo() != null)
		{
			this.setInfo(new WFSLayerBean(wfs.getInfo()));
		}
		else
		{
			this.setInfo(new WFSLayerBean());
		}
	}

	public WFSLayerBean getInfo() {
		return info;
	}

	public void setInfo(WFSLayerBean info) {
		this.info = info;
	}
	
}
