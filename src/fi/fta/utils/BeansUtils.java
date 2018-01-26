package fi.fta.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.geotools.data.ows.Layer;
import org.geotools.data.ows.StyleImpl;
import org.geotools.data.ows.WMSCapabilities;
import org.geotools.data.wms.xml.MetadataURL;
import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.MetaData;
import fi.fta.beans.WMS;
import fi.fta.beans.WMSStyle;
import fi.fta.beans.ui.MetaDataUI;
import fi.fta.beans.ui.TreeBranchUI;
import fi.fta.beans.ui.TreeCategoryUI;
import fi.fta.beans.ui.TreeWMSLayerUI;
import fi.fta.beans.ui.WMSStyleUI;
import fi.fta.data.managers.WMSManager;

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
	
	public static List<MetaData> getMetaData(Collection<MetadataURL> collection)
	{
		List<MetaData> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(collection))
		{
			for (MetadataURL mdu : collection)
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
	
	public static List<WMSStyle> getStyles(Collection<StyleImpl> collection)
	{
		List<WMSStyle> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(collection))
		{
			for (StyleImpl s : collection)
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
		List<TreeBranchUI> layers = new ArrayList<>();
		for (Category c : root)
		{
			TreeCategoryUI ui = new TreeCategoryUI(c);
			ui.getLayers().addAll(
				BeansUtils.getLayerUIs(c.getId(), c.getChildren()));
			if (ui.isCategory())
			{
				boolean layer = !ui.getLayers().isEmpty() &&
					(ui.getLayers().listIterator(ui.getLayers().size() - 1).next() instanceof TreeWMSLayerUI);
				ui.setCategory(!layer);
			}
			layers.add(ui);
		}
		for (WMS wms : WMSManager.getInstance().getChildren(parent))
		{
			layers.add(new TreeWMSLayerUI(wms));
		}
		return layers;
	}
	
}
