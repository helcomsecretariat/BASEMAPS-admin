package fi.fta.beans;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import fi.fta.model.SiteModel;


@Entity
@Table(name="categories_actions")
public class CategoryBeanAction implements Serializable, Identifiable<String>, Named
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 2047239039509271100L;
	private static final String CATEGORY_KIND = "CATEGORY";
	
	
	@Id
	protected String id;
	
	/**
	 * Create time
	 */
	@Id
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false, updatable=false)
	protected Date created;
	
	@Enumerated(EnumType.STRING)
	protected DataAction action;
	
	protected String kind;
	
	protected String path;
	
	@Column(name = "user_id")
	protected Long userId;
	
	protected String name;
	
	protected String email;
	
	@Enumerated(EnumType.STRING)
	protected UserRole role;
	
	
	public CategoryBeanAction()
	{}
	
	public CategoryBeanAction(SiteModel model)
	{
		this();
		this.userId = model.getUserId();
		this.name = model.getUserName();
		this.email = model.getUserEmail();
		this.role = model.getUserRole();
	}
	
	public CategoryBeanAction(DataAction action, Category category, SiteModel model)
	{
		this(model);
		this.action = action;
		this.kind = CategoryBeanAction.CATEGORY_KIND;
		this.path = this.getPath(category);
	}
	
	public <T extends Named & Child> CategoryBeanAction(
		DataAction action, LayerServiceType type, T service, Category parent, SiteModel model)
	{
		this(model);
		this.action = action;
		this.kind = type.name();
		StringBuilder path = new StringBuilder(
			service.getName() != null ? service.getName() : "-");
		if (service.getParent() != null)
		{
			path.insert(0, " -> ");
		}
		path.insert(0, this.getPath(parent));
		this.path = path.toString();
	}
	
	private String getPath(Category c)
	{
		StringBuilder path = new StringBuilder();
		Category p = c;
		while (p != null)
		{
			path.insert(0, p.getLabel());
			if (p.getParent() != null)
			{
				path.insert(0, " -> ");
			}
			p = p.getParent();
		}
		return path.toString();
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
