package fi.fta.beans.ui;

import java.util.ArrayList;
import java.util.List;

import fi.fta.beans.Category;
import fi.fta.beans.WFS;
import fi.fta.beans.WMS;
import fi.fta.utils.Util;

public class TreeCategoryLayerUI extends TreeCategoryUI
{
	
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 4459992364697738292L;
	
	private List<TreeWMSLayerUI> wmses;
	
	private List<TreeWFSLayerUI> wfses;
	
	
	public TreeCategoryLayerUI()
	{}
	
	public TreeCategoryLayerUI(Category c, List<WMS> wmses, List<WFS> wfses)
	{
		super(c);
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