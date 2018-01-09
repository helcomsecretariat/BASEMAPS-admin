package fi.fta.data.managers;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

import org.geotools.data.ows.Layer;
import org.geotools.data.ows.WMSCapabilities;
import org.geotools.data.wms.WebMapServer;
import org.geotools.data.wms.xml.MetadataURL;
import org.geotools.ows.ServiceException;
import org.hibernate.HibernateException;

import fi.fta.beans.Pair;
import fi.fta.beans.WMS;
import fi.fta.beans.ui.WMSInfoUI;
import fi.fta.beans.ui.WMSUI;
import fi.fta.cache.TimeBasedCache;
import fi.fta.data.dao.CategoryDAO;
import fi.fta.data.dao.WMSDAO;
import fi.fta.utils.Util;

public class WMSManager extends CategoryBeanManager<WMS, WMSUI, WMSDAO>
{
	
	private static long WMS_CACHE_TIME = 10 * 60 * 1000;
	
	
	protected ReentrantLock cacheLock;
	
	protected TimeBasedCache<String, Pair<WebMapServer, Map<String, Layer>>> cache;
	
	
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
	}
	
	
	public List<WMS> getChildren(Long id) throws HibernateException
	{
		return dao.getByParent(id);
	}
	
	public Long add(WMSUI ui) throws HibernateException
	{
		WMS wms= new WMS(ui);
		if (ui.getParent() != null)
		{
			wms.setParent(new CategoryDAO().get(ui.getParent()));
		}
		return super.add(wms);
	}
	
	private WebMapServer getWebMapServer(String url) throws MalformedURLException, IOException, ServiceException
	{
		return this.getFromCache(url).getFirst();
	}
	
	private Map<String, Layer> getNamedLayers(String url) throws MalformedURLException, IOException, ServiceException
	{
		return this.getFromCache(url).getSecond();
	}
	
	private Pair<WebMapServer, Map<String, Layer>> getFromCache(String url) throws MalformedURLException, IOException, ServiceException
	{
		cacheLock.lock();
		try
		{
			if (!cache.contains(url))
			{
				Pair<WebMapServer, Map<String, Layer>> p = new Pair<>(
					new WebMapServer(new URL(url)), new HashMap<>());
				for (Layer l : p.getFirst().getCapabilities().getLayerList())
				{
					if (!Util.isEmptyString(l.getName()))
					{
						p.getSecond().put(l.getName(), l);
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
	
	public WMSInfoUI info(WMSUI ui) throws MalformedURLException, IOException, ServiceException
	{
		WMSInfoUI ret = new WMSInfoUI();
		if (!Util.isEmptyString(ui.getUrl()) && !Util.isEmptyString(ui.getName()))
		{
			String url = WMSManager.appendLanguage(ui.getUrl());
			WebMapServer server = this.getWebMapServer(url);
			WMSCapabilities capabilities = server.getCapabilities();
			ret.setVersion(capabilities.getVersion());
			ret.setOrganisation(capabilities.getService().getContactInformation().getOrganisationName().toString());
			//ret.setLanguages();
			Layer l = this.getNamedLayers(url).get(ui.getName());
			if (l != null)
			{
				ret.setTitle(l.getTitle());
				ret.setKeywords(Arrays.asList(l.getKeywords()));
				List<MetadataURL> urls = l.getMetadataURL();
				if (!Util.isEmptyCollection(urls))
				{
					MetadataURL	mdu = urls.get(0);			
					ret.setMetadataFormat(mdu.getFormat());
					ret.setMetadataUrl(mdu.getUrl().toString());
				}
			}
		}
		return ret;
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
	
}
