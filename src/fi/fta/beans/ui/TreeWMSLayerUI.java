package fi.fta.beans.ui;

import java.util.ArrayList;
import java.util.List;

import fi.fta.beans.WMS;
import fi.fta.beans.WMSLayerBean;
import fi.fta.utils.BeansUtils;

public class TreeWMSLayerUI extends LayerServiceUI
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1812458807754701691L;
	
	private WMSLayerBean info;
	
	private List<WMSStyleUI> styles;
	
	
	public TreeWMSLayerUI()
	{
		super();
	}
	
	public TreeWMSLayerUI(WMS wms)
	{
		super(wms);
		if (wms.getInfo() != null)
		{
			this.setInfo(new WMSLayerBean(wms.getInfo()));
			this.setStyles(BeansUtils.getStylesUI(wms.getInfo().getStyles()));
		}
		else
		{
			this.setInfo(new WMSLayerBean());
			this.setStyles(new ArrayList<>());
		}
	}

	public WMSLayerBean getInfo() {
		return info;
	}

	public void setInfo(WMSLayerBean info) {
		this.info = info;
	}

	public List<WMSStyleUI> getStyles() {
		return styles;
	}

	public void setStyles(List<WMSStyleUI> styles) {
		this.styles = styles;
	}
	
}
