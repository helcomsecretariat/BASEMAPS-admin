package fi.fta.data.managers;

import java.io.IOException;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.util.List;
import java.util.Set;

import org.dom4j.DocumentException;
import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.LayerService;
import fi.fta.beans.LayerServiceType;
import fi.fta.beans.MetaData;
import fi.fta.beans.MetaDataSource;
import fi.fta.beans.ui.LayerServiceUI;
import fi.fta.beans.ui.VerifyUI;
import fi.fta.data.dao.LayerServiceDAO;
import fi.fta.data.dao.MetaDataDAO;
import fi.fta.filters.MetaDataSourceFilter;
import fi.fta.model.SiteModel;
import fi.fta.utils.BeansUtils;
import fi.fta.utils.CollectionsUtils;

/**
 * Super manager for operations on different services.
 * 
 * @author andrysta
 *
 * @param <S> service data object
 * @param <D> data acces object
 */
public abstract class ServiceManager<S extends LayerService, D extends LayerServiceDAO<S>> extends CategoryBeanManager<S, LayerServiceUI, D>
{
	
	private LayerServiceType type;
	
	private MetaDataSource source;
	
	public ServiceManager(D dao, LayerServiceType type, MetaDataSource source)
	{
		super(dao);
		this.type = type;
		this.source = source;
	}
	
	public Boolean position(Long id, Integer position, SiteModel m) throws HibernateException
	{
		Category c = this.getParent(id);
		if (m.canWrite(c != null ? c.getId() : null))
		{
			return dao.position(id, position);
		}
		return null;
	}
	
	public Boolean delete(Long id, SiteModel m) throws HibernateException
	{
		Category c = this.getParent(id);
		if (m.canWrite(c != null ? c.getId() : null))
		{
			S s = this.get(id);
			boolean deleted = dao.delete(id) > 0;
			if (deleted)
			{
				CategoryBeanActionManager.getInstance().delete(type, s, c, m);
				this.decChildren(c.getParent() != null ? c.getParent().getId() : null);
			}
			return deleted;
		}
		return null;
	}
	
	public Category getParent(Long id) throws HibernateException
	{
		return dao.getParent(id);
	}
	
	public LayerServiceUI getUI(Long id, SiteModel m) throws HibernateException
	{
		S s = this.get(id);
		if (s == null)
		{
			return new LayerServiceUI();
		}
		else if (m.canRead(s.getParent()))
		{
			return new LayerServiceUI(s);
		}
		return null;
	}
	
	public Long add(LayerServiceUI ui, SiteModel m) throws Exception
	{
		if (m.canWrite(ui.getParent()))
		{
			Long id = this.add(ui);
			if (id != null)
			{
				CategoryBeanActionManager.getInstance().add(type, ui, m);
				this.incChildren(ui.getParent());
			}
			return id;
		}
		return null;
	}
	
	public S update(LayerServiceUI ui, SiteModel m) throws Exception
	{
		if (m.canWrite(ui.getParent()))
		{
			CategoryBeanActionManager.getInstance().update(type, ui, m);
			return this.update(ui);
		}
		return null;
	}
	
	/**
	 * Helper method adding metadata to services.
	 * Actually, metadata is added to categories that are parents of particular service.
	 * 
	 * @param ui wrapper of service object where actually only service parent field is used
	 * @param metadata list of metadata objects
	 * @throws HibernateException database exception
	 */
	protected void addMetaData(LayerServiceUI ui, List<MetaData> metadata) throws HibernateException
	{
		if (!metadata.isEmpty())
		{
			Category c = CategoryManager.getInstance().get(ui.getParent());
			if (c != null)
			{
				if (!c.getMetadata().isEmpty())
				{
					for (MetaData md : metadata)
					{
						if (!BeansUtils.contains(c.getMetadata(), md))
						{
							c.getMetadata().add(md);
						}
					}
				}
				else
				{
					c.getMetadata().addAll(metadata);
				}
				CategoryManager.getInstance().update(c);
			}
		}
	}
	
	/**
	 * Helper method updating metadata objects in particular service.
	 * Since metadata is attached to categories only, the parent category of the service is used.
	 * 
	 * @param service service object, where only parent field is used
	 * @param metadata list of updated metadata objects
	 * @throws HibernateException database exception
	 */
	protected void updateMetaData(S service, List<MetaData> metadata) throws HibernateException
	{
		Category c = CategoryManager.getInstance().get(service.getParent());
		if (c != null)
		{
			Set<MetaData> current = new MetaDataSourceFilter(source).filter(c.getMetadata());
			Set<MetaData> toRemove = CollectionsUtils.removeAllByUrl(current, metadata);
			Set<MetaData> toAdd = CollectionsUtils.removeAllByUrl(metadata, current);
			c.getMetadata().removeAll(toRemove);
			for (MetaData md : c.getMetadata())
			{
				if (md.getSource().equals(source))
				{
					MetaData u = CollectionsUtils.getByUrl(md.getUrl(), metadata);
					if (u != null)
					{
						md.setFormat(u.getFormat());
					}
				}
			}
			c.getMetadata().addAll(toAdd);
			CategoryManager.getInstance().update(c);
			if (!toRemove.isEmpty())
			{
				new MetaDataDAO().deleteAll(toRemove);
			}
		}
	}
	
	/**
	 * Add service to database from service wrapper object from user input.
	 * 
	 * @param ui JSON wrapper of service object
	 * @return database ID for service
	 * @throws Exception exception
	 */
	public abstract Long add(LayerServiceUI ui) throws Exception;
	
	/**
	 * Update existing service in the database from service wrapper object.
	 * 
	 * @param ui JSON wrapper of service object
	 * @return service object
	 * @throws Exception exception
	 */
	public abstract S update(LayerServiceUI ui) throws Exception;
	
	/**
	 * Verify remote service which is not in the database yet.
	 * The service later is available for inserting into BASEMAPS database.
	 * 
	 * @param ui JSON wrapper of service object, however only name and/or URL fields is used
	 * @return JSON wrapper for verify object which consists of available names and organization (service owner).
	 * @throws MalformedURLException remote exception
	 * @throws IOException input exception
	 * @throws DocumentException XML exception
	 */
	public abstract VerifyUI verify(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException;
	
	/**
	 * Extracts information from the remote valid service taking service name and URL.
	 * The service is not added to BASEMAPS database yet.
	 * 
	 * @param ui JSON wrapper of service object, however only name and/or URL fields is used
	 * @param <SUI> JSON wrapper object
	 * @return JSON wrapper of service object
	 * @throws MalformedURLException remote exception
	 * @throws IOException input exception
	 * @throws DocumentException XML exception
	 */
	public abstract <SUI extends Serializable> SUI info(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException;
	
	/**
	 * Schedules update of service from remote source. The service must be already in a database.
	 * Update is only scheduled if meets provided conditions for particular service.
	 * 
	 * @param id database ID of service for update
	 */
	public abstract void scheduleUpdateInfo(Long id);
	
}
