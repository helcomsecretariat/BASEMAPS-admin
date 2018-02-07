package fi.fta.data.managers;

import java.io.IOException;
import java.net.MalformedURLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.ReentrantLock;

import org.apache.log4j.Logger;
import org.dom4j.DocumentException;
import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.MetaData;
import fi.fta.beans.MetaDataSource;
import fi.fta.beans.Named;
import fi.fta.beans.UrlFacade;
import fi.fta.beans.WMS;
import fi.fta.beans.WMSInfo;
import fi.fta.beans.WMSLayer;
import fi.fta.beans.ui.LayerServiceUI;
import fi.fta.beans.ui.WMSLayerUI;
import fi.fta.cache.TimeBasedCache;
import fi.fta.data.dao.WMSDAO;
import fi.fta.data.dao.WMSInfoDAO;
import fi.fta.filters.WMSMetaDataSourceFilter;
import fi.fta.utils.BeansUtils;
import fi.fta.utils.CollectionsUtils;
import fi.fta.utils.DateAndTimeUtils;
import fi.fta.utils.Util;
import fi.fta.utils.parse.wms.Layer;
import fi.fta.utils.parse.wms.WebMapServer;

public class WMSManager extends CategoryBeanManager<WMS, LayerServiceUI, WMSDAO>
{
	
	private static long WMS_CACHE_TIME = 10 * 60 * 1000;
	private static long WMS_INFO_UPDATE_THRESHOLD = 183;
	
	protected static Logger logger = Logger.getLogger(WMSManager.class);
	
	protected ReentrantLock cacheLock;
	
	protected TimeBasedCache<String, Map<String, WMSLayer>> cache;
	
	protected ReentrantLock updateInfoLock;
	
	protected static WMSManager instance;
	
	public static WMSManager getInstance()
	{
		if (instance == null)
		{
			synchronized (WMSManager.class)
			{
				if (instance == null)
				{
					instance = new WMSManager();
				}
			}
		}
		return instance;
	}
	
	protected WMSManager()
	{
		super(new WMSDAO());
		this.cacheLock = new ReentrantLock();
		this.cache = new TimeBasedCache<>(WMSManager.WMS_CACHE_TIME);
		this.updateInfoLock = new ReentrantLock();
	}
	
	@Override
	public LayerServiceUI getUI(Long id) throws HibernateException
	{
		WMS wms = this.get(id);
		return wms != null ? new LayerServiceUI(wms) : new LayerServiceUI();
	}
	
	public List<WMS> getChildren(Long id) throws HibernateException
	{
		return dao.getByParent(id);
	}
	
	public Long add(LayerServiceUI ui) throws Exception
	{
		WMS wms = new WMS(ui);
		try
		{
			WMSLayer l = this.getLayer(ui);
			if (l != null)
			{
				wms.setInfo(l.getInfo());
				if (!l.getMetadata().isEmpty())
				{
					Category c = CategoryManager.getInstance().get(ui.getParent());
					if (c != null)
					{
						if (!c.getMetadata().isEmpty())
						{
							for (MetaData md : l.getMetadata())
							{
								if (!BeansUtils.contains(c.getMetadata(), md))
								{
									c.getMetadata().add(md);
								}
							}
						}
						else
						{
							c.getMetadata().addAll(l.getMetadata());
						}
						CategoryManager.getInstance().update(c);
					}
				}
			}
		}
		catch (NullPointerException ex)
		{
			logger.error("WMSManager.add parse layer null pointer", ex);
		}
		catch (DocumentException ex)
		{
			logger.error("WMSManager.add parse layer", ex);
		}
		return super.add(wms);
	}
	
	public WMS update(LayerServiceUI ui) throws Exception
	{
		WMS wms = super.update(new WMS(ui));
		wms.setInfo(new WMSInfoDAO().get(ui.getId()));
		try
		{
			this.updateInfo(wms);
		}
		catch (NullPointerException ex)
		{
			logger.error("WMSManager.update parse layer null pointer", ex);
		}
		catch (DocumentException ex)
		{
			logger.error("WMSManager.update parse layer", ex);
		}
		return wms;
	}
	
