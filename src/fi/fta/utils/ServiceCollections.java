package fi.fta.utils;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.TypedLayerService;
import fi.fta.beans.WFS;
import fi.fta.beans.WMS;
import fi.fta.beans.ui.TreeLayerUIFacade;
import fi.fta.data.managers.SimpleUrlServiceManager;
import fi.fta.data.managers.WFSManager;
import fi.fta.data.managers.WMSManager;

public class ServiceCollections
{
	
	private List<WMS> wmses;
	private List<WFS> wfses;
	private List<TypedLayerService> others;
	
	public ServiceCollections(Long parent) throws HibernateException
	{
		wmses = WMSManager.getInstance().getChildren(parent);
		wfses = WFSManager.getInstance().getChildren(parent);
		others = new ArrayList<>();
		others.addAll(SimpleUrlServiceManager.getArcGISInstance().getChildren(parent));
		others.addAll(SimpleUrlServiceManager.getDownloadableInstance().getChildren(parent));
	}
	
	public boolean isEmpty()
	{
		return CollectionsUtils.isEmptyAll(wmses, wfses, others);
	}
	
	public void to(TreeLayerUIFacade t)
	{
		t.setWmses(BeansUtils.getTreeWMSUIs(wmses));
		t.setWfses(BeansUtils.getTreeWFSUIs(wfses));
		t.setOthers(BeansUtils.getTreeServiceUIs(others));
	}
	
}
