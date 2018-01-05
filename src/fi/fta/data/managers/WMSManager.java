package fi.fta.data.managers;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.geotools.data.ows.Layer;
import org.geotools.data.ows.WMSCapabilities;
import org.geotools.data.wms.WebMapServer;
import org.geotools.data.wms.xml.MetadataURL;
import org.geotools.ows.ServiceException;
import org.hibernate.HibernateException;

import fi.fta.beans.WMS;
import fi.fta.beans.ui.WMSInfoUI;
import fi.fta.beans.ui.WMSUI;
import fi.fta.data.dao.CategoryDAO;
import fi.fta.data.dao.WMSDAO;
import fi.fta.utils.BeansUtils;
import fi.fta.utils.Util;

public class WMSManager extends CategoryBeanManager<WMS, WMSUI, WMSDAO>
{
	
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
	
	public List<String> verify(WMSUI ui) throws MalformedURLException, IOException, ServiceException
	{
		List<String> ret = new ArrayList<>();
		if (!Util.isEmptyString(ui.getUrl()))
		{
			StringBuffer url = new StringBuffer(ui.getUrl());
			if (ui.getUrl().toLowerCase().indexOf("language") < 0)
			{
				url.append(ui.getUrl().indexOf("?") < 0 ? "?" : "&").append("LANGUAGE=eng");
			}
			WebMapServer server = new WebMapServer(new URL(url.toString()));
			for (Layer l : server.getCapabilities().getLayerList())
			{
				if (!Util.isEmptyString(l.getName()))
				{
					ret.add(l.getName());
				}
			}
		}
		return ret;
	}
	
	public WMSInfoUI info(WMSUI ui) throws MalformedURLException, IOException, ServiceException
	{
		WMSInfoUI ret = new WMSInfoUI();
		if (!Util.isEmptyString(ui.getUrl()) && !Util.isEmptyString(ui.getName()))
		{
			StringBuffer url = new StringBuffer(ui.getUrl());
			if (ui.getUrl().toLowerCase().indexOf("language") < 0)
			{
				url.append(ui.getUrl().indexOf("?") < 0 ? "?" : "&").append("LANGUAGE=eng");
			}
			WebMapServer server = new WebMapServer(new URL(url.toString()));
			WMSCapabilities capabilities = server.getCapabilities();
			ret.setVersion(capabilities.getVersion());
			ret.setOrganisation(capabilities.getService().getContactInformation().getOrganisationName().toString());
			//ret.setLanguages();
			Layer l = BeansUtils.getLayerByName(capabilities, ui.getName());
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
	
}
