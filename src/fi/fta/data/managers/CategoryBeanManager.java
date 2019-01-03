package fi.fta.data.managers;

import java.util.List;

import org.apache.log4j.Logger;
import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.CategoryBean;
import fi.fta.beans.ui.CategoryBeanUI;
import fi.fta.cache.TimeBasedCache;
import fi.fta.data.dao.CategoryBeanDAO;
import fi.fta.model.SiteModel;

/**
 * Super class for management of category related object - categories and services.
 * Usually operations will depend on current user, that means, are allowed if current user
 * has rights.
 * 
 * @author andrysta
 *
 * @param <C> database wrapper
 * @param <UI> wrapper for front-end (JSON)
 * @param <D> data access object
 */
public abstract class CategoryBeanManager<C extends CategoryBean, UI extends CategoryBeanUI, D extends CategoryBeanDAO<C>>
{
	
	/**
	 * Time in milliseconds to keep count of children in application cache.
	 */
	private static long CHILDREN_COUNT_CACHE_TIME = 10 * 60 * 1000;
	
	protected static Logger logger = Logger.getLogger(CategoryBeanManager.class);
	
	
	protected D dao;
	
	protected TimeBasedCache<Long, Integer> children;
	
	
	public CategoryBeanManager(D dao)
	{
		this.dao = dao;
		this.children = new TimeBasedCache<>(CategoryBeanManager.CHILDREN_COUNT_CACHE_TIME);
	}
	
	/**
	 * Increase count of children.
	 * 
	 * @param parent database ID of parent category
	 * @throws HibernateException database exception database exception
	 */
	protected void incChildren(Long parent)
	{
		if (children.contains(parent))
		{
			Integer count = children.getElementWithoutExtendingExpireTime(parent);
			if (count != null)
			{
				children.put(parent, new Integer(count + 1));
			}
		}
	}
	
	/**
	 * Decrease count of children.
	 * 
	 * @param parent database ID of parent category
	 * @throws HibernateException database exception database exception
	 */
	protected void decChildren(Long parent)
	{
		if (children.contains(parent))
		{
			Integer count = children.getElementWithoutExtendingExpireTime(parent);
			if (count != null && count > 0)
			{
				children.put(parent, new Integer(count - 1));
			}
			else if (count != null)
			{
				children.remove(parent);
			}
		}
	}
	
	/**
	 * Get category related object from database.
	 * 
	 * @param id database ID
	 * @return Category related object
	 * @throws HibernateException database exception database exception
	 */
	public C get(Long id) throws HibernateException
	{
		return dao.get(id);
	}
	
	/**
	 * Add new category related object to database.
	 * 
	 * @param c category related object
	 * @return database ID
	 * @throws HibernateException database exception
	 */
	public Long add(C c) throws HibernateException
	{
		return dao.add(c).getId();
	}
	
	/**
	 * Update existing category related object in the database.
	 * 
	 * @param c category related object
	 * @return the same category related object
	 * @throws HibernateException database exception
	 */
	public C update(C c) throws HibernateException
	{
		return dao.update(c);
	}
	
	/**
	 * Reposition category related object in a queue of parent category.
	 * 
	 * @param id database ID of category related object
	 * @param position new position in the queue
	 * @param m site model to get current user information
	 * @return has position changed or not
	 * @throws HibernateException database exception
	 */
	public abstract Boolean position(Long id, Integer position, SiteModel m) throws HibernateException;
	
	/**
	 * Delete category related object from the database.
	 * 
	 * @param id database ID of category related object
	 * @param m site model to get current user information
	 * @return is object deleted or not
	 * @throws HibernateException database exception
	 */
	public abstract Boolean delete(Long id, SiteModel m) throws HibernateException;
	
	/**
	 * Get parent of category related object.
	 * 
	 * @param id database ID of category related object
	 * @return category object that is the parent of the one with given ID
	 * @throws HibernateException database exception
	 */
	public abstract Category getParent(Long id) throws HibernateException;
	
	/**
	 * Retrieve JSON wrapper for category related object.
	 * 
	 * @param id database ID of category related object
	 * @param m site model to get current user information
	 * @return wrapper of category related object for JSON
	 * @throws HibernateException database exception
	 */
	public abstract UI getUI(Long id, SiteModel m) throws HibernateException;
	
	/**
	 * Retrieve children of identified category related object.
	 * 
	 * @param id database ID of category related object
	 * @return list of category related objects
	 * @throws HibernateException database exception
	 */
	public List<C> getChildren(Long id) throws HibernateException
	{
		return dao.getByParent(id);
	}
	
	/**
	 * Retrieve children of identified category related object.
	 * 
	 * @param id database ID of category related object
	 * @return list of category related objects
	 * @throws HibernateException database exception
	 */
	public int countChildren(Long id) throws HibernateException
	{
		if (children.isEmpty())
		{
			children.putAll(dao.countByParent());
		}
		return children.contains(id) ? children.getElementWithoutExtendingExpireTime(id) : 0;
	}
	
	/**
	 * Add a new category related object from user input.
	 * 
	 * @param ui wrapper of category related object for JSON from user input
	 * @param m site model to get current user information
	 * @return database ID of newly created category related object
	 * @throws Exception database exception
	 */
	public abstract Long add(UI ui, SiteModel m) throws Exception;
	
	/**
	 * Update existing category related object from user input.
	 * 
	 * @param ui wrapper of category related object for JSON from user input
	 * @param m site model to get current user information
	 * @return category related object
	 * @throws Exception database exception
	 */
	public abstract C update(UI ui, SiteModel m) throws Exception;
	
	/**
	 * Clear children counts cache
	 */
	public void clear()
	{
		children.clear();
	}
	
}
