package fi.fta.beans.ui;

import org.hibernate.validator.constraints.NotBlank;

public class LoginUI extends EmailUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 3943592777559019712L;
	
	
	@NotBlank(message = "msg.validation.required")
	private String password;
	
	
	public LoginUI()
	{}
	
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}
	
}
