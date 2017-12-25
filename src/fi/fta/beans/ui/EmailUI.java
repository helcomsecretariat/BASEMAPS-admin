package fi.fta.beans.ui;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

public class EmailUI extends IdUI
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7344089746289693585L;
	
	@NotBlank(message = "msg.validation.required")
	@Email(message = "msg.validation.email")
	private String email;
	
	
	public EmailUI()
	{}
	
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
}
