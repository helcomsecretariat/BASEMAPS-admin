package fi.fta.beans.ui;

import java.util.ArrayList;
import java.util.List;

import fi.fta.beans.Category;
import fi.fta.beans.WFS;
import fi.fta.beans.WMS;
import fi.fta.utils.BeansUtils;
import fi.fta.utils.Util;

public class TreeLayerUI extends TreeBranchUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -3463485461535740625L;
	
	private String label;

	private List<MetaDataUI> metadata;
	
	private List<TreeWMSLayerUI> wmses;
	
	private List<TreeWFSLayerUI> wfses;
	
	
	public TreeLayerUI()
	{}
	
	public TreeLayerUI(Category c, List<WMS> wmses, List<WFS> wfses)
	{
		super(c);
		this.setLabel(c.getLabel());
		this.setMetadata(BeansUtils.getMetaDataUI(c.getMetadata()));
		List<TreeWMSLayerUI> wmsl = new ArrayList<>();
		if (!Util.isEmptyCollection(wmses))
		{
			for (WMS wms : wmses)
			{
				wmsl.add(new TreeWMSLayerUI(wms));
			}
		}
		this.setWmses(wmsl);
		List<TreeWFSLayerUI> wfsl = new ArrayList<>();
		if (!Util.isEmptyCollection(wfses))
		{
			for (WFS wfs : wfses)
			{
				wfsl.add(new TreeWFSLayerUI(wfs));
			}
		}
		this.setWfses(wfsl);
	}
	
	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	public List<MetaDataUI> getMetadata() {
		return metadata;
	}

	public void setMetadata(List<MetaDataUI> metadata) {
		this.metadata = metadata;
	}

	public List<TreeWMSLayerUI> getWmses() {
		return wmses;
	}

	public void setWmses(List<TreeWMSLayerUI> wmses) {
		this.wmses = wmses;
	}

	public List<TreeWFSLayerUI> getWfses() {
		return wfses;
	}

	public void setWfses(List<TreeWFSLayerUI> wfses) {
		this.wfses = wfses;
	}
	
}
