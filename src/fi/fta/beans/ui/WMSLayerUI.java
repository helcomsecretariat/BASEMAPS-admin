package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.WMSLayer;
import fi.fta.beans.WMSLayerBean;
import fi.fta.utils.BeansUtils;

public class WMSLayerUI extends WMSLayerBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7633006930814896400L;
	
	
	private List<WMSMetaDataUI> metadata;
	
	private List<WMSStyleUI> styles;
	
	public WMSLayerUI()
	{}
	
	public WMSLayerUI(WMSLayer layer)
	{
		super(layer.getInfo());
		this.setMetadata(BeansUtils.getMetaDataUI(layer.getMetadata()));
		this.setStyles(BeansUtils.getStylesUI(layer.getInfo().getStyles()));
	}
	
	public List<WMSMetaDataUI> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<WMSMetaDataUI> metadata) {
		this.metadata = metadata;
	}

	public List<WMSStyleUI> getStyles() {
		return styles;
	}

	public void setStyles(List<WMSStyleUI> styles) {
		this.styles = styles;
	}
	
}
