package fi.fta.beans.ui;


import java.util.ArrayList;
import java.util.List;

import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.Named;
import fi.fta.beans.User;
import fi.fta.beans.UserRight;
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
	
	private String organization;
	
	private String phone;
	
	private String position;
	
	private String country;
	
	private List<UserRightUI> rights;
	
	
	public UserUI()
	{}
	
	public UserUI(User user)
	{
		super(user);
		this.setName(user.getName());
		//this.setPassword(user.getPassword());
		this.setRole(user.getRole());
		//this.setUrl(url);
		this.setOrganization(user.getOrganization());
		this.setPhone(user.getPhone());
		this.setPosition(user.getPosition());
		this.setCountry(user.getCountry());
		this.setRights(new ArrayList<>());
		for (UserRight ur : user.getRights())
		{
			this.getRights().add(new UserRightUI(ur));
		}
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

	public String getOrganization() {
		return organization;
	}

	public void setOrganization(String organization) {
		this.organization = organization;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPosition() {
		return position;
	}

	public void setPosition(String position) {
		this.position = position;
	}
	
	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public List<UserRightUI> getRights() {
		return rights;
	}

	public void setRights(List<UserRightUI> rights) {
		this.rights = rights;
	}
	
}
