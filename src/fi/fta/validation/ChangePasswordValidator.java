package fi.fta.validation;

import java.util.List;

import org.hibernate.HibernateException;

import fi.fta.beans.ui.ChangePasswordUI;
import fi.fta.model.SiteModel;
import fi.fta.utils.Util;

public class ChangePasswordValidator extends ClassStructureAssessor
{
	
	private SiteModel model;
	
	public ChangePasswordValidator(SiteModel model)
	{
		this.model = model;
	}
	
	public List<ValidationMessage> validate(ChangePasswordUI target) throws HibernateException
	{
		List<ValidationMessage> validations = super.validate(target);
		if (validations.isEmpty())
		{
			if (!model.checkPassword(target.getOldPassword()))
			{
				validations.add(ValidationMessage.simple("msg.validation.password", "oldPassword"));
			}
			else if (!Util.isTrue(target.getShowPassword()))
			{
				if (Util.isEmptyString(target.getRepeatPassword()))
				{
					validations.add(ValidationMessage.simple("msg.validation.required", "repeatPassword"));
				}
				else if (target.getNewPassword().equals(target.getRepeatPassword()))
				{
					validations.add(ValidationMessage.simple("msg.validation.repeat.password", "repeatPassword"));
				}
			}
		}
		return validations;
	}
	
}
