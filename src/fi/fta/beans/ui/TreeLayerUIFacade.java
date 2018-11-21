package fi.fta.beans.ui;

import java.util.List;

public interface TreeLayerUIFacade
{
	
	public void setWmses(List<TreeWMSLayerUI> wmses);
	public void setWfses(List<TreeWFSLayerUI> wfses);
	public void setOthers(List<TreeServiceUI> others);
	
}
