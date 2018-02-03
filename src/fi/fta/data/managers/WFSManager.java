package fi.fta.data.managers;

import java.io.IOException;
import java.net.MalformedURLException;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

import org.apache.log4j.Logger;
import org.geotools.ows.ServiceException;
import org.hibernate.HibernateException;

import fi.fta.beans.WFS;
import fi.fta.beans.WFSInfo;
import fi.fta.beans.ui.LayerServiceUI;
import fi.fta.cache.TimeBasedCache;
import fi.fta.data.dao.WFSDAO;
import fi.fta.utils.DateAndTimeUtils;

public class WFSManager extends CategoryBeanManager<WFS, LayerServiceUI, WFSDAO>
{
	
	private static long WFS_CACHE_TIME = 10 * 60 * 1000;
	private static long WFS_INFO_UPDATE_THRESHOLD = 183;
	
	protected static Logger logger = Logger.getLogger(WFSManager.class);
	
	protected ReentrantLock cacheLock;
	
	protected TimeBasedCache<String, String> cache;
	
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
		super(new WFSDAO());
		this.cacheLock = new ReentrantLock();
		this.cache = new TimeBasedCache<>(WFSManager.WFS_CACHE_TIME);
		this.updateInfoLock = new ReentrantLock();
	}
	
	@Override
	public LayerServiceUI getUI(Long id) throws HibernateException
	{
		WFS wfs = this.get(id);
		return wfs != null ? new LayerServiceUI(wfs) : new LayerServiceUI();
	}
	
	public List<WFS> getChildren(Long id) throws HibernateException
	{
		return dao.getByParent(id);
	}
	
	public Long add(LayerServiceUI ui) throws Exception
	{
		WFS wms = new WFS(ui);
		/*
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
		catch (ServiceException ex)
		{
			logger.error("WMSManager.add parse layer", ex);
		}
		*/
		return super.add(wms);
	}
	
	public WFS update(LayerServiceUI ui) throws HibernateException
	{
		return super.update(new WFS(ui));
	}
	
	public void updateInfo(WFS wms) throws HibernateException, MalformedURLException, IOException, ServiceException	
	{
		try
		{
			updateInfoLock.lock();
			/*
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
			*/
		}
		finally
		{
			updateInfoLock.unlock();
		}
	}
	
	private String getFromCache(String url) throws MalformedURLException, IOException, ServiceException
	{
		cacheLock.lock();
		try
		{
			if (!cache.contains(url))
			{
				/*
				Pair<WebMapServer, Map<String, WMSLayer>> p = new Pair<>(
					new WebMapServer(new URL(url)), new HashMap<>());
				WMSCapabilities capabilities = p.getFirst().getCapabilities();
				for (Layer l : capabilities.getLayerList())
				{
					if (!Util.isEmptyString(l.getName()))
					{
						p.getSecond().put(l.getName(), new WMSLayer(capabilities, l));
					}
				}
				*/
				cache.put(url, url);
			}
			return cache.get(url);
		}
		finally
		{
			cacheLock.unlock();
		}
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
