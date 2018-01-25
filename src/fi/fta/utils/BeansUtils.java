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
import fi.fta.beans.WMS;
import fi.fta.beans.WMSMetaData;
import fi.fta.beans.WMSStyle;
import fi.fta.beans.ui.TreeLayerUI;
import fi.fta.beans.ui.TreeWMSLayerUI;
import fi.fta.beans.ui.WMSMetaDataUI;
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
	
	public static List<WMSMetaData> getMetaData(Collection<MetadataURL> collection)
	{
		List<WMSMetaData> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(collection))
		{
			for (MetadataURL mdu : collection)
			{
				ret.add(new WMSMetaData(mdu));
			}
		}
		return ret;
	}
	
	public static List<WMSMetaDataUI> getMetaDataUI(Collection<WMSMetaData> collection)
	{
		List<WMSMetaDataUI> ret = new ArrayList<>();
		if (!Util.isEmptyCollection(collection))
		{
			for (WMSMetaData md : collection)
			{
				ret.add(new WMSMetaDataUI(md));
			}
		}
		return ret;
	}
	
	public static boolean contains(Collection<WMSMetaData> collection, WMSMetaData bean)
	{
		if (!Util.isEmptyCollection(collection) && bean != null)
		{
			for (WMSMetaData md : collection)
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
	
	public static List<TreeLayerUI> getLayerUIs(Long parent, Collection<Category> root) throws HibernateException 
	{
		List<TreeLayerUI> layers = new ArrayList<>();
		for (Category c : root)
		{
			TreeLayerUI ui = new TreeLayerUI(c);
			ui.getLayers().addAll(
				BeansUtils.getLayerUIs(c.getId(), c.getChildren()));
			ui.setCategory(
				ui.getLayers().isEmpty() ||
				!(ui.getLayers().listIterator(ui.getLayers().size() - 1).next() instanceof TreeWMSLayerUI));
			layers.add(ui);
		}
		for (WMS wms : WMSManager.getInstance().getChildren(parent))
		{
			layers.add(new TreeWMSLayerUI(wms));
		}
		return layers;
	}
	
}
