package fi.fta.data.managers;

import java.io.IOException;
import java.net.MalformedURLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.ReentrantLock;

import org.apache.log4j.Logger;
import org.dom4j.DocumentException;
import org.hibernate.HibernateException;

import fi.fta.beans.MetaDataSource;
import fi.fta.beans.Named;
import fi.fta.beans.UrlFacade;
import fi.fta.beans.WMS;
import fi.fta.beans.WMSInfo;
import fi.fta.beans.WMSLayer;
import fi.fta.beans.WMSStyle;
import fi.fta.beans.ui.LayerServiceUI;
import fi.fta.beans.ui.VerifyUI;
import fi.fta.beans.ui.WMSLayerUI;
import fi.fta.cache.TimeBasedCache;
import fi.fta.data.dao.WMSDAO;
import fi.fta.data.dao.WMSInfoDAO;
import fi.fta.utils.DateAndTimeUtils;
import fi.fta.utils.Util;
import fi.fta.utils.parse.wms.Layer;
import fi.fta.utils.parse.wms.WebMapServer;

/**
 * WMS data manager
 * 
 * @author andrysta
 *
 */
public class WMSManager extends ServiceManager<WMS, WMSDAO>
{
	
	/**
	 * Time in milliseconds to keep WMS in application cache.
	 */
	private static long WMS_CACHE_TIME = 10 * 60 * 1000;
	
	/**
	 * Threshold in days when WMS need info update.
	 */
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
		super(new WMSDAO(), MetaDataSource.WMS);
		this.cacheLock = new ReentrantLock();
		this.cache = new TimeBasedCache<>(WMSManager.WMS_CACHE_TIME);
		this.updateInfoLock = new ReentrantLock();
	}
	
	public Long add(LayerServiceUI ui) throws Exception
	{
		WMS wms = new WMS(ui);
		try
		{
			WMSLayer l = this.getLayer(ui);
			if (l != null)
			{
				TranslateManager.getInstance().translate(l.getInfo());
				wms.setInfo(new WMSInfo());
				wms.getInfo().copy(l.getInfo());
				wms.getInfo().setStyles(new HashSet<>());
				for (WMSStyle s : l.getInfo().getStyles())
				{
					wms.getInfo().getStyles().add(new WMSStyle(s));
				}
				super.addMetaData(ui, l.getMetadata());
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
	
	/**
	 * Update info part of WMS.
	 * 
	 * @param wms database WMS object where info part needs to be updated from the particular layer of remote service.
	 * @throws HibernateException database exception
	 * @throws MalformedURLException remote exception
	 * @throws IOException input exception
	 * @throws DocumentException XML exception
	 */
	public void updateInfo(WMS wms) throws HibernateException, MalformedURLException, IOException, DocumentException	
	{
		try
		{
			updateInfoLock.lock();
			WMSLayer layer = this.getLayer(wms);
			if (layer != null && layer.getInfo() != null)
			{
				TranslateManager.getInstance().translate(layer.getInfo());
				if (wms.getInfo() == null)
				{
					wms.setInfo(new WMSInfo());
					wms.getInfo().setStyles(new HashSet<>());
					for (WMSStyle s : layer.getInfo().getStyles())
					{
						wms.getInfo().getStyles().add(new WMSStyle(s));
					}
				}
				else
				{
					wms.getInfo().getStyles().retainAll(layer.getInfo().getStyles());
				}
				wms.getInfo().copy(layer.getInfo());
				wms.getInfo().setUpdated(Calendar.getInstance().getTime());
				dao.update(wms);
				super.updateMetaData(wms, layer.getMetadata());
			}
		}
		finally
		{
			updateInfoLock.unlock();
		}
	}
	
	/**
	 * Get WMS layers map from remote service if not cached. Get map from cache if cached.
	 * 
	 * @param url service URL
	 * @return map of WMS layers
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws DocumentException
	 */
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
	
	/**
	 * Get layer of particular WMS by object
	 * 
	 * @param wms name and URL object wrapper
	 * @return WMS layer object
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws DocumentException
	 */
	private <T extends Named & UrlFacade> WMSLayer getLayer(T wms) throws MalformedURLException, IOException, DocumentException
	{
		return this.getLayer(wms.getUrl(), wms.getName());
	}
	
	/**
	 * Get layer of particular WMS by name.
	 * 
	 * @param url WMS URL
	 * @param name WMS layer name
	 * @return WMS layer object
	 * @throws MalformedURLException
	 * @throws IOException
	 * @throws DocumentException
	 */
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
	
	public VerifyUI verify(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException
	{
		VerifyUI ret = new VerifyUI();
		if (!Util.isEmptyString(ui.getUrl()))
		{
			Map<String, WMSLayer> map = this.getFromCache(ui.getUrl());
			ret.setNames(new ArrayList<>());
			Set<String> set = map.keySet();
			ret.getNames().addAll(set);
			if (!set.isEmpty())
			{
				ret.setOrganization(map.get(set.iterator().next()).getInfo().getOrganisation());
			}
		}
		return ret;
	}
	
	@SuppressWarnings("unchecked")
	public WMSLayerUI info(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException
	{
		WMSLayer l = this.getLayer(ui);
		TranslateManager.getInstance().translate(l.getInfo());
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
	
	/**
	 * Clear manager cache
	 */
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
	
	/**
	 * Check if WMS needs to update info. Is info updated before WFS info update threshold.
	 * 
	 * @param info WMS info object
	 * @return true if info needs to be updated
	 */
	private static boolean needUpdate(WMSInfo info)
	{
		return info == null || info.getUpdated().before(
			DateAndTimeUtils.asDate(
				LocalDate.now().minusDays(WMSManager.WMS_INFO_UPDATE_THRESHOLD)));
	}
	
}
