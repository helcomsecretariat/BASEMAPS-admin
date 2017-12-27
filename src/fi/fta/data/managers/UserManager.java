package fi.fta.data.managers;

import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.User;
import fi.fta.beans.ui.UserUI;
import fi.fta.data.dao.UserDAO;

public class UserManager
{
	
	protected UserDAO dao;
	
	protected static UserManager instance;
	
	public static UserManager getInstance()
	{
		if (instance == null)
		{
			synchronized (UserManager.class)
			{
				if (instance == null)
				{
					instance = new UserManager();
				}
			}
		}
		return instance;
	}
	
	protected UserManager()
	{
		dao = new UserDAO();
	}
	
	
	public User get(Long id) throws HibernateException
	{
		return dao.get(id);
	}
	
	public boolean containsByEmail(String email) throws HibernateException
	{
		return dao.containsByField("email", email.trim().toLowerCase());
	}
	
	public User getByEmail(String email) throws HibernateException
	{
		List<User> list = dao.getByField("email", email.trim().toLowerCase());
		return list.isEmpty() ? null : list.get(0);
	}
	
	public Long add(User user) throws HibernateException
	{
		return dao.add(user).getId();
	}
	
	public Long add(UserUI ui) throws HibernateException
	{
		return this.add(new User(ui));
	}
	
	public User update(User user) throws HibernateException
	{
		return dao.update(user);
	}
	
	public boolean delete(Long id) throws HibernateException
	{
		return dao.delete(id) > 0;
	}
	
}
