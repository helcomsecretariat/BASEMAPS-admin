package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.Category;
import fi.fta.utils.ServiceCollections;

public class TreeLayerUI extends TreeBranchUI implements TreeLayerUIFacade
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -3463485461535740625L;
	
	
	private List<TreeWMSLayerUI> wmses;
	
	private List<TreeWFSLayerUI> wfses;
	
	private List<TreeServiceUI> others;
	
	
	public TreeLayerUI()
	{}
	
	public TreeLayerUI(Category c, ServiceCollections services)
	{
		super(c);
		services.to(this);
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

	public List<TreeServiceUI> getOthers() {
		return others;
	}

	public void setOthers(List<TreeServiceUI> others) {
		this.others = others;
	}
	
}
