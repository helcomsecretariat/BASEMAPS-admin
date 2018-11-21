package fi.fta.beans.ui;


import java.util.Set;

import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.RightType;
import fi.fta.beans.UserRight;

public class UserRightUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -1123671666598350212L;
	
	
	@NotBlank(message = "msg.validation.required")
	private Long userId;
	
	private Long categoryId;
	
	private Set<RightType> rights;
	
	
	public UserRightUI()
	{}
	
	public UserRightUI(UserRight right)
	{
		super(right);
		this.setUserId(right.getUserId());
		this.setCategoryId(right.getCategoryId());
		this.setRights(right.getRights());
	}
	
	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public Long getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(Long categoryId) {
		this.categoryId = categoryId;
	}

	public Set<RightType> getRights() {
		return rights;
	}

	public void setRights(Set<RightType> rights) {
		this.rights = rights;
	}
	
}
