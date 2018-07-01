package fi.fta.data.managers;

import java.io.IOException;
import java.net.MalformedURLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.ReentrantLock;

import org.apache.log4j.Logger;
import org.dom4j.DocumentException;
import org.hibernate.HibernateException;

import fi.fta.beans.MetaDataSource;
import fi.fta.beans.Named;
import fi.fta.beans.UrlFacade;
import fi.fta.beans.WFS;
import fi.fta.beans.WFSFeatures;
import fi.fta.beans.WFSInfo;
import fi.fta.beans.WFSLayerBean;
import fi.fta.beans.ui.LayerServiceUI;
import fi.fta.beans.ui.VerifyUI;
import fi.fta.cache.TimeBasedCache;
import fi.fta.data.dao.WFSDAO;
import fi.fta.utils.DateAndTimeUtils;
import fi.fta.utils.Util;
import fi.fta.utils.parse.wfs.FeatureType;
import fi.fta.utils.parse.wfs.WebFeatureServer;

public class WFSManager extends ServiceManager<WFS, WFSDAO>
{
	
	private static long WFS_CACHE_TIME = 10 * 60 * 1000;
	private static long WFS_INFO_UPDATE_THRESHOLD = 183;
	
	protected static Logger logger = Logger.getLogger(WFSManager.class);
	
	protected ReentrantLock cacheLock;
	
	protected TimeBasedCache<String, Map<String, WFSFeatures>> cache;
	
	protected ReentrantLock updateInfoLock;
	
	protected static WFSManager instance;
	
	public static WFSManager getInstance()
	{
		if (instance == null)
		{
			synchronized (WFSManager.class)
			{
				if (instance == null)
				{
					instance = new WFSManager();
				}
			}
		}
		return instance;
	}
	
	protected WFSManager()
	{
		super(new WFSDAO(), MetaDataSource.WFS);
		this.cacheLock = new ReentrantLock();
		this.cache = new TimeBasedCache<>(WFSManager.WFS_CACHE_TIME);
		this.updateInfoLock = new ReentrantLock();
	}
	
	public Long add(LayerServiceUI ui) throws Exception
	{
		WFS wfs = new WFS(ui);
		try
		{
			WFSFeatures s = this.getFeatures(wfs);
			if (s != null)
			{
				wfs.setInfo(s.getInfo());
				super.addMetaData(ui, s.getMetadata());
			}
		}
		catch (NullPointerException ex)
		{
			logger.error("WFSManager.add parse null pointer", ex);
		}
		catch (DocumentException ex)
		{
			logger.error("WFSManager.add parse", ex);
		}
		return super.add(wfs);
	}
	
	public WFS update(LayerServiceUI ui) throws Exception
	{
		WFS wfs = super.update(new WFS(ui));
		//wfs.setInfo(new WFSInfoDAO().get(ui.getId()));
		try
		{
			this.updateInfo(wfs);
		}
		catch (NullPointerException ex)
		{
			logger.error("WFSManager.update parse null pointer", ex);
		}
		catch (DocumentException ex)
		{
			logger.error("WFSManager.update parse", ex);
		}
		return wfs;
	}
	
	public void updateInfo(WFS wfs) throws HibernateException, MalformedURLException, IOException, DocumentException	
	{
		try
		{
			updateInfoLock.lock();
			WFSFeatures features = this.getFeatures(wfs);
			if (features != null)
			{
				if (wfs.getInfo() == null)
				{
					wfs.setInfo(new WFSInfo());
				}
				wfs.getInfo().copy(features.getInfo());
				wfs.getInfo().setUpdated(Calendar.getInstance().getTime());
				dao.update(wfs);
				super.updateMetaData(wfs, features.getMetadata());
			}
		}
		finally
		{
			updateInfoLock.unlock();
		}
	}
	
	private Map<String, WFSFeatures> getFromCache(String url) throws MalformedURLException, IOException, DocumentException
	{
		cacheLock.lock();
		try
		{
			if (!cache.contains(url))
			{
				Map<String, WFSFeatures> map = new HashMap<>();
				WebFeatureServer ws = new WebFeatureServer(url);
				if (ws.hasSpecification())
				{
					for (FeatureType ft : ws.getNamedFeatureTypes())
					{
						map.put(ft.getName(), new WFSFeatures(
							ws.getSpecification(), ws.getFeatureInfo(), ft));
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
	
	private <T extends Named & UrlFacade> WFSFeatures getFeatures(T wfs) throws MalformedURLException, IOException, DocumentException
	{
		return this.getFeatures(wfs.getUrl(), wfs.getName());
	}
	
	private WFSFeatures getFeatures(String url, String name) throws MalformedURLException, IOException, DocumentException
	{
		if (!Util.isEmptyString(url) && !Util.isEmptyString(name))
		{
			Map<String, WFSFeatures> features = this.getFromCache(url);
			if (features.containsKey(name))
			{
				return features.get(name);
			}
		}
		return null;
	}
	
	@Override
	public VerifyUI verify(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException
	{
		VerifyUI ret = new VerifyUI();
		if (!Util.isEmptyString(ui.getUrl()))
		{
			Map<String, WFSFeatures> map = this.getFromCache(ui.getUrl());
			ret.setNames(new ArrayList<>());
			Set<String> set = map.keySet();
			ret.getNames().addAll(set);
			ret.setOrganization(map.get(set.iterator().next()).getInfo().getOrganisation());
		}
		return ret;
	}
	
	@SuppressWarnings("unchecked")
	public WFSLayerBean info(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException
	{
		WFSFeatures f = this.getFeatures(ui);
		return f != null ? new WFSLayerBean(f.getInfo()) : new WFSLayerBean();
	}
	
	public void scheduleUpdateInfo(Long id)
	{
		Thread t = new Thread(() -> {
			try
			{
				WFS wfs = this.get(id);
				if (wfs != null && WFSManager.needUpdate(wfs.getInfo()))
				{
					this.updateInfo(wfs);
				}
			}
			catch (Exception ex)
			{
				logger.error("WFSManager.scheduleUpdateInfo", ex);
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
	
	
	private static boolean needUpdate(WFSInfo info)
	{
		return info == null || info.getUpdated().before(
			DateAndTimeUtils.asDate(
				LocalDate.now().minusDays(WFSManager.WFS_INFO_UPDATE_THRESHOLD)));
	}
	
}
