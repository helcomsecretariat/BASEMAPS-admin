package fi.fta.mail;

import java.util.List;

import javax.mail.BodyPart;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;

import fi.fta.utils.Encoding;
import fi.fta.utils.Util;

public class MailMessage
{
	
	public static final short FIRST_PRIORITY = 1;
	public static final short NORMAL_PRIORITY = 3;
	public static final short LAST_PRIORITY = 4;
	
	
	protected String contentType;
	
	protected String encoding;
	
	protected Short priority;
	
	protected InternetAddress to;
	
	protected String subject;
	
	protected String text;
	
	protected InternetAddress from;
	
	protected InternetAddress replyTo;
	
	protected List<BodyPart> multiparts;
	
	
	public MailMessage(String contentType, String encoding, Short priority,
		String to, String subject, String text, String from, String replyTo, List<BodyPart> multiparts) throws AddressException
	{
		this.contentType = contentType;
		this.setEncoding(encoding);
		this.setPriority(priority);
		this.setTo(to);
		this.subject = subject == null ? "" : subject;
		this.text = text;
		this.setFrom(from);
		this.setReplyTo(replyTo);
		this.multiparts = multiparts;
	}
	
	public MailMessage(String contentType, Short priority,
		String to, String subject, String text, String from, String replyTo, List<BodyPart> multiparts) throws AddressException
	{
		this.contentType = contentType;
		this.encoding = Encoding.DEFAULT_ENCODING;
		this.setPriority(priority);
		this.setTo(to);
		this.subject = subject == null ? "" : subject;
		this.text = text;
		this.setFrom(from);
		this.setReplyTo(replyTo);
		this.multiparts = multiparts;
	}
	
	public String getContentType()
	{
		return contentType;
	}
	
	public void setContentType(String contentType)
	{
		this.contentType = contentType;
	}
	
	public String getEncoding()
	{
		return encoding;
	}
	
	public void setEncoding(String encoding)
	{
		if (Util.isEmpty(encoding))
			this.encoding = Encoding.DEFAULT_ENCODING;
		else
			this.encoding = encoding;
	}
	
	public Short getPriority()
	{
		return priority;
	}

	public void setPriority(Short priority)
	{
		this.priority = priority != null ? priority : MailMessage.NORMAL_PRIORITY;
	}

	public InternetAddress getTo()
	{
		return to;
	}
	
	public void setTo(String to) throws AddressException
	{
		if (Util.isEmpty(to))
			this.to = null;
		else
			this.to = InternetAddress.parse(to)[0];
	}
	
	public void setTo(InternetAddress to)
	{
		this.to = to;
	}
	
	public String getSubject()
	{
		return subject;
	}
	
	public void setSubject(String subject)
	{
		this.subject = subject;
	}
	
	public String getText()
	{
		return text;
	}
	
	public void setText(String text)
	{
		this.text = text;
	}
	
	public InternetAddress getFrom()
	{
		return from;
	}
	
	public void setFrom(InternetAddress from)
	{
		this.from = from;
	}
	
	public void setFrom(String from) throws AddressException
	{
		if (Util.isEmpty(from))
			this.from = null;
		else
			this.from = InternetAddress.parse(from)[0];
	}
	
	public InternetAddress getReplyTo()
	{
		return replyTo;
	}
	
	public void setReplyTo(String replyTo) throws AddressException
	{
		if (Util.isEmpty(replyTo))
			this.replyTo = null;
		else
			this.replyTo = InternetAddress.parse(replyTo)[0];
	}
	
	public void setReplyTo(InternetAddress replyTo)
	{
		this.replyTo = replyTo;
	}
	
	public List<BodyPart> getMultiparts()
	{
		return multiparts;
	}
	
	public void setMultiparts(List<BodyPart> multiparts)
	{
		this.multiparts = multiparts;
	}
	
}