	public void updateInfo(WMS wms) throws HibernateException, MalformedURLException, IOException, DocumentException	
	{
		try
		{
			updateInfoLock.lock();
			WMSLayer layer = this.getLayer(wms);
			if (layer != null)
			{
				if (wms.getInfo() == null)
				{
					wms.setInfo(new WMSInfo());
					wms.getInfo().setStyles(layer.getInfo().getStyles());
				}
				else
				{
					wms.getInfo().getStyles().retainAll(layer.getInfo().getStyles());
				}
				wms.getInfo().copy(layer.getInfo());
				wms.getInfo().setUpdated(Calendar.getInstance().getTime());
				dao.update(wms);
				
				Category c = CategoryManager.getInstance().get(wms.getParent());
				if (c != null)
				{
					Set<MetaData> current = new WMSMetaDataSourceFilter(MetaDataSource.WMS).filter(c.getMetadata());
					c.getMetadata().removeAll(
						CollectionsUtils.removeAllByUrl(current, new HashSet<>(layer.getMetadata())));
					c.getMetadata().addAll(
						CollectionsUtils.removeAllByUrl(new HashSet<>(layer.getMetadata()), current));
					CategoryManager.getInstance().update(c);
				}
			}
		}
		finally
		{
			updateInfoLock.unlock();
		}
	}
	
	private Map<String, WMSLayer> getFromCache(String url) throws MalformedURLException, IOException, DocumentException
	{
		cacheLock.lock();
		try
		{
			if (!cache.contains(url))
			{
				Map<String, WMSLayer> map = new HashMap<>();
				WebMapServer ws = new WebMapServer(url);
				if (ws.hasSpecification())
				{
					for (Layer l : ws.getNamedLayers())
					{
						map.put(l.getName(), new WMSLayer(
							ws.getSpecification(), ws.getFeatureInfo(), l));
					}
				}
				cache.put(url, map);
			}
			return cache.get(url);
		}
		finally
		{
			cacheLock.unlock();
		}
	}
	
	private <T extends Named & UrlFacade> WMSLayer getLayer(T wms) throws MalformedURLException, IOException, DocumentException
	{
		return this.getLayer(wms.getUrl(), wms.getName());
	}
	
	private WMSLayer getLayer(String url, String name) throws MalformedURLException, IOException, DocumentException
	{
		if (!Util.isEmptyString(url) && !Util.isEmptyString(name))
		{
			Map<String, WMSLayer> layers = this.getFromCache(url);
			if (layers.containsKey(name))
			{
				return layers.get(name);
			}
		}
		return null;
	}
	
	public List<String> verify(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException
	{
		List<String> ret = new ArrayList<>();
		if (!Util.isEmptyString(ui.getUrl()))
		{
			ret.addAll(this.getFromCache(ui.getUrl()).keySet());
		}
		return ret;
	}
	
	public WMSLayerUI info(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException
	{
		WMSLayer l = this.getLayer(ui);
		return l != null ? new WMSLayerUI(l) : new WMSLayerUI();
	}
	
	public void scheduleUpdateInfo(Long id)
	{
		Thread t = new Thread(() -> {
			try
			{
				WMS wms = this.get(id);
				if (wms != null && WMSManager.needUpdate(wms.getInfo()))
				{
					this.updateInfo(wms);
				}
			}
			catch (Exception ex)
			{
				logger.error("WMSManager.scheduleUpdateInfo", ex);
			}
		});
		t.start();
	}
	
	public void clear()
	{
		cacheLock.lock();
		try
		{
			cache.clear();
		}
		finally
		{
			cacheLock.unlock();
		}
	}
	
	private static boolean needUpdate(WMSInfo info)
	{
		return info == null || info.getUpdated().before(
			DateAndTimeUtils.asDate(
				LocalDate.now().minusDays(WMSManager.WMS_INFO_UPDATE_THRESHOLD)));
	}
	
}
