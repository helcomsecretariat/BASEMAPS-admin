package fi.fta.beans;

import java.io.Serializable;

public class User implements Serializable, Named
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -1963118022222682185L;

	protected String name;
	
	protected String password;
	
	public User()
	{}
	
	public User(String name, String password)
	{
		this.name = name;
		this.password = password;
	}
	
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
	
}
