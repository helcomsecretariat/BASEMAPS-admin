package fi.fta.beans;


import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import fi.fta.utils.DateAndTimeUtils;

/**
 * 
 * Password reset token bean created on password reset and must be evaluated for password change.
 * 
 * @author andrysta
 */

@Entity
@Table(name="password_reset_tokens")
public class PasswordResetToken extends IdBean
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1484016518659106177L;
	
	private static final int VALID_HOURS = 6;
	
	@Column(name = "user_id", updatable = false)
	private Long userId;
	
	private String browser;
	
	private String ip;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(insertable=false, updatable=false)
	private Date created;
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(updatable=false)
	private Date expire;
	
	private String code;
	
	private Boolean finished;
	
	
	public PasswordResetToken()
	{
		super();
	}
	
	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public String getBrowser() {
		return browser;
	}

	public void setBrowser(String browser) {
		this.browser = browser;
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	public Date getExpire() {
		return expire;
	}

	public void setExpire(Date expire) {
		this.expire = expire;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public Boolean getFinished() {
		return finished;
	}

	public void setFinished(Boolean finished) {
		this.finished = finished;
	}
	
	public void setDates()
	{
		LocalDateTime now = LocalDateTime.now();
		this.setCreated(DateAndTimeUtils.asDate(now));
		this.setExpire(DateAndTimeUtils.asDate(now.plusHours(PasswordResetToken.VALID_HOURS)));
	}
	
	public boolean valid()
	{
		return finished == null && expire.after(Calendar.getInstance().getTime());
	}
	
}
