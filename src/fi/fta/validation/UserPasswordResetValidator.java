package fi.fta.validation;

import java.util.List;

import fi.fta.beans.PasswordResetToken;
import fi.fta.beans.ui.PasswordResetTokenUI;
import fi.fta.utils.PasswordUtils;
import fi.fta.utils.Util;

public class UserPasswordResetValidator extends ClassStructureAssessor
{
	
	private PasswordResetToken token;
	
	public UserPasswordResetValidator(PasswordResetToken token)
	{
		this.token = token;
	}
	
	public List<ValidationMessage> validate(PasswordResetTokenUI target)
	{
		List<ValidationMessage> validations = super.validate(target);
		if (validations.isEmpty())
		{
			if (token != null)
			{
				if (!PasswordUtils.validate(PasswordUtils.decodeKey(target.getKey()).getSecond(), token) || !token.valid())
				{
					validations.add(new ValidationMessage(
						"msg.validation.password.reset.notValid", new ValidationField("newPassword")));
				}
				else if (!Util.isTrue(target.getVisible()))
				{
					if (Util.isEmptyString(target.getRepeatedPassword()))
					{
						validations.add(new ValidationMessage(
							"msg.validation.password.empty.repeatedPassword", new ValidationField("repeatedPassword")));
					}
					else if (!target.getNewPassword().equals(target.getRepeatedPassword()))
					{
						validations.add(new ValidationMessage(
							"msg.validation.password.passwordDoesNotMatch", new ValidationField("newPassword")));
					}
				}
			}
			else
			{
				validations.add(new ValidationMessage(
					"msg.validation.password.reset.notValid", new ValidationField("newPassword")));
			}
		}
		return validations;
	}
	
}
