package fi.fta.model;

import fi.fta.beans.User;

public class UserModel
{
	
	protected User user;
	
	public UserModel()
	{}
	
	public UserModel(User user)
	{
		this.user = user;
	}
	
	public void logout()
	{
		this.user = null;
	}
	
	public User getUser()
	{
		return user;
	}
	
	public String getUserName()
	{
		return user != null ? user.getName() : null;
	}
	
}
