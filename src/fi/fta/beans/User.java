package fi.fta.beans;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import fi.fta.beans.ui.UserUI;
import fi.fta.utils.PasswordUtils;

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
	@Column(insertable=false)
	protected Date created;
	
	@Column(name = "login_count", insertable=false)
	protected Integer loginCount;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "last_login")
	protected Date lastLogin;
	
	
	public User()
	{
		super();
	}
	
	public User(String email, String password)
	{
		super(null, email);
		this.password = password;
	}
	
	public User(UserUI ui)
	{
		this(ui.getEmail().trim().toLowerCase(), PasswordUtils.encode(ui.getPassword()));
		this.setName(ui.getName());
		this.setRole(ui.getRole());
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
	
}
