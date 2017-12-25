package fi.fta.data.dao;

import fi.fta.beans.User;

public class UserDAO extends SimpleIdTableDAO<User>
{
	
	public UserDAO()
	{
		super(User.class);
	}
	
}
