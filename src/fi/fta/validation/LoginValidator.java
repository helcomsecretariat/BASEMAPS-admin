package fi.fta.validation;

import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.User;
import fi.fta.beans.ui.LoginUI;
import fi.fta.data.dao.UserDAO;
import fi.fta.model.SiteModel;

public class LoginValidator extends ClassStructureAssessor
{
	
	private SiteModel model;
	
	public LoginValidator(SiteModel model)
	{
		this.model = model;
	}
	
	public List<ValidationMessage> validate(LoginUI target) throws HibernateException
	{
		List<ValidationMessage> validations = super.validate(target);
		if (validations.isEmpty())
		{
			User u = new UserDAO().login(target);
			if (u != null)
			{
				model.login(u);
			}
			else
			{
				validations.add(ValidationMessage.simple("password", "msg.validation.password"));
			}
		}
		return validations;
	}
	
}
