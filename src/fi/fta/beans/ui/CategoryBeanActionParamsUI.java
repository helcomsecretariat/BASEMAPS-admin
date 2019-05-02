package fi.fta.beans.ui;

import java.io.Serializable;
import java.util.Date;

import fi.fta.beans.UserRole;

public class CategoryBeanActionParamsUI implements Serializable
{

	/**
	 * 
	 */
	private static final long serialVersionUID = -4624258455234477833L;
	
	
	private Long userId;
	
	private UserRole userRole;
	
	private Date from;
	
	private Date till;
	
	
	public CategoryBeanActionParamsUI()
	{}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public UserRole getUserRole() {
		return userRole;
	}

	public void setUserRole(UserRole userRole) {
		this.userRole = userRole;
	}

	public Date getFrom() {
		return from;
	}

	public void setFrom(Date from) {
		this.from = from;
	}

	public Date getTill() {
		return till;
	}

	public void setTill(Date till) {
		this.till = till;
	}
	
}
