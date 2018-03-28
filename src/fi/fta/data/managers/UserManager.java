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
	
	public List<User> getByRole(UserRole role) throws HibernateException
	{
		return dao.getByField("role", role);
	}
	
	public Long add(User user) throws HibernateException
	{
		return dao.add(user).getId();
	}
	
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
	
	public User update(User user) throws HibernateException
	{
		return dao.update(user);
	}
	
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
	
	public boolean delete(Long id) throws HibernateException
	{
		return dao.delete(id) > 0;
	}
	
	public void add(UserRightUI ui) throws HibernateException
	{
		new UserRightDAO().add(new UserRight(ui));
	}
	
}
