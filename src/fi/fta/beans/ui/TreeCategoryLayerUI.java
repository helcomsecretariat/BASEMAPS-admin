package fi.fta.beans.ui;

import java.util.List;

import fi.fta.beans.Category;
import fi.fta.utils.ServiceCollections;

public class TreeCategoryLayerUI extends TreeCategoryUI implements TreeLayerUIFacade
{
	
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 4459992364697738292L;
	
	
	private List<TreeWMSLayerUI> wmses;
	
	private List<TreeWFSLayerUI> wfses;
	
	private List<TreeServiceUI> others;
	
	
	public TreeCategoryLayerUI()
	{}
	
	public TreeCategoryLayerUI(Category c, ServiceCollections services)
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
