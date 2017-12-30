package fi.fta.beans.ui;

import org.hibernate.validator.constraints.Email;
import org.hibernate.validator.constraints.NotBlank;

import fi.fta.beans.EmailBean;

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
	
	public EmailUI(EmailBean bean)
	{
		super(bean);
		this.setEmail(bean.getEmail());
	}
	
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
}
