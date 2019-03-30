package fi.fta.beans.ui;

import java.util.Date;

import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.PasswordResetToken;
import fi.fta.utils.PasswordUtils;


public class PasswordResetTokenUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -8672318960400139246L;
	
	private String browser;
	
	private String ip;
	
	private Date created;
	
	private Date expire;
	
	private String code;
	
	private Boolean finished;
	
	@NotBlank(message = "msg.validation.password.reset.notValid")
	private String key;
	
	@NotBlank(message = "msg.validation.password.empty.newPassword")
	private String newPassword;
	
	private String repeatedPassword;
	
	private Boolean visible;
	
	
	public PasswordResetTokenUI()
	{}
	
	public PasswordResetTokenUI(PasswordResetToken token)
	{
		this.setId(token.getId());
		this.setBrowser(token.getBrowser());
		this.setIp(token.getIp());
		this.setCreated(token.getCreated());
		this.setExpire(token.getExpire());
		this.setCode(token.getCode());
		this.setFinished(token.getFinished());
		this.setKey(PasswordUtils.getKey(token));
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

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getNewPassword() {
		return newPassword;
	}

	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}

	public String getRepeatedPassword() {
		return repeatedPassword;
	}

	public void setRepeatedPassword(String repeatedPassword) {
		this.repeatedPassword = repeatedPassword;
	}

	public Boolean getVisible() {
		return visible;
	}

	public void setVisible(Boolean visible) {
		this.visible = visible;
	}
	
}
