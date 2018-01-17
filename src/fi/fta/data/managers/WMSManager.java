package fi.fta.data.managers;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
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
import org.geotools.data.ows.Layer;
import org.geotools.data.wms.WebMapServer;
import org.geotools.ows.ServiceException;
import org.hibernate.HibernateException;

import fi.fta.beans.MetaDataSource;
import fi.fta.beans.Pair;
import fi.fta.beans.WMS;
import fi.fta.beans.WMSInfo;
import fi.fta.beans.WMSLayer;
import fi.fta.beans.WMSMetaData;
import fi.fta.beans.ui.WMSLayerUI;
import fi.fta.beans.ui.WMSUI;
import fi.fta.cache.TimeBasedCache;
import fi.fta.data.dao.WMSDAO;
import fi.fta.filters.WMSMetaDataSourceFilter;
import fi.fta.utils.BeansUtils;
import fi.fta.utils.CollectionsUtils;
import fi.fta.utils.DateAndTimeUtils;
import fi.fta.utils.Util;

public class WMSManager extends CategoryBeanManager<WMS, WMSUI, WMSDAO>
{
	
	private static long WMS_CACHE_TIME = 10 * 60 * 1000;
	private static long WMS_INFO_UPDATE_THRESHOLD = 183;
	
	protected static Logger logger = Logger.getLogger(WMSManager.class);
	
	protected ReentrantLock cacheLock;
	
	protected TimeBasedCache<String, Pair<WebMapServer, Map<String, WMSLayer>>> cache;
	
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
	public WMSUI getUI(Long id) throws HibernateException
	{
		WMS wms = this.get(id);
		return wms != null ? new WMSUI(wms) : new WMSUI();
	}
	
	public List<WMS> getChildren(Long id) throws HibernateException
	{
		return dao.getByParent(id);
	}
	
	public Long add(WMSUI ui) throws Exception
	{
		WMS wms = new WMS(ui);
		wms.setParent(ui.getParent());
		WMSLayer l = this.getLayer(ui);
		if (l != null)
		{
			wms.setInfo(l.getInfo());
			if (!l.getMetadata().isEmpty())
			{
				if (!wms.getMetadata().isEmpty())
				{
					for (WMSMetaData md : l.getMetadata())
					{
						if (!BeansUtils.contains(wms.getMetadata(), md))
						{
							wms.getMetadata().add(md);
						}
					}
				}
				else
				{
					wms.getMetadata().addAll(l.getMetadata());
				}
			}
		}
		return super.add(wms);
	}
	
	public void updateInfo(WMS wms) throws HibernateException, MalformedURLException, IOException, ServiceException	
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
				Set<WMSMetaData> current = new WMSMetaDataSourceFilter(MetaDataSource.WMS).filter(wms.getMetadata());
				wms.getMetadata().removeAll(
					CollectionsUtils.removeAllByUrl(current, new HashSet<>(layer.getMetadata())));
				wms.getMetadata().addAll(
					CollectionsUtils.removeAllByUrl(new HashSet<>(layer.getMetadata()), current));
				dao.update(wms);
			}
		}
		finally
		{
			updateInfoLock.unlock();
		}
	}
	
	private WebMapServer getWebMapServer(String url) throws MalformedURLException, IOException, ServiceException
	{
		return this.getFromCache(url).getFirst();
	}
	
	private Map<String, WMSLayer> getNamedLayers(String url) throws MalformedURLException, IOException, ServiceException
	{
		return this.getFromCache(url).getSecond();
	}
	
	private Pair<WebMapServer, Map<String, WMSLayer>> getFromCache(String url) throws MalformedURLException, IOException, ServiceException
	{
		cacheLock.lock();
		try
		{
			if (!cache.contains(url))
			{
				Pair<WebMapServer, Map<String, WMSLayer>> p = new Pair<>(
					new WebMapServer(new URL(url)), new HashMap<>());
				for (Layer l : p.getFirst().getCapabilities().getLayerList())
				{
					if (!Util.isEmptyString(l.getName()))
					{
						p.getSecond().put(l.getName(), new WMSLayer(p.getFirst(), l));
					}
				}
				cache.put(url, p);
			}
			return cache.get(url);
		}
		finally
		{
			cacheLock.unlock();
		}
	}
	
	private WMSLayer getLayer(WMS wms) throws MalformedURLException, IOException, ServiceException
	{
		return this.getLayer(wms.getUrl(), wms.getName());
	}
	
	private WMSLayer getLayer(WMSUI ui) throws MalformedURLException, IOException, ServiceException
	{
		return this.getLayer(ui.getUrl(), ui.getName());
	}
	
	private WMSLayer getLayer(String url, String name) throws MalformedURLException, IOException, ServiceException
	{
		if (!Util.isEmptyString(url) && !Util.isEmptyString(name))
		{
			String appended = WMSManager.appendLanguage(url);
			Map<String, WMSLayer> layers = this.getNamedLayers(appended);
			if (layers.containsKey(name))
			{
				return layers.get(name);
			}
		}
		return null;
	}
	
	public List<String> verify(WMSUI ui) throws MalformedURLException, IOException, ServiceException
	{
		List<String> ret = new ArrayList<>();
		if (!Util.isEmptyString(ui.getUrl()))
		{
			String url = WMSManager.appendLanguage(ui.getUrl());
			ret.addAll(this.getNamedLayers(url).keySet());
		}
		return ret;
	}
	
	public WMSLayerUI info(WMSUI ui) throws MalformedURLException, IOException, ServiceException
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
	
	
	private static String appendLanguage(String url)
	{
		StringBuffer ret = new StringBuffer(url);
		if (url.toLowerCase().indexOf("language") < 0)
		{
			ret.append(url.indexOf("?") < 0 ? "?" : "&").append("LANGUAGE=eng");
		}
		return ret.toString();
	}
	
	private static boolean needUpdate(WMSInfo info)
	{
		return info == null || info.getUpdated().before(
			DateAndTimeUtils.asDate(
				LocalDate.now().minusDays(WMSManager.WMS_INFO_UPDATE_THRESHOLD)));
	}
	
}
