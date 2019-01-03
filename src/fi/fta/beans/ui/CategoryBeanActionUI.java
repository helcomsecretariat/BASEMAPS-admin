package fi.fta.beans.ui;

import java.io.Serializable;
import java.util.Date;

import fi.fta.beans.CategoryBeanAction;
import fi.fta.beans.DataAction;
import fi.fta.beans.Named;
import fi.fta.beans.UserRole;

public class CategoryBeanActionUI implements Serializable, Named
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 3305621583168464340L;
	
	
	private String id;

	private Date created;
	
	private DataAction action;
	
	private String kind;
	
	private String path;
	
	private Long userId;
	
	private String name;
	
	private String email;
	
	private UserRole role;
	
	
	public CategoryBeanActionUI()
	{}
	
	public CategoryBeanActionUI(CategoryBeanAction bean)
	{
		this.setId(bean.getId());
		this.setCreated(bean.getCreated());
		this.setAction(bean.getAction());
		this.setKind(bean.getKind());
		this.setPath(bean.getPath());
		this.setUserId(bean.getUserId());
		this.setName(bean.getName());
		this.setEmail(bean.getEmail());
		this.setRole(bean.getRole());
	}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public DataAction getAction() {
		return action;
	}

	public void setAction(DataAction action) {
		this.action = action;
	}

	public String getKind() {
		return kind;
	}

	public void setKind(String kind) {
		this.kind = kind;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public UserRole getRole() {
		return role;
	}

	public void setRole(UserRole role) {
		this.role = role;
	}
	
}
