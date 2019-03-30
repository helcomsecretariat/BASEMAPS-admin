package fi.fta.data.managers;

import org.hibernate.HibernateException;

import fi.fta.beans.PasswordResetToken;
import fi.fta.cache.TimeBasedCache;
import fi.fta.data.dao.PasswordResetTokenDAO;
import fi.fta.utils.PasswordUtils;


public class PasswordResetTokenManager
{
	
	//private static Logger logger = Logger.getLogger(PasswordResetTokenManager.class);
	
	private static final long CACHE_TIME = 60 * 60 * 1000;
	

	private PasswordResetTokenDAO dao;
	
	private TimeBasedCache<Long, PasswordResetToken> cache;
	
	protected static PasswordResetTokenManager instance;
	
	public static PasswordResetTokenManager getInstance()
	{
		if (instance == null)
		{
			synchronized (PasswordResetTokenManager.class)
			{
				if (instance == null)
				{
					instance = new PasswordResetTokenManager();
				}
			}
		}
		return instance;
	}
	
	protected PasswordResetTokenManager()
	{
		dao = new PasswordResetTokenDAO();
		cache = new TimeBasedCache<>(PasswordResetTokenManager.CACHE_TIME);
	}
	
	public PasswordResetToken get(Long id) throws HibernateException
	{
		if (!cache.contains(id))
		{
			PasswordResetToken token = dao.get(id);
			if (token != null)
			{
				cache.put(token.getId(), token);
			}
		}
		return cache.get(id);
	}
	
	public PasswordResetToken getBean(Long id) throws HibernateException
	{
		return dao.get(id);
	}
	
	public Long add(PasswordResetToken bean) throws HibernateException
	{
		bean = dao.add(bean);
		cache.put(bean.getId(), bean);
		return bean.getId();
	}
	
	public PasswordResetToken add(Long userId, String browser, String ip) throws HibernateException
	{
		PasswordResetToken token = new PasswordResetToken();
		token.setUserId(userId);
		token.setBrowser(browser);
		token.setIp(ip);
		token.setDates();
		token.setCode(PasswordUtils.generate(16));
		this.add(token);
		return token;
	}
	
	public boolean delete(PasswordResetToken bean) throws HibernateException
	{
		cache.remove(bean.getId());
		return dao.delete(bean.getId()) > 0;
	}
	
	public PasswordResetToken update(PasswordResetToken bean) throws HibernateException
	{
		bean = dao.update(bean);
		cache.put(bean.getId(), bean);
		return bean;
	}
	
	public PasswordResetToken finish(Long id, boolean confirm) throws HibernateException
	{
		dao.finish(id, confirm);
		PasswordResetToken token = this.get(id);
		token.setFinished(confirm);
		//token.setExpire(Calendar.getInstance().getTime());
		return token;
	}
	
	public void clear()
	{
		cache.clear();
	}
	
}
