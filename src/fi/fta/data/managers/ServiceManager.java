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

public abstract class ServiceManager<S extends LayerService, D extends LayerServiceDAO<S>> extends CategoryBeanManager<S, LayerServiceUI, D>
{
	
	private MetaDataSource source;
	
	public ServiceManager(D dao, MetaDataSource source)
	{
		super(dao);
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
			return dao.delete(id) > 0;
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
	
	public List<S> getChildren(Long id) throws HibernateException
	{
		return dao.getByParent(id);
	}
	
	public Long add(LayerServiceUI ui, SiteModel m) throws Exception
	{
		if (m.canWrite(ui.getParent()))
		{
			return this.add(ui);
		}
		return null;
	}
	
	public S update(LayerServiceUI ui, SiteModel m) throws Exception
	{
		if (m.canWrite(ui.getParent()))
		{
			return this.update(ui);
		}
		return null;
	}
	
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
	
	public abstract Long add(LayerServiceUI ui) throws Exception;
	
	public abstract S update(LayerServiceUI ui) throws Exception;
	
	public abstract VerifyUI verify(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException;
	
	public abstract <SUI extends Serializable> SUI info(LayerServiceUI ui) throws MalformedURLException, IOException, DocumentException;
	
	public abstract void scheduleUpdateInfo(Long id);
	
}
