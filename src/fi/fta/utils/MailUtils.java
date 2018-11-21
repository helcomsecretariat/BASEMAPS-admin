package fi.fta.utils;

import fi.fta.beans.User;
import fi.fta.mail.Mailer;
import fi.fta.velocity.BasemapsMailTemplate;
import fi.fta.velocity.MailContentTemplate;

public class MailUtils
{
	
	public static void remind(User user)
	{
		String subject = ResourceUtils.getMessage("mail.subject.reminder");
		MailContentTemplate content = new MailContentTemplate("Reminder");
		content.set("user", user);
		BasemapsMailTemplate mail = new BasemapsMailTemplate();
		mail.setTitle(subject);
		mail.setContent(content.render());
		
		Mailer.getInstance().queueHtml(
			user.getEmail(), subject, mail.render(), ProjectProperties.getInstance().getEmailAdmin());
	}
	
}
