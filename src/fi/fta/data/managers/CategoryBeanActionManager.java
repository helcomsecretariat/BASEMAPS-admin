package fi.fta.data.managers;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.UUID;

import org.apache.log4j.Logger;
import org.hibernate.HibernateException;

import fi.fta.beans.Category;
import fi.fta.beans.CategoryBeanAction;
import fi.fta.beans.Child;
import fi.fta.beans.DataAction;
import fi.fta.beans.LayerServiceType;
import fi.fta.beans.Named;
import fi.fta.beans.UserRole;
import fi.fta.beans.ui.CategoryBeanActionParamsUI;
import fi.fta.cache.TimeBasedCache;
import fi.fta.data.dao.CategoryBeanActionDAO;
import fi.fta.filters.CategoryBeanActionFilter;
import fi.fta.model.SiteModel;
import fi.fta.utils.DateAndTimeUtils;
import fi.fta.utils.HibernateUtil;
import fi.fta.utils.MailUtils;

/**
 * Manager for category actions, all events that change category tree
 * 
 * @author andrysta
 *
 */
public class CategoryBeanActionManager
{
	
	private static int ID_LENGTH = 6;
	private static int CACHE_SIZE_THRESHOLD = 20;
	private static long CACHE_TIME = 30 * 60 * 1000;
	private static long ACTION_SEND_FREQUENCY_MONTHS = 1;
	
	protected static Logger logger = Logger.getLogger(CategoryBeanActionManager.class);
	
	protected static CategoryBeanActionManager instance;
	
	public static CategoryBeanActionManager getInstance()
	{
		if (instance == null)
		{
			synchronized (CategoryBeanActionManager.class)
			{
				if (instance == null)
				{
					instance = new CategoryBeanActionManager();
				}
			}
		}
		return instance;
	}
	
	protected CategoryBeanActionManager()
	{
		dao = new CategoryBeanActionDAO();
		cache = new TimeBasedCache<>(
			CategoryBeanActionManager.CACHE_TIME,
			(values)->{
				try
				{
					dao.addAll(values);
				}
				catch (HibernateException ex)
				{
					logger.error("CategoryBeanActionManager.afterRemove()", ex);
				}
			});
	}
	
	protected CategoryBeanActionDAO dao;
	
	protected TimeBasedCache<String, CategoryBeanAction> cache;
	
	
	public void add(Category category, SiteModel model)
	{
		this.cache(new CategoryBeanAction(DataAction.ADD, category, model));
	}
	
	public void update(Category category, SiteModel model)
	{
		this.cache(new CategoryBeanAction(DataAction.UPDATE, category, model));
	}
	
	public void delete(Category category, SiteModel model)
	{
		this.cache(new CategoryBeanAction(DataAction.DELETE, category, model));
	}
	
	public List<CategoryBeanAction> get(CategoryBeanActionParamsUI ui) throws HibernateException
	{
		List<CategoryBeanAction> ret = new ArrayList<>();
		if (!cache.isEmpty())
		{
			ret.addAll(new CategoryBeanActionFilter(
				ui.getUserId(), ui.getUserRole(), ui.getFrom(), ui.getTill()).filter(
				cache.getElementsWithoutExtendingExpireTime()));
		}
		ret.addAll(dao.get(ui.getUserId(), ui.getUserRole(), ui.getFrom(), ui.getTill()));
		return ret;
	}
	
	public <T extends Named & Child> void add(
		LayerServiceType type, T service, SiteModel model)
	{
		Category parent = CategoryManager.getInstance().get(service.getParent());
		this.cache(new CategoryBeanAction(DataAction.ADD, type, service, parent, model));
	}
	
	public <T extends Named & Child> void update(
		LayerServiceType type, T service, SiteModel model)
	{
		Category parent = CategoryManager.getInstance().get(service.getParent());
		this.cache(new CategoryBeanAction(DataAction.UPDATE, type, service, parent, model));
	}
	
	public <T extends Named & Child> void delete(
		LayerServiceType type, T service, Category parent, SiteModel model)
	{
		this.cache(new CategoryBeanAction(DataAction.DELETE, type, service, parent, model));
	}
	
	private void cache(CategoryBeanAction action)
	{
		action.setId(CategoryBeanActionManager.id());
		action.setCreated(Calendar.getInstance().getTime());
		cache.put(action.getId() + DateAndTimeUtils.dateToDTF(action.getCreated()), action);
		if (cache.size() >= CategoryBeanActionManager.CACHE_SIZE_THRESHOLD)
		{
			dao.addAll(cache.removeAll());
		}
	}
	
	public void clear()
	{
		if (cache.size() > 0)
		{
			try
			{
				dao.addAll(cache.removeAll());
			}
			catch (HibernateException ex)
			{
				logger.error("CategoryBeanActionManager.clear()", ex);
			}
		}
	}
	
	private static String id()
	{
		return UUID.randomUUID().toString().substring(0, CategoryBeanActionManager.ID_LENGTH);
	}
	
	/**
	 * Sends emails to users that have right to get actions in category tree.
	 * 
	 * @param args process arguments (empty)
	 */
	public static void main(String[] args)
	{
		
		try
    	{
    		HibernateUtil.create();
    		
    		try
			{
				Logger.getRootLogger().info("CategoryBeanActionManager.main > send");
				CategoryBeanActionParamsUI params = new CategoryBeanActionParamsUI();
				params.setUserRole(UserRole.PROVIDER);
				params.setFrom(DateAndTimeUtils.asDate(
					LocalDate.now().minusMonths(CategoryBeanActionManager.ACTION_SEND_FREQUENCY_MONTHS)));
				final List<CategoryBeanAction> actions = CategoryBeanActionManager.getInstance().get(params);
				UserManager.getInstance().getWithActionsRight().forEach((user)->{
					MailUtils.sendActions(user, actions);
				});
			}
			catch (HibernateException ex)
			{
				Logger.getRootLogger().error("CategoryBeanActionManager.main.send > Fatal error", ex);
				ex.printStackTrace();
			}
    	}
    	catch (HibernateException ex)
    	{
    		Logger.getRootLogger().error("CategoryBeanActionManager.main.getConnection > Fatal error", ex);
    		ex.printStackTrace();
    	}
    	finally
    	{
    		try
			{
				HibernateUtil.close();
			}
			catch (HibernateException ex)
			{
				Logger.getRootLogger().error("CategoryBeanActionManager.main.finalize > Fatal error", ex);
			}
    	}
		
	}
	
}
