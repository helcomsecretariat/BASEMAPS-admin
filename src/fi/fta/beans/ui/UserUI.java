package fi.fta.beans.ui;


import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.Named;
import fi.fta.beans.User;
import fi.fta.beans.UserRole;

public class UserUI extends EmailUI implements Named
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -6589585249430770294L;
	
	private String name;
	
	@NotBlank(message = "msg.validation.required")
	private String password;
	
	@NotNull(message = "msg.validation.required")
	private UserRole role;
	
	private String url;
	
	
	public UserUI()
	{}
	
	public UserUI(User user)
	{
		super(user);
		this.setName(user.getName());
		//this.setPassword(user.getPassword());
		this.setRole(user.getRole());
		//this.setUrl(url);
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

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}
	
}
