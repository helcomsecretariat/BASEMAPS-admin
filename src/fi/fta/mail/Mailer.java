package fi.fta.mail;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.mail.Authenticator;
import javax.mail.BodyPart;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.internet.AddressException;

import fi.fta.beans.MailSettingsFacade;
import fi.fta.beans.MailType;
import fi.fta.utils.ProjectProperties;
import fi.fta.utils.Util;


public class Mailer
{
	
	protected static Map<String, Map<Integer, Mailer>> instances;
	
	protected Session session;
	
	protected MailSettingsFacade settings;
	
	protected MailerQueue queue;
	
	protected volatile Thread thread;
	
	protected Mailer(MailSettingsFacade s)
	{
		Properties p = new Properties();
		p.put("mail.transport.protocol", "smtp");
		p.put("mail.host", s.getSmtpServer());
		p.put("mail.smtp.host", s.getSmtpServer());
		p.put("mail.smtp.localhost", s.getSmtpServer());
		if (s.getSmtpPort() != null)
		{
			p.put("mail.port", s.getSmtpPort());
			p.put("mail.smtp.port", s.getSmtpPort());
		}
		
		if (!Util.isEmptyString(s.getSmtpUser()))
		{
			p.put("mail.starttls.enable", "true");
            p.put("mail.smtp.starttls.enable", "true");
            p.put("mail.auth", "true");
            p.put("mail.smtp.auth", "true");
			this.session = Session.getInstance(p, new SimpleAuthenticator(s.getSmtpUser(), s.getSmtpPassword()));
		}
		else
		{
			this.session = Session.getInstance(p);
		}
		this.settings = s;
		this.queue = MailerQueue.createRuntimeDependingQueue();
	}
	
	public static Mailer get(MailSettingsFacade s)
	{
		if (instances == null)
			instances = new HashMap<String, Map<Integer, Mailer>>();
		
		if (instances.get(s.getSmtpServer()) == null)
			instances.put(s.getSmtpServer(), new HashMap<Integer, Mailer>());
		
		if (instances.get(s.getSmtpServer()).get(s.getSmtpPort()) == null)
			instances.get(s.getSmtpServer()).put(s.getSmtpPort(), new Mailer(s));
		
		return instances.get(s.getSmtpServer()).get(s.getSmtpPort());
	}
	
	public static Mailer getInstance()
	{
		return Mailer.get(ProjectProperties.getInstance());
	}
	
	protected boolean started()
	{
		return thread != null && thread.isAlive();
	}
	
	protected void start()
	{
		thread = new Thread(new MailerSender(this.session, this.settings, this.queue));
		thread.start();
	}
	
	public void queue(
		MailType type, Short priority,
		String to, String subject, String text, String from, String replyTo, List<BodyPart> multiparts)
	{
		try
		{
			this.queue.put(priority, new MailMessage(
				type.getContentType(), priority,
				to, subject, text, from, replyTo, multiparts));
		}
		catch (AddressException ex)
		{
			ex.printStackTrace();
		}
		if (!this.started())
		{
			this.start();
		}
	}
	
	public void queue(
		MailType type, Short priority, 
		List<String> to, String subject, String text, String from, String replyTo, List<BodyPart> multiparts)
	{
		for (String t : to)
		{
			try
			{
				this.queue.put(priority, new MailMessage(
					type.getContentType(), priority,
					t, subject, text, from, replyTo, multiparts));
			}
			catch (AddressException ex)
			{
				ex.printStackTrace();
			}
			if (!this.started())
			{
				this.start();
			}
		}
	}
	
	public void queueHtml(Short priority, String to, String subject, String text, String from)
	{
		this.queue(MailType.HTML, priority, to, subject, text, from, null, null);
	}
	
	public void queueHtml(String to, String subject, String text, String from)
	{
		this.queueHtml(MailMessage.NORMAL_PRIORITY, to, subject, text, from);
	}
	
	public void finishQueue()
	{
		this.queue.end();
		this.queue = MailerQueue.createRuntimeDependingQueue();
		this.thread = null;
	}
	
	private static class SimpleAuthenticator extends Authenticator
	{
		private String user = null;
		private String password = null;
		
		public SimpleAuthenticator(String user, String password)
		{
			this.user = user;
			this.password = password;
		}
		
		public PasswordAuthentication getPasswordAuthentication()
		{
			return new PasswordAuthentication(user, password);
		}
		
	}
	
}
