package fi.fta.beans.ui;

import java.io.Serializable;

import org.hibernate.validator.constraints.NotBlank;

public class ChangePasswordUI implements Serializable
{

	/**
	 * 
	 */
	private static final long serialVersionUID = 3662950713771635690L;
	
	@NotBlank(message = "msg.validation.required")
	private String oldPassword;
	
	@NotBlank(message = "msg.validation.required")
	private String newPassword;
	
	private String repeatPassword;
	
	private Boolean showPassword;
	
	
	public ChangePasswordUI()
	{}
	
	public String getOldPassword() {
		return oldPassword;
	}

	public void setOldPassword(String oldPassword) {
		this.oldPassword = oldPassword;
	}

	public String getNewPassword() {
		return newPassword;
	}

	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}

	public String getRepeatPassword() {
		return repeatPassword;
	}

	public void setRepeatPassword(String repeatPassword) {
		this.repeatPassword = repeatPassword;
	}

	public Boolean getShowPassword() {
		return showPassword;
	}

	public void setShowPassword(Boolean showPassword) {
		this.showPassword = showPassword;
	}
	
}
