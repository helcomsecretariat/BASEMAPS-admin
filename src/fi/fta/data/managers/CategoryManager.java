package fi.fta.data.managers;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Function;

import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.MetaData;
import fi.fta.beans.ui.CategoryUI;
import fi.fta.data.dao.CategoryDAO;
import fi.fta.data.dao.MetaDataDAO;
import fi.fta.filters.GenericFilter;
import fi.fta.model.SiteModel;
import fi.fta.utils.Util;

/**
 * Manager of category objects
 * 
 * @author andrysta
 *
 */
public class CategoryManager extends CategoryBeanManager<Category, CategoryUI, CategoryDAO>
{
	
	protected static CategoryManager instance;
	
	
	private ReentrantLock cacheLock;
	
	private Map<Long, Category> cache;
	
	
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
		this.cacheLock = new ReentrantLock();
		this.cache = new HashMap<>();
	}
	
	/**
	 * Asynchronous initialization of all categories in application
	 */
	public void init()
	{
		new Thread(()->{
			cacheLock.lock();
			try
			{
				dao.getAll().forEach((c)->{
					cache.put(c.getId(), c);
				});
			}
			catch (HibernateException ex)
			{
				logger.error("CategoryManager.init", ex);
			}
			finally
			{
				cacheLock.unlock();
			}
		}).start();
	}
	
	/**
	 * Cache a category and all it's children
	 * @param c a category to be cached
	 */
	private void cache(Category c)
	{
		cacheLock.lock();
		try
		{
			cache.put(c.getId(), c);
			if (!Util.isEmptyCollection(c.getChildren()))
			{
				c.getChildren().forEach((child)->{
					this.cache(child);
				});
			}
		}
		finally
		{
			cacheLock.unlock();
		}
	}
	
	/**
	 * Filters cached categories by a matching function
	 * 
	 * @param match a matching function
	 * @return list of categories that match criterions
	 */
	private List<Category> filter(Function<Category, Boolean> match)
	{
		GenericFilter<Category> f = GenericFilter.create(match);
		List<Category> ret = f.filter(new ArrayList<>(cache.values()));
		Collections.sort(ret, (c1, c2)->{
			return Util.compareAsc(c1.getPosition(), c2.getPosition()); });
		return ret;
	}
	
	/**
	 * Give new positions in cached categories
	 * 
	 * @param id category database ID
	 * @param position a new position
	 */
	private void reposition(Long id, Integer newPosition, Integer oldPosition)
	{
		if (!Util.equalsWithNull(newPosition, oldPosition))
		{
			cacheLock.lock();
			try
			{
				if (cache.containsKey(id))
				{
					List<Category> l = null;
					if (cache.get(id).getParent() != null)
					{
						l = cache.get(id).getParent().getChildren();
					}
					else
					{
						l = this.filter((Category c)->{ return c.getParent() == null; });
					}
					if (!Util.isEmptyCollection(l))
					{
						l.forEach((c)->{
							if (!c.getId().equals(id))
							{
								if (newPosition != null && oldPosition != null && newPosition < oldPosition)
								{
									if (newPosition <= c.getPosition() && c.getPosition() < oldPosition)
									{
										c.setPosition(c.getPosition() + 1);
									}
								}
								else if (newPosition != null && oldPosition != null && newPosition > oldPosition)
								{
									if (oldPosition < c.getPosition() && c.getPosition() <= newPosition)
									{
										c.setPosition(c.getPosition() - 1);
									}
								}
								else if (newPosition != null)
								{
									if (c.getPosition() >= newPosition)
									{
										c.setPosition(c.getPosition() + 1);
									}
								}
								else
								{
									if (c.getPosition() >= oldPosition)
									{
										c.setPosition(c.getPosition() - 1);
									}
								}
							}
						});
					}
				}
			}
			finally
			{
				cacheLock.unlock();
			}
		}
	}
	
	@Override
	public Category get(Long id) throws HibernateException
	{
		cacheLock.lock();
		try
		{
			if (cache.containsKey(id))
			{
				return cache.get(id);
			}
			else
			{
				return super.get(id);
			}
		}
		finally
		{
			cacheLock.unlock();
		}
	}
	
	@Override
	public Long add(Category c) throws HibernateException
	{
		Long ret = super.add(c);
		if (c.getCreated() == null)
		{
			c.setCreated(Calendar.getInstance().getTime());
		}
		if (c.getChildren() == null)
		{
			c.setChildren(new ArrayList<>());
		}
		cacheLock.lock();
		try
		{
			cache.put(ret, c);
			this.reposition(ret, c.getPosition(), null);
			if (c.getParent() != null)
			{
				c.getParent().getChildren().add(c);
				Collections.sort(c.getParent().getChildren(), (c1, c2)->{
					return Util.compareAsc(c1.getPosition(), c2.getPosition());
				});
			}
		}
		finally
		{
			cacheLock.unlock();
		}
		return ret;
	}
	
	@Override
	public Category update(Category c) throws HibernateException
	{
		Category old = this.get(c.getId());
		cacheLock.lock();
		try
		{
			Integer oldPosition = old != null ? old.getPosition() : null;
			c = super.update(c);
			if (old != null && old.getCreated() != null)
			{
				c.setCreated(old.getCreated());
			}
			if (old != null && old.getChildren() != null)
			{
				c.setChildren(old.getChildren());
			}
			cache.put(c.getId(), c);
			this.reposition(c.getId(), c.getPosition(), oldPosition);
			return c;
		}
		finally
		{
			cacheLock.unlock();
		}
	}
	
	/**
	 * Get root categories
	 * 
	 * @return list of category objects
	 * @throws HibernateException database exception
	 */
	public List<Category> getRoot() throws HibernateException
	{
		cacheLock.lock();
		try
		{
			if (!cache.isEmpty())
			{
				return this.filter((Category c)->{ return c.getParent() == null; });
			}
			else
			{
				List<Category> ret = dao.getRoot();
				ret.forEach((c)->{
					this.cache(c);
				});
				return ret;
			}
		}
		finally
		{
			cacheLock.unlock();
		}
	}
	
	/**
	 * Get youngest categories (categories, that does not have other categories as children)
	 * 
	 * @return list of category objects
	 * @throws HibernateException database exception
	 */
	public List<Category> getYoungest() throws HibernateException
	{
		cacheLock.lock();
		try
		{
			if (!cache.isEmpty())
			{
				return this.filter((Category c)->{ return Util.isEmptyCollection(c.getChildren()); });
			}
			else
			{
				return dao.getYoungest();
			}
		}
		finally
		{
			cacheLock.unlock();
		}
	}
	
	public Boolean position(Long id, Integer position, SiteModel m) throws HibernateException
	{
		if (m.canWrite(id))
		{
			boolean updated = dao.position(id, position);
			if (updated)
			{
				cacheLock.lock();
				try
				{
					if (cache.containsKey(id))
					{
						Integer oldPosition = cache.get(id).getPosition();
						cache.get(id).setPosition(position);
						this.reposition(id, position, oldPosition);
					}
				}
				finally
				{
					cacheLock.unlock();
				}
			}
			return updated;
		}
		return null;
	}
	
	public Boolean delete(Long id, SiteModel m) throws HibernateException
	{
		if (m.canWrite(id))
		{
			Category c = this.get(id);
			if (c != null)
			{
				boolean deleted = dao.delete(id) > 0;
				if (deleted)
				{
					cacheLock.lock();
					try
					{
						if (cache.containsKey(id))
						{
							this.reposition(id, null, c.getPosition());
							cache.remove(id);
							if (c.getParent() != null)
							{
								c.getParent().getChildren().removeIf((r)->{ return r.getId().equals(id); });
							}
						}
					}
					finally
					{
						cacheLock.unlock();
					}
					CategoryBeanActionManager.getInstance().delete(c, m);
					this.decChildren(c.getParent() != null ? c.getParent().getId() : null);
				}
				return deleted;
			}
		}
		return null;
	}
	
	public Category getParent(Long id) throws HibernateException
	{
		cacheLock.lock();
		try
		{
			if (cache.containsKey(id))
			{
				return cache.get(id).getParent();
			}
			else
			{
				return dao.getParent(id);
			}
		}
		finally
		{
			cacheLock.unlock();
		}
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
				c.setParent(this.get(ui.getParent()));
			}
			Long id = this.add(c);
			if (id != null)
			{
				CategoryBeanActionManager.getInstance().add(c, m);
				this.incChildren(ui.getParent());
			}
			return id;
		}
		return null;
	}
	
	public Category update(CategoryUI ui, SiteModel m) throws HibernateException
	{
		if (m.canWrite(ui.getId()))
		{
			Category old = this.get(ui.getId());
			Category c = new Category(ui);
			if (ui.getParent() != null)
			{
				Category parent = this.get(ui.getParent());
				c.setParent(parent);
				boolean replaced = false;
				ListIterator<Category> it = parent.getChildren().listIterator();
				while (it.hasNext() && !replaced)
				{
					Category child = it.next();
					if (child.getId().equals(old.getId()))
					{
						it.set(c);
						replaced = true;
					}
				}
			}
			c = this.update(c);
			CategoryBeanActionManager.getInstance().update(c, m);
			if (old != null)
			{
				// update hibernate caches
				for (Category child : old.getChildren())
				{
					child.setParent(c);
				}
				if (!old.getMetadata().isEmpty())
				{
					Set<MetaData> remove = new TreeSet<>(
						(m1, m2) -> {return Util.compareAsc(m1.getId(), m2.getId());});
					remove.addAll(old.getMetadata());
					remove.removeAll(c.getMetadata());
					new MetaDataDAO().deleteAll(remove);
				}
			}
			return c;
		}
		return null;
	}
	
	@Override
	public void clear()
	{
		super.clear();
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
