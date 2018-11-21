package fi.fta.velocity;

import fi.fta.beans.MailType;

public class MailContentTemplate extends VelocityTemplate
{
	
	public MailContentTemplate(MailType type, String name)
	{
		super("mail/" + type.getType() + "/content/" + name);
	}
	
	public MailContentTemplate(String name)
	{
		this(MailType.HTML, name);
	}
	
}
