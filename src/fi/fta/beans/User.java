package fi.fta.beans;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import fi.fta.beans.ui.UserRightUI;
import fi.fta.beans.ui.UserUI;
import fi.fta.utils.PasswordUtils;
import fi.fta.utils.Util;

@Entity
@Table(name="users")
public class User extends EmailBean implements Named
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -1963118022222682185L;
	
	protected String name;
	
	protected String password;
	
	@Enumerated(EnumType.STRING)
	protected UserRole role;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false, updatable=false)
	protected Date created;
	
	@Column(name = "login_count", insertable=false)
	protected Integer loginCount;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "last_login")
	protected Date lastLogin;
	
	@OneToMany(targetEntity=UserRight.class, cascade={CascadeType.ALL}, fetch=FetchType.EAGER)
	@JoinColumn(name = "user_id", nullable = false, updatable = false, insertable = true)
	@OrderBy("category_id")
	private List<UserRight> rights;
	
	
	public User()
	{
		super();
	}
	
	public User(Long id, String email)
	{
		super(id, email);
	}
	
	public User(Long id, String email, String password)
	{
		this(id, email);
		this.password = password;
	}
	
	public User(UserUI ui)
	{
		this(ui.getId(),
			ui.getEmail().trim().toLowerCase(),
			ui.getPassword() != null ? PasswordUtils.encode(ui.getPassword()) : null);
		this.setName(ui.getName());
		this.setRole(ui.getRole());
		this.setRights(new ArrayList<>());
		if (!Util.isEmptyCollection(ui.getRights()))
		{
			for (UserRightUI rui : ui.getRights())
			{
				this.getRights().add(new UserRight(rui));
			}
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

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public Integer getLoginCount() {
		return loginCount;
	}

	public void setLoginCount(Integer loginCount) {
		this.loginCount = loginCount;
	}

	public Date getLastLogin() {
		return lastLogin;
	}

	public void setLastLogin(Date lastLogin) {
		this.lastLogin = lastLogin;
	}

	public List<UserRight> getRights() {
		return rights;
	}

	public void setRights(List<UserRight> rights) {
		this.rights = rights;
	}
	
}
