package fi.fta.data.managers;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import org.hibernate.HibernateException;

import fi.fta.beans.RightType;
import fi.fta.beans.User;
import fi.fta.beans.UserRight;
import fi.fta.beans.UserRole;
import fi.fta.beans.ui.UserRightUI;
import fi.fta.beans.ui.UserUI;
import fi.fta.data.dao.UserDAO;
import fi.fta.data.dao.UserRightDAO;
import fi.fta.utils.Util;

/**
 * Data manager of user objects
 * 
 * @author andrysta
 *
 */
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
	
	/**
	 * Get user object
	 * 
	 * @param id database ID of user object
	 * @return user object
	 * @throws HibernateException database exception
	 */
	public User get(Long id) throws HibernateException
	{
		return dao.get(id);
	}
	
	/**
	 * Check if database already contains given email
	 * 
	 * @param email email to check
	 * @return true if database already contains a user with given email
	 * @throws HibernateException database exception
	 */
	public boolean containsByEmail(String email) throws HibernateException
	{
		return dao.containsByField("email", email.trim().toLowerCase());
	}
	
	/**
	 * Retrieve user by given email
	 * 
	 * @param email email to get
	 * @return user object with given email
	 * @throws HibernateException database exception
	 */
	public User getByEmail(String email) throws HibernateException
	{
		List<User> list = dao.getByField("email", email.trim().toLowerCase());
		return list.isEmpty() ? null : list.get(0);
	}
	
	/**
	 * Retrieve users by user role.
	 * 
	 * @param role user role like administrator or data provider
	 * @return list of user objects having particular role
	 * @throws HibernateException database exception
	 */
	public List<User> getByRole(UserRole role) throws HibernateException
	{
		return dao.getByField("role", role);
	}
	
	/**
	 * Add new user to the database.
	 * 
	 * @param user user object
	 * @return database ID for user
	 * @throws HibernateException database exception
	 */
	public Long add(User user) throws HibernateException
	{
		return dao.add(user).getId();
	}
	
	/**
	 * Add new user to database from user input (JSON wrapper)
	 * 
	 * @param ui JSON wrapper of user object
	 * @return database ID for user
	 * @throws HibernateException database exception
	 */
	public Long add(UserUI ui) throws HibernateException
	{
		User u = new User(ui);
		if (u.getRole() == UserRole.ADMIN && Util.isEmptyCollection(u.getRights()))
		{
			UserRight r = new UserRight();
			r.setRights(new HashSet<>());
			r.getRights().add(RightType.r);
			r.getRights().add(RightType.w);
			if (u.getRights() == null)
			{
				u.setRights(new ArrayList<>());
			}
			u.getRights().add(r);
		}
		return this.add(u);
	}
	
	/**
	 * Update existing user in the database
	 * 
	 * @param user user object
	 * @return the same user object
	 * @throws HibernateException database exception
	 */
	public User update(User user) throws HibernateException
	{
		return dao.update(user);
	}
	
	/**
	 * Update existing user in the database from user input (JSON wrapper)
	 * 
	 * @param ui JSON wrapper of user object
	 * @return user object
	 * @throws HibernateException database exception
	 */
	public User update(UserUI ui) throws HibernateException
	{
		User u = new User(ui);
		User old = dao.get(ui.getId());
		if (old != null)
		{
			if (u.getPassword() == null)
			{
				u.setPassword(old.getPassword());
			}
			u.setLastLogin(old.getLastLogin());
			u.setLoginCount(old.getLoginCount());
			u = dao.update(u);
			if (!old.getRights().isEmpty())
			{
				Set<UserRight> remove = new TreeSet<>(
					(r1, r2) -> {return Util.compareAsc(r1.getId(), r2.getId());});
				remove.addAll(old.getRights());
				remove.removeAll(u.getRights());
				new UserRightDAO().deleteAll(remove);
			}
		}
		return u;
	}
	
	/**
	 * Erase user from database.
	 * 
	 * @param id database ID of user object
	 * @return true if user was deleted
	 * @throws HibernateException database exception
	 */
	public boolean delete(Long id) throws HibernateException
	{
		return dao.delete(id) > 0;
	}
	
	/**
	 * Add user right to database from JSON wrapper (user input).
	 * 
	 * @param ui JSON object of user right
	 * @return user object with updated rights
	 * @throws HibernateException database exception
	 */
	public User add(UserRightUI ui) throws HibernateException
	{
		User u = this.get(ui.getUserId());
		if (u != null)
		{
			if (u.getRights() == null)
			{
				u.setRights(new ArrayList<>());
			}
			u.getRights().add(new UserRight(ui));
			return dao.update(u);
		}
		return null;
	}
	
	/**
	 * Get list of users who have right to get actions of categories (has right 'a').
	 * 
	 * @return list of user objects having right 'a'.
	 * @throws HibernateException database exception
	 */
	public List<User> getWithActionsRight() throws HibernateException
	{
		return dao.getWithActionsRight();
	}
	
}
