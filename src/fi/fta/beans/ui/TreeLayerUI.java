package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.Category;
import fi.fta.beans.WFS;
import fi.fta.beans.WMS;
import fi.fta.utils.BeansUtils;

public class TreeLayerUI extends TreeBranchUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -3463485461535740625L;
	
	private List<TreeWMSLayerUI> wmses;
	
	private List<TreeWFSLayerUI> wfses;
	
	
	public TreeLayerUI()
	{}
	
	public TreeLayerUI(Category c, List<WMS> wmses, List<WFS> wfses)
	{
		super(c);
		this.setWmses(BeansUtils.getTreeWMSUIs(wmses));
		this.setWfses(BeansUtils.getTreeWFSUIs(wfses));
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
