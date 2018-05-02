package fi.fta.data.dao;

import org.hibernate.HibernateException;
import org.hibernate.type.StringType;

import fi.fta.beans.User;
import fi.fta.beans.ui.LoginUI;
import fi.fta.utils.PasswordUtils;

public class UserDAO extends SimpleIdTableDAO<User>
{
	
	public UserDAO()
	{
		super(User.class);
	}
	
	public boolean containsByEmail(String email) throws HibernateException
	{
		return this.containsByField("email", email);
	}
	
	public User login(LoginUI login) throws HibernateException
	{
		StringBuilder sb = new StringBuilder("from ").append(this.getEntityName());
		sb.append(" where email = :email and password = :password");
		return new DAOSelectUniqueQueryUtil<User>(this.getCurrentSession(), sb.toString(), User.class)
			.setParameter("email", login.getEmail().trim().toLowerCase(), StringType.INSTANCE)
			.setParameter("password", PasswordUtils.encode(login.getPassword()), StringType.INSTANCE)
			.executeQuery();
	}
	
}
