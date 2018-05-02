package fi.fta.data.managers;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.MetaData;
import fi.fta.beans.ui.CategoryUI;
import fi.fta.data.dao.CategoryDAO;
import fi.fta.data.dao.MetaDataDAO;
import fi.fta.model.SiteModel;
import fi.fta.utils.Util;

public class CategoryManager extends CategoryBeanManager<Category, CategoryUI, CategoryDAO>
{
	
	protected static CategoryManager instance;
	
	public static CategoryManager getInstance()
	{
		if (instance == null)
		{
			synchronized (CategoryManager.class)
			{
				if (instance == null)
				{
					instance = new CategoryManager();
				}
			}
		}
		return instance;
	}
	
	protected CategoryManager()
	{
		super(new CategoryDAO());
	}
	
	public List<Category> getRoot() throws HibernateException
	{
		return dao.getRoot();
	}
	
	public Boolean position(Long id, Integer position, SiteModel m) throws HibernateException
	{
		if (m.canWrite(id))
		{
			return dao.position(id, position);
		}
		return null;
	}
	
	public Boolean delete(Long id, SiteModel m) throws HibernateException
	{
		if (m.canWrite(id))
		{
			return dao.delete(id) > 0;
		}
		return null;
	}
	
	public Category getParent(Long id) throws HibernateException
	{
		return dao.getParent(id);
	}
	
	public CategoryUI getUI(Long id, SiteModel m) throws HibernateException
	{
		if (m.canRead(id))
		{
			Category c = this.get(id);
			return c != null ? new CategoryUI(c) : new CategoryUI();
		}
		return null;
	}
	
	public List<Category> getChildren(Long id) throws HibernateException
	{
		List<Category> ret = new ArrayList<>();
		Category root = this.get(id);
		if (root != null)
		{
			ret.addAll(root.getChildren());
		}
		return ret;
	}
	
	public Long add(CategoryUI ui, SiteModel m) throws HibernateException
	{
		if (m.canWrite(ui.getParent()))
		{
			Category c = new Category(ui);
			if (ui.getParent() != null)
			{
				c.setParent(dao.get(ui.getParent()));
			}
			return this.add(c);
		}
		return null;
	}
	
	public Category update(CategoryUI ui, SiteModel m) throws HibernateException
	{
		if (m.canWrite(ui.getId()))
		{
			Category c = new Category(ui);
			if (ui.getParent() != null)
			{
				c.setParent(dao.get(ui.getParent()));
			}
			Category old = dao.get(ui.getId());
			c = super.update(c);
			if (old != null && !old.getMetadata().isEmpty())
			{
				Set<MetaData> remove = new TreeSet<>(
					(m1, m2) -> {return Util.compareAsc(m1.getId(), m2.getId());});
				remove.addAll(old.getMetadata());
				remove.removeAll(c.getMetadata());
				new MetaDataDAO().deleteAll(remove);
			}
			return c;
		}
		return null;
	}
	
}
