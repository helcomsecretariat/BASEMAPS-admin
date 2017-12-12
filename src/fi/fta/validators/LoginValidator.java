package fi.fta.validators;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

import fi.fta.beans.User;
import fi.fta.model.SiteUserModel;

public class LoginValidator implements Validator
{
	
	private SiteUserModel model;
	
	public LoginValidator(SiteUserModel model)
	{
		this.model = model;
	}
	
	public boolean supports(Class<?> arg0)
	{
		return User.class.isAssignableFrom(arg0);
	}
	
	public void validate(Object o, Errors err)
	{
		ValidationUtils.rejectIfEmptyOrWhitespace(err, "name", "required");
		ValidationUtils.rejectIfEmptyOrWhitespace(err, "password", "required");
		
		if (!err.hasErrors())
		{
			User u = (User)o;
			User user = this.login(u);
			if (user != null)
			{
				model.login(user);
			}
			else
			{
				err.rejectValue("password", "notValid");
			}	
		}
	}
	
	protected User login(User u)
	{
		/*
		try
		{
			
		}
		catch (RemoteException ex)
		{
			ex.printStackTrace();
		}*/
		return null;
	}
	
}
