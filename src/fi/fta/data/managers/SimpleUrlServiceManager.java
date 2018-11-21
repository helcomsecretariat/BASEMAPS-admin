package fi.fta.data.managers;

import java.io.IOException;
import java.io.Serializable;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;

import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.dom4j.DocumentException;
import org.hibernate.HibernateException;

import fi.fta.beans.ArcGISService;
import fi.fta.beans.DownloadableService;
import fi.fta.beans.LayerService;
import fi.fta.beans.MetaData;
import fi.fta.beans.ui.LayerServiceUI;
import fi.fta.beans.ui.VerifyUI;
import fi.fta.data.dao.LayerServiceDAO;
import fi.fta.utils.Util;

/**
 * Data manager for services described by URL only.
 * These services do not have info part and only needs a valid URL, where data can be downloaded from.
 * 
 * @author andrysta
 *
 */
public class SimpleUrlServiceManager<S extends LayerService> extends ServiceManager<S, LayerServiceDAO<S>>
{
	
	protected static Logger logger = Logger.getLogger(SimpleUrlServiceManager.class);
	
	private Function<LayerServiceUI, S> converter;
	
	protected static SimpleUrlServiceManager<ArcGISService> ArcGISInstance;
	
	/**
	 * manager instance for ArcGIS services
	 * 
	 * @return service manager object
	 */
	public static SimpleUrlServiceManager<ArcGISService> getArcGISInstance()
	{
		if (ArcGISInstance == null)
		{
			synchronized (SimpleUrlServiceManager.class)
			{
				if (ArcGISInstance == null)
				{
					ArcGISInstance = new SimpleUrlServiceManager<ArcGISService>(
						ArcGISService.class, (ui) -> { return new ArcGISService(ui); });
				}
			}
		}
		return ArcGISInstance;
	}
	
	protected static SimpleUrlServiceManager<DownloadableService> downloadableInstance;
	
	/**
	 * manager instance for downloadable URL service
	 * 
	 * @return service manager object
	 */
	public static SimpleUrlServiceManager<DownloadableService> getDownloadableInstance()
	{
		if (downloadableInstance == null)
		{
			synchronized (SimpleUrlServiceManager.class)
			{
				if (downloadableInstance == null)
				{
					downloadableInstance = new SimpleUrlServiceManager<DownloadableService>(
						DownloadableService.class, (ui) -> { return new DownloadableService(ui); });
				}
			}
		}
		return downloadableInstance;
	}
	
	protected SimpleUrlServiceManager(Class<S> cls, Function<LayerServiceUI, S> converter)
	{
		super(new LayerServiceDAO<S>(cls), null);
		this.converter = converter;
	}
	
	public Long add(LayerServiceUI ui) throws Exception
	{
		return super.add(converter.apply(ui));
	}
	
	public S update(LayerServiceUI ui) throws Exception
	{
		return super.update(converter.apply(ui));
	}
	
	@Override
	protected void addMetaData(LayerServiceUI ui, List<MetaData> metadata) throws HibernateException
	{
		// operation is not available
	}
	
	@Override
	protected void updateMetaData(S service, List<MetaData> metadata) throws HibernateException
	{
		// operation is not available
	}
	
	/**
	 * Validate and verify given internet address if it's available online.
	 * Checks content type of available connection, returns it as name if appears known.
	 */
	public VerifyUI verify(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException
	{
		VerifyUI ret = new VerifyUI();
		if (!Util.isEmptyString(ui.getUrl()))
		{
			HttpURLConnection c = (HttpURLConnection)new URL(ui.getUrl()).openConnection();
			if (c.getResponseCode() == HttpServletResponse.SC_OK)
			{
				String type = c.getContentType();
				ret.setNames(new ArrayList<>());
				if (type != null)
				{
					ret.getNames().add(type);
				}
				ret.setOrganization("");
			}
			else
			{
				throw new IOException("Http code " + c.getResponseCode());
			}
		}
		return ret;
	}
	
	
	public <SUI extends Serializable> SUI info(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException
	{
		// operation is not available
		return null;
	}
	
	public void scheduleUpdateInfo(Long id)
	{
		// operation is not available
	}
	
}
