package fi.fta.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.geotools.data.ows.Layer;
import org.geotools.data.ows.WMSCapabilities;
import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.MetaData;
import fi.fta.beans.WFS;
import fi.fta.beans.WMS;
import fi.fta.beans.WMSStyle;
import fi.fta.beans.ui.MetaDataUI;
import fi.fta.beans.ui.TreeBranchUI;
import fi.fta.beans.ui.TreeCategoryLayerUI;
import fi.fta.beans.ui.TreeCategoryUI;
import fi.fta.beans.ui.TreeLayerUI;
import fi.fta.beans.ui.TreeWFSLayerUI;
import fi.fta.beans.ui.TreeWMSLayerUI;
import fi.fta.beans.ui.WMSStyleUI;
import fi.fta.data.managers.CategoryManager;
import fi.fta.data.managers.WFSManager;
import fi.fta.data.managers.WMSManager;
import fi.fta.utils.parse.Style;

public class BeansUtils
{
	
	public static Layer getLayerByName(WMSCapabilities capabilities, String name)
	{
		for (Layer l : capabilities.getLayerList())
		{
			if (!Util.isEmptyString(l.getName()) && l.getName().equalsIgnoreCase(name))
			{
				return l;
			}
		}
		return null;
	}
	
	public static List<MetaData> getMetaData(Collection<fi.fta.utils.parse.MetaData> collection)
	{
		List<MetaData> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(collection))
		{
			for (fi.fta.utils.parse.MetaData mdu : collection)
			{
				ret.add(new MetaData(mdu));
			}
		}
		return ret;
	}
	
	public static List<MetaDataUI> getMetaDataUI(Collection<MetaData> collection)
	{
		List<MetaDataUI> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(collection))
		{
			for (MetaData md : collection)
			{
				ret.add(new MetaDataUI(md));
			}
		}
		return ret;
	}
	
	public static boolean contains(Collection<MetaData> collection, MetaData bean)
	{
		if (!Util.isEmptyCollection(collection) && bean != null)
		{
			for (MetaData md : collection)
			{
				if (bean.getUrl().equalsIgnoreCase(md.getUrl()))
				{
					return true;
				}
			}
		}
		return false;
	}
	
	public static List<WMSStyle> getStyles(Collection<Style> collection)
	{
		List<WMSStyle> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(collection))
		{
			for (Style s : collection)
			{
				ret.add(new WMSStyle(s));
			}
			ret.get(0).setMain(true);
		}
		return ret;
	}
	
	public static List<WMSStyleUI> getStylesUI(Collection<WMSStyle> collection)
	{
		List<WMSStyleUI> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(collection))
		{
			for (WMSStyle s : collection)
			{
				ret.add(new WMSStyleUI(s));
			}
		}
		return ret;
	}
	
	public static List<TreeBranchUI> getLayerUIs(Long parent, Collection<Category> root) throws HibernateException 
	{
		List<TreeBranchUI> layers = BeansUtils.getLayerUIs(root);
		List<WMS> wmses = WMSManager.getInstance().getChildren(parent);
		List<WFS> wfses = WFSManager.getInstance().getChildren(parent);
		if (!wmses.isEmpty() || !wfses.isEmpty())
		{
			Category c = new Category();
			if (parent != null)
			{
				c = CategoryManager.getInstance().get(parent);
			}
			layers.add(new TreeLayerUI(c, wmses, wfses));
		}
		return layers;
	}
	
	public static List<TreeBranchUI> getLayerUIs(Collection<Category> root) throws HibernateException 
	{
		List<TreeBranchUI> layers = new ArrayList<>();
		for (Category c : root)
		{
			List<WMS> wmses = WMSManager.getInstance().getChildren(c.getId());
			List<WFS> wfses = WFSManager.getInstance().getChildren(c.getId());
			if (wmses.isEmpty() && wfses.isEmpty())
			{
				TreeCategoryUI ui = new TreeCategoryUI(c);
				ui.getLayers().addAll(BeansUtils.getLayerUIs(c.getChildren()));
				layers.add(ui);
			}
			else if (c.getChildren().isEmpty())
			{
				layers.add(new TreeLayerUI(c, wmses, wfses));
			}
			else
			{
				TreeCategoryLayerUI ui = new TreeCategoryLayerUI(c, wmses, wfses);
				ui.getLayers().addAll(BeansUtils.getLayerUIs(c.getChildren()));
				layers.add(ui);
			}
		}
		return layers;
	}
	
	public static List<TreeWMSLayerUI> getTreeWMSUIs(Collection<WMS> wmses)
	{
		List<TreeWMSLayerUI> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(wmses))
		{
			for (WMS wms : wmses)
			{
				ret.add(new TreeWMSLayerUI(wms));
			}
		}
		return ret;
	}
	
	public static List<TreeWFSLayerUI> getTreeWFSUIs(Collection<WFS> wfses)
	{
		List<TreeWFSLayerUI> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(wfses))
		{
			for (WFS wfs : wfses)
			{
				ret.add(new TreeWFSLayerUI(wfs));
			}
		}
		return ret;
	}
	
}
